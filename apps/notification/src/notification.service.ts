import { Injectable } from '@nestjs/common';
import { SlackService, SentryService } from '@app/notification';

/**
 * 간단하고 깔끔한 알림 서비스
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
   * ✅ 성공 알림 전송
   */
  async sendSuccess(message: string): Promise<{ success: boolean }> {
    const success = await this.slackService.sendSuccess(message);
    return { success };
  }

  /**
   * ⚠️ 경고 알림 전송
   */
  async sendWarning(message: string): Promise<{ success: boolean }> {
    const success = await this.slackService.sendWarning(message);
    return { success };
  }

  /**
   * 📝 Sentry 메시지 리포팅
   */
  async sendSentry(
    message: string,
    level: 'info' | 'warning' | 'error' = 'info',
  ): Promise<{ success: boolean }> {
    const success = await this.sentryService.reportMessage(message, level);
    return { success };
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
