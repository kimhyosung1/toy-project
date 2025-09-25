import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CustomConfigService } from '@app/core';
import { SendNotificationsRequest, SendNotificationsResponse } from './model';
import { NotificationLevel } from './enums';
import { validate } from 'class-validator';

/**
 * 🌐 간소화된 CommonNotificationService
 *
 * 특징:
 * - sendAlert 하나로 모든 알림 처리
 * - sendMultiType 내부에서 자동으로 배열 생성 후 500개씩 청킹
 * - 완벽한 예외 처리 (절대 throw하지 않음)
 * - 실패한 알림만 긴급 Slack으로 전송
 * - 실패 데이터 구조화 로깅 (추후 DB 저장 준비)
 *
 * 🚨 실패 처리 흐름:
 * 1. 일부 알림 실패 → #notification-failures 채널로 상세 정보 전송
 * 2. 시스템 에러 → #notification-system-errors 채널로 시스템 정보 전송
 * 3. 실패 데이터 → 구조화된 로그 + 추후 DB 저장 준비
 * 4. 재처리 → 추후 스케줄러를 통한 자동 재처리 준비
 *
 * 사용법:
 * const result = await this.notification.sendAlert({
 *   message: "에러 발생",
 *   level: "error",
 *   slack: { channel: "#alerts" },
 *   emails: [
 *     { to: "admin@company.com", subject: "긴급", body: "관리자용 내용" },
 *     { to: "dev@company.com", subject: "개발팀", body: "개발팀용 내용" }
 *   ],
 *   sentry: { level: "error", tags: { service: "scheduler" } }
 * });
 *
 * // 결과 확인 (선택적)
 * if (result.success) {
 *   console.log(`성공: ${result.successCount}개`);
 * } else {
 *   console.log(`실패: ${result.error}`);
 * }
 */
@Injectable()
export class CommonNotificationService {
  // private readonly logger = new Logger(CommonNotificationService.name);

  private readonly notificationUrl: string;
  private readonly maxRetries = 3;
  private readonly timeoutMs = 5000;

  constructor(private readonly configService: CustomConfigService) {
    this.notificationUrl = this.configService.notificationServiceUrl;
  }

  /**
   * 🎯 메인 알림 메서드 - 모든 타입을 간단하게 처리 (완벽한 에러 처리)
   */
  async sendNotifications(
    request: SendNotificationsRequest,
  ): Promise<SendNotificationsResponse> {
    try {
      // 기본 검증
      if (!request.message?.trim()) {
        const error = '메시지는 필수입니다.';
        console.log(`⚠️ 알림 요청 검증 실패: ${error}`);
        return {
          success: false,
          totalCount: 0,
          successCount: 0,
          failureCount: 0,
          error,
        };
      }

      if (!request.slack && !request.emails && !request.sentry) {
        const error = '최소 하나의 알림 타입은 지정해야 합니다.';
        console.log(`⚠️ 알림 요청 검증 실패: ${error}`);
        return {
          success: false,
          totalCount: 0,
          successCount: 0,
          failureCount: 0,
          error,
        };
      }

      const errors = await validate(request);
      if (errors.length > 0) {
        return {
          success: false,
          totalCount: 0,
          successCount: 0,
          failureCount: 0,
          error: errors.map((error) => error.toString()).join(', '),
        };
      }

      // 🔄 각 타입을 배열로 변환
      const notifications = [];

      // Slack 알림 추가
      if (request.slack) {
        notifications.push({
          type: 'slack' as const,
          message: request.message,
          options: {
            channel: request.slack.channel,
            emoji: request.slack.emoji,
            username: request.slack.username,
            context: request.context,
          },
        });
      }

      // 개별 이메일 알림들 추가
      if (request.emails && request.emails.length > 0) {
        for (const email of request.emails) {
          // todo:: 이메일 내 body값이 커스텀 해야한다면 추가 파라미터 받아서 유저별 메일내용 변경 반영하기

          notifications.push({
            type: 'email' as const,
            message: email.body || request.message, // body가 없으면 기본 message 사용
            options: {
              to: email.to,
              subject: email.subject,
              cc: email.cc,
              bcc: email.bcc,
              format: email.format || 'text',
            },
          });
        }
      }

      // Sentry 알림 추가
      if (request.sentry) {
        notifications.push({
          type: 'sentry' as const,
          message: request.message,
          options: {
            level: request.sentry.level || request.level,
            tags: request.sentry.tags,
            extra: request.sentry.extra,
            context: request.context,
          },
        });
      }

      console.log(`📤 알림 전송 시작: ${notifications.length}개 타입`);

      // 🔄 500개씩 청킹하여 처리 (내부에서 모든 에러 처리)
      const result = await this.sendInChunks(notifications);

      // 🚨 실패한 알림들만 긴급 Slack으로 전송
      if (!result.success && result.failureCount > 0) {
        await this.sendFailureAlert(request, result);
      }

      // 성공/실패 여부와 관계없이 결과 반환 (에러 throw 안 함)
      return result;
    } catch (error) {
      console.error('❌ 알림 전송 중 예상치 못한 에러:', error.message);

      // 🚨 시스템 레벨 에러는 긴급 알림
      this.sendSystemErrorAlert(error.message, request).catch(() => {
        // 긴급 알림 실패해도 무시
      });

      // 📊 에러가 발생해도 결과 객체를 반환 (throw 하지 않음)
      return {
        success: false,
        totalCount: 0,
        successCount: 0,
        failureCount: 0,
        error: error.message,
      };
    }
  }

