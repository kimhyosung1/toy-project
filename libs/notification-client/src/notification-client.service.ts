import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface SlackNotificationRequest {
  message: string;
  channel?: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

export interface SentryNotificationRequest {
  message: string;
  level?: 'debug' | 'info' | 'warning' | 'error' | 'fatal';
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}

export interface EmailNotificationRequest {
  to: string;
  subject: string;
  body: string;
  format?: 'text' | 'html';
  cc?: string;
  bcc?: string;
}

export interface WebhookNotificationRequest {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  payload: Record<string, any>;
}

export interface NotificationResponse {
  success: boolean;
  notificationId: string;
  message?: string;
}

export interface NotificationStatus {
  notificationId: string;
  status: 'pending' | 'sent' | 'failed' | 'scheduled';
  createdAt: string;
  sentAt?: string;
  error?: string;
}

/**
 * 다른 앱에서 Notification 서비스를 HTTP로 호출하기 위한 클라이언트
 *
 * 사용법:
 * 1. 모듈에 NotificationClientModule 임포트
 * 2. 서비스에 NotificationClientService 주입
 * 3. 간편한 메서드 호출로 알림 전송
 */
@Injectable()
export class NotificationClientService {
  private readonly logger = new Logger(NotificationClientService.name);
  private readonly httpClient: AxiosInstance;

  constructor(
    private readonly notificationServiceUrl: string = 'http://localhost:3005',
  ) {
    this.httpClient = axios.create({
      baseURL: `${notificationServiceUrl}/api/notifications`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'notification-client/1.0',
      },
    });

    // 요청 인터셉터 (로깅)
    this.httpClient.interceptors.request.use(
      (config) => {
        this.logger.debug(
          `알림 요청: ${config.method?.toUpperCase()} ${config.url}`,
        );
        return config;
      },
      (error) => {
        this.logger.error('알림 요청 에러:', error.message);
        return Promise.reject(error);
      },
    );

    // 응답 인터셉터 (에러 처리)
    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(
          `알림 응답: ${response.status} ${response.config.url}`,
        );
        return response;
      },
      (error) => {
        if (error.response) {
          this.logger.error(
            `알림 서비스 에러: ${error.response.status} - ${error.response.data?.message}`,
          );
        } else if (error.request) {
          this.logger.error('알림 서비스 연결 실패: 네트워크 오류');
        } else {
          this.logger.error('알림 요청 실패:', error.message);
        }
        return Promise.reject(error);
      },
    );
  }

  /**
   * 🔥 Slack 메시지 전송 (가장 많이 사용될 메서드)
   */
  async sendSlackMessage(
    request: SlackNotificationRequest,
  ): Promise<NotificationResponse> {
    try {
      const response = await this.httpClient.post('/slack', request);
      return response.data;
    } catch (error) {
      throw new Error(
        `Slack 알림 전송 실패: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * 🚨 Sentry 에러 전송
   */
  async sendSentryError(
    request: SentryNotificationRequest,
  ): Promise<NotificationResponse> {
    try {
      const response = await this.httpClient.post('/sentry', request);
      return response.data;
    } catch (error) {
      throw new Error(
        `Sentry 알림 전송 실패: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * 📧 이메일 전송
   */
  async sendEmail(
    request: EmailNotificationRequest,
  ): Promise<NotificationResponse> {
    try {
      const response = await this.httpClient.post('/send', {
        type: 'email',
        data: request,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `이메일 알림 전송 실패: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * 🔗 웹훅 전송
   */
  async sendWebhook(
    request: WebhookNotificationRequest,
  ): Promise<NotificationResponse> {
    try {
      const response = await this.httpClient.post('/send', {
        type: 'webhook',
        data: request,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `웹훅 알림 전송 실패: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * 📦 배치 알림 전송 (여러 알림을 한번에)
   */
  async sendBulkNotifications(notifications: any[]): Promise<any> {
    try {
      const response = await this.httpClient.post('/send/bulk', {
        notifications,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `배치 알림 전송 실패: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * 📊 알림 상태 조회
   */
  async getNotificationStatus(
    notificationId: string,
  ): Promise<NotificationStatus> {
    try {
      const response = await this.httpClient.get(`/status/${notificationId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        `알림 상태 조회 실패: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * 📈 알림 통계 조회
   */
  async getNotificationStats(period: string = '24h'): Promise<any> {
    try {
      const response = await this.httpClient.get(`/stats?period=${period}`);
      return response.data;
    } catch (error) {
      throw new Error(
        `알림 통계 조회 실패: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * 🏥 헬스 체크
   */
  async healthCheck(): Promise<{
    status: string;
    service: string;
    timestamp: string;
  }> {
    try {
      const response = await this.httpClient.get('/health');
      return response.data;
    } catch (error) {
      throw new Error(
        `헬스 체크 실패: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  // 편의 메서드들 (자주 사용될 패턴들)

  /**
   * 🚨 긴급 Slack 알림 (에러 발생 시)
   */
  async sendCriticalSlackAlert(
    message: string,
    channel?: string,
  ): Promise<NotificationResponse> {
    return this.sendSlackMessage({
      message: `🚨 **CRITICAL ALERT** 🚨\n${message}`,
      channel: channel || '#alerts',
      priority: 'critical',
    });
  }

  /**
   * ✅ 성공 Slack 알림
   */
  async sendSuccessSlackMessage(
    message: string,
    channel?: string,
  ): Promise<NotificationResponse> {
    return this.sendSlackMessage({
      message: `✅ ${message}`,
      channel,
      priority: 'normal',
    });
  }

  /**
   * ⚠️ 경고 Slack 알림
   */
  async sendWarningSlackMessage(
    message: string,
    channel?: string,
  ): Promise<NotificationResponse> {
    return this.sendSlackMessage({
      message: `⚠️ ${message}`,
      channel,
      priority: 'high',
    });
  }

  /**
   * 📊 스케줄러 작업 완료 알림
   */
  async sendSchedulerCompleteNotification(
    schedulerName: string,
    duration: number,
    details?: any,
  ): Promise<NotificationResponse> {
    const message =
      `📊 **스케줄러 작업 완료**\n` +
      `• 작업명: ${schedulerName}\n` +
      `• 실행시간: ${duration}ms\n` +
      `• 완료시간: ${new Date().toISOString()}\n` +
      (details ? `• 상세정보: ${JSON.stringify(details, null, 2)}` : '');

    return this.sendSlackMessage({
      message,
      channel: '#scheduler-logs',
      priority: 'normal',
    });
  }

  /**
   * 🚨 스케줄러 작업 실패 알림
   */
  async sendSchedulerErrorNotification(
    schedulerName: string,
    error: Error,
    duration?: number,
  ): Promise<NotificationResponse[]> {
    const message =
      `🚨 **스케줄러 작업 실패**\n` +
      `• 작업명: ${schedulerName}\n` +
      `• 에러: ${error.message}\n` +
      `• 발생시간: ${new Date().toISOString()}\n` +
      (duration ? `• 실행시간: ${duration}ms\n` : '') +
      `• 스택트레이스:\n\`\`\`\n${error.stack}\n\`\`\``;

    // Slack과 Sentry에 동시 전송
    const [slackResult, sentryResult] = await Promise.allSettled([
      this.sendCriticalSlackAlert(message, '#scheduler-alerts'),
      this.sendSentryError({
        message: `스케줄러 에러: ${schedulerName}`,
        level: 'error',
        tags: {
          scheduler_name: schedulerName,
          service: 'scheduler',
        },
        extra: {
          duration,
          error_message: error.message,
          stack_trace: error.stack,
        },
      }),
    ]);

    const results: NotificationResponse[] = [];

    if (slackResult.status === 'fulfilled') {
      results.push(slackResult.value);
    }

    if (sentryResult.status === 'fulfilled') {
      results.push(sentryResult.value);
    }

    return results;
  }

  /**
   * 🎉 서비스 시작/종료 알림
   */
  async sendServiceStatusNotification(
    serviceName: string,
    status: 'started' | 'stopped',
    port?: number,
  ): Promise<NotificationResponse> {
    const emoji = status === 'started' ? '🎉' : '👋';
    const message =
      `${emoji} **${serviceName} 서비스 ${status === 'started' ? '시작' : '종료'}**\n` +
      `• 서비스: ${serviceName}\n` +
      `• 상태: ${status}\n` +
      `• 시간: ${new Date().toISOString()}\n` +
      (port ? `• 포트: ${port}\n` : '') +
      `• 환경: ${process.env.NODE_ENV || 'unknown'}`;

    return this.sendSlackMessage({
      message,
      channel: '#service-status',
      priority: status === 'started' ? 'normal' : 'high',
    });
  }
}
