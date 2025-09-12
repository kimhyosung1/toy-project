import { Controller, Get, Post, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('/health')
  healthCheck() {
    return this.notificationService.healthCheck();
  }

  /**
   * 📱 Slack 메시지 전송
   */
  @Post('/slack')
  async sendSlack(@Body() body: { message: string; channel?: string }) {
    return this.notificationService.sendSlack(body.message, body.channel);
  }

  /**
   * 🚨 Slack 에러 알림 전송
   */
  @Post('/slack/error')
  async sendSlackError(@Body() body: { message: string; context?: any }) {
    return this.notificationService.sendSlackError(body.message, body.context);
  }

  /**
   * 🚨 Sentry 에러 리포팅
   */
  @Post('/sentry/error')
  async sendSentryError(@Body() body: { message: string; context?: any }) {
    return this.notificationService.sendSentryError(body.message, body.context);
  }

  /**
   * ✅ 성공 알림 전송
   */
  @Post('/success')
  async sendSuccess(@Body() body: { message: string }) {
    return this.notificationService.sendSuccess(body.message);
  }

  /**
   * ⚠️ 경고 알림 전송
   */
  @Post('/warning')
  async sendWarning(@Body() body: { message: string }) {
    return this.notificationService.sendWarning(body.message);
  }

  /**
   * 📝 Sentry 메시지 리포팅
   */
  @Post('/sentry')
  async sendSentry(
    @Body() body: { message: string; level?: 'info' | 'warning' | 'error' },
  ) {
    return this.notificationService.sendSentry(body.message, body.level);
  }
}