  /**
   * 🔧 500개씩 청킹하여 전송 (완벽한 에러 처리)
   */
  private async sendInChunks(notifications: any[]): Promise<{
    success: boolean;
    totalCount: number;
    successCount: number;
    failureCount: number;
    results: any[];
  }> {
    const chunkSize = 500;
    const chunks = this.chunkArray(notifications, chunkSize);

    let totalSuccessCount = 0;
    let totalFailureCount = 0;
    const allResults = [];

    // 📊 청크 처리 현황 로깅
    if (chunks.length > 1) {
      console.log(
        `📦 청킹 처리: ${chunks.length}개 청크 (각 최대 ${chunkSize}개)`,
      );
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const batchId = `batch-${Date.now()}-${i + 1}`;

      console.debug(
        `📦 청크 ${i + 1}/${chunks.length} 처리 중 (${chunk.length}개)`,
      );

      try {
        // 🚀 개별 청크 전송 (타임아웃 및 재시도 포함)
        const result = await this.sendBulkRequestWithRetry(chunk, batchId);

        if (
          result &&
          typeof result === 'object' &&
          result.successCount !== undefined
        ) {
          totalSuccessCount += result.successCount || 0;
          totalFailureCount += result.failureCount || 0;

          // 결과 배열 추가 (인덱스 오프셋 적용)
          if (result.results && Array.isArray(result.results)) {
            const adjustedResults = result.results.map((item, idx) => ({
              ...item,
              index: i * chunkSize + (item.index || idx),
            }));
            allResults.push(...adjustedResults);
          }

          console.debug(
            `✅ 청크 ${i + 1} 완료: 성공 ${result.successCount}/${chunk.length}개`,
          );
        } else {
          // 🔧 Invalid response도 에러로 처리하지만 throw 안 함
          console.error(
            `❌ 청크 ${i + 1} 응답 오류: Invalid response structure`,
          );

          for (let j = 0; j < chunk.length; j++) {
            allResults.push({
              index: i * chunkSize + j,
              success: false,
              data: null,
              error: 'Invalid response from notification service',
            });
          }
          totalFailureCount += chunk.length;
        }
      } catch (error) {
        console.error(`❌ 청크 ${i + 1} 최종 실패:`, error.message);

        // 🔧 청크 실패 시 모든 알림을 실패로 처리
        for (let j = 0; j < chunk.length; j++) {
          allResults.push({
            index: i * chunkSize + j,
            success: false,
            data: null,
            error: `청크 처리 실패: ${error.message}`,
          });
        }
        totalFailureCount += chunk.length;
      }

      // 🔄 청크 간 간격 (서버 부하 방지)
      if (i < chunks.length - 1) {
        await this.sleep(100);
      }
    }

    const overallSuccess = totalFailureCount === 0 && totalSuccessCount > 0;

    console.log(
      `📤 알림 전송 완료: 성공 ${totalSuccessCount}/${notifications.length}개 (${overallSuccess ? '✅ 전체 성공' : '⚠️ 일부 실패'})`,
    );

    return {
      success: overallSuccess,
      totalCount: notifications.length,
      successCount: totalSuccessCount,
      failureCount: totalFailureCount,
      results: allResults,
    };
  }

