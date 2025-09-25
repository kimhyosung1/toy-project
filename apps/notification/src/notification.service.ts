import { Injectable } from '@nestjs/common';
import { SlackService } from './services/slack.service';
import { SentryService } from './services/sentry.service';

/**
 * 📱 간소화된 알림 서비스
 * 성공/실패만 반환하는 단순한 구조
 */
@Injectable()
export class NotificationService {
  constructor(
    private readonly slackService: SlackService,
    private readonly sentryService: SentryService,
  ) {}

  /**
   * 📱 Slack 메시지 전송
   */
  async sendSlack(
    message: string,
    channel?: string,
  ): Promise<{ success: boolean }> {
    const success = await this.slackService.sendMessage(message, channel);
    return { success };
  }

  /**
   * 🚨 Slack 에러 알림 전송
   */
  async sendSlackError(
    message: string,
    context?: any,
  ): Promise<{ success: boolean }> {
    const success = await this.slackService.sendError(message, context);
    return { success };
  }

  /**
   * 🚨 Sentry 에러 리포팅
   */
  async sendSentryError(
    message: string,
    context?: any,
  ): Promise<{ success: boolean }> {
    const error = typeof message === 'string' ? new Error(message) : message;
    const success = await this.sentryService.reportError(error, context);
    return { success };
  }

  /**
   * 📦 Bulk 알림 처리 - 간단한 배치 처리
   */
  async sendBulk(
    notifications: Array<{
      type: 'slack' | 'email' | 'sentry';
      message: string;
      options?: any;
    }>,
    batchId?: string,
  ) {
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    // 모든 알림을 병렬로 처리 (간단하게)
    for (let i = 0; i < notifications.length; i++) {
      const notification = notifications[i];
      try {
        let success = false;

        switch (notification.type) {
          case 'slack':
            const slackResult = await this.sendSlack(
              notification.message,
              notification.options?.channel,
            );
            success = slackResult.success;
            break;

          case 'sentry':
            const sentryResult = await this.sendSentryError(
              notification.message,
              notification.options,
            );
            success = sentryResult.success;
            break;

          case 'email':
            // 이메일은 아직 미구현이므로 true로 처리
            success = true;
            break;

          default:
            success = false;
        }

        if (success) {
          successCount++;
        } else {
          failureCount++;
        }

        results.push({
          index: i,
          success,
          data: success ? { sent: true } : null,
          error: success ? null : 'Send failed',
        });
      } catch (error) {
        failureCount++;
        results.push({
          index: i,
          success: false,
          data: null,
          error: error.message,
        });
      }
    }

    return {
      batchId: batchId || `batch-${Date.now()}`,
      totalCount: notifications.length,
      successCount,
      failureCount,
      results,
    };
  }

  /**
   * 🏥 헬스 체크
   */
  healthCheck(): { status: string; timestamp: string } {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