  /**
   * 🔧 재시도 기능이 포함된 bulk 요청
   */
  private async sendBulkRequestWithRetry(
    notifications: any[],
    batchId: string,
    attempt = 1,
  ): Promise<any> {
    try {
      return await this.sendBulkRequest(notifications, batchId);
    } catch (error) {
      console.log(
        `⚠️ 청크 전송 실패 (시도 ${attempt}/${this.maxRetries}): ${error.message}`,
      );

      // 재시도 로직
      if (attempt < this.maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000; // 1초, 2초, 4초 지수 백오프
        console.debug(`🔄 ${delay}ms 후 재시도...`);
        await this.sleep(delay);
        return this.sendBulkRequestWithRetry(
          notifications,
          batchId,
          attempt + 1,
        );
      }

      // 최종 실패
      throw new Error(`최대 재시도 횟수 초과: ${error.message}`);
    }
  }

  /**
   * 🔧 단일 bulk 요청 (기본)
   */
  private async sendBulkRequest(
    notifications: any[],
    batchId: string,
  ): Promise<any> {
    const url = `${this.notificationUrl}/api/notifications/bulk`;
    const payload = { notifications, batchId };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      console.debug(`🌐 HTTP 요청: ${url} (${notifications.length}개 알림)`);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`,
        );
      }

      const result = await response.json();

      // 응답 구조 검증
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid JSON response from notification service');
      }

      return result;
    } catch (error) {
      clearTimeout(timeoutId);

      // 에러 타입별 상세 메시지
      if (error.name === 'AbortError') {
        throw new Error(`요청 타임아웃 (${this.timeoutMs}ms 초과)`);
      } else if (error.message.includes('fetch')) {
        throw new Error(`네트워크 연결 실패: ${error.message}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * 🚨 실패한 알림들에 대한 긴급 Slack 전송
   */
  private async sendFailureAlert(
    originalRequest: any,
    result: any,
  ): Promise<void> {
    try {
      const failedAlerts = result.results?.filter((r: any) => !r.success) || [];
      const failureDetails = failedAlerts
        .slice(0, 5) // 최대 5개만 상세 표시
        .map(
          (failed: any, idx: number) =>
            `${idx + 1}. 인덱스 ${failed.index}: ${failed.error || 'Unknown error'}`,
        )
        .join('\n');

      const moreFailures =
        failedAlerts.length > 5
          ? `\n... 그 외 ${failedAlerts.length - 5}개 더 실패`
          : '';

      const alertMessage = {
        text: `🚨 알림 전송 실패 발생!`,
        channel: '#notification-failures',
        attachments: [
          {
            color: 'danger',
            fields: [
              {
                title: '📊 실패 현황',
                value: `총 ${result.totalCount}개 중 ${result.failureCount}개 실패`,
                short: true,
              },
              {
                title: '📱 원본 메시지',
                value: originalRequest.message?.substring(0, 100) + '...',
                short: true,
              },
              {
                title: '❌ 실패 상세',
                value: failureDetails + moreFailures,
                short: false,
              },
              {
                title: '🕐 발생 시간',
                value: new Date().toISOString(),
                short: true,
              },
            ],
          },
        ],
      };

      await this.sendToEmergencySlack(alertMessage);

      // 📝 실패 데이터 구조화 및 저장 준비
      const failedData = {
        timestamp: new Date().toISOString(),
        originalMessage: originalRequest.message,
        totalCount: result.totalCount,
        failureCount: result.failureCount,
        successCount: result.successCount,
        failedAlerts: failedAlerts.map((f: any) => ({
          index: f.index,
          error: f.error,
          // 추후 재처리를 위한 정보 보존
          retryData: {
            type: 'notification_retry',
            originalRequest: originalRequest,
            failedIndex: f.index,
            retryCount: 0,
            maxRetries: 3,
            nextRetryAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5분 후 재시도
          },
        })),
      };

      // 📝 현재는 로그로 출력, 추후 DB 저장 예정
      console.log('📝 실패 알림 데이터:', failedData);

      // 📝 추후 DB 저장 (현재는 준비 단계)
      await this.saveFailedNotifications(failedData);
    } catch (error) {
      console.error('❌ 실패 알림 전송 실패:', error.message);
    }
  }

  /**
   * 🚨 시스템 레벨 에러 알림
   */
  private async sendSystemErrorAlert(
    errorMessage: string,
    originalRequest: any,
  ): Promise<void> {
    try {
      const alertMessage = {
        text: `💥 CommonNotificationService 시스템 에러!`,
        channel: '#notification-system-errors',
        attachments: [
          {
            color: 'danger',
            fields: [
              {
                title: '💥 시스템 에러',
                value: errorMessage,
                short: false,
              },
              {
                title: '📱 원본 요청',
                value: JSON.stringify(originalRequest, null, 2).substring(
                  0,
                  500,
                ),
                short: false,
              },
              {
                title: '🕐 발생 시간',
                value: new Date().toISOString(),
                short: true,
              },
            ],
          },
        ],
      };

      await this.sendToEmergencySlack(alertMessage);

      // 📝 시스템 에러도 구조화된 로깅
      console.error('📝 시스템 에러 데이터 (추후 모니터링용):', {
        timestamp: new Date().toISOString(),
        errorType: 'system_error',
        errorMessage,
        originalRequest,
        stackTrace: new Error().stack,
      });
    } catch (error) {
      console.error('❌ 시스템 에러 알림 전송 실패:', error.message);
    }
  }

  /**
   * 🚨 긴급 Slack 전송 (공통)
   */
  private async sendToEmergencySlack(message: any): Promise<void> {
    try {
      const emergencyWebhook =
        'https://hooks.slack.com/services/MOCK/EMERGENCY/WEBHOOK';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3초 타임아웃

      await fetch(emergencyWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.debug('🚨 긴급 알림 전송 완료');
    } catch (emergencyError) {
      // 🛡️ 긴급 알림 실패해도 로그만 남기고 절대 throw 안 함
      console.error('❌ 긴급 알림도 실패:', emergencyError.message);
    }
  }

  /**
   * 🔧 배열 청킹
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * 😴 지연
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 🏥 헬스체크
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.notificationUrl}/api/notifications/health`,
      );
      return response.ok;
    } catch (error) {
      console.log('Notification 앱 헬스체크 실패:', error.message);
      return false;
    }
  }

  /**
   * 📝 실패 데이터 저장 (추후 DB 연동용)
   *
   * 추후 구현 예정:
   * - 실패한 알림을 DB에 저장
   * - 재처리 스케줄링
   * - 실패 통계 수집
   */
  private async saveFailedNotifications(failedData: any): Promise<void> {
    try {
      // TODO: 추후 DB 저장 로직 구현
      // await this.failedNotificationRepository.save(failedData);

      console.debug('📝 실패 데이터 저장 준비 완료 (DB 연동 대기 중)');
    } catch (error) {
      console.error('❌ 실패 데이터 저장 실패:', error.message);
    }
  }

  /**
   * 🔄 재처리 가능한 실패 데이터 조회 (추후 구현)
   */
  async getRetryableFailures(): Promise<any[]> {
    try {
      // TODO: 추후 DB에서 재처리 가능한 실패 데이터 조회
      // return await this.failedNotificationRepository.findRetryable();

      console.debug('🔄 재처리 데이터 조회 준비 완료 (DB 연동 대기 중)');
      return [];
    } catch (error) {
      console.error('❌ 재처리 데이터 조회 실패:', error.message);
      return [];
    }
  }
}
