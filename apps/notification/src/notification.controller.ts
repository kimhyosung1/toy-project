import { Controller, Get, Post, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';

/**
 * 📱 간소화된 알림 컨트롤러
 *
 * 단순한 요청/응답 구조로 통일
 */
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('/health')
  healthCheck() {
    return this.notificationService.healthCheck();
  }

  /**
   * 📦 Bulk 알림 처리 - 500개씩 배치로 처리
   */
  @Post('/bulk')
  async sendBulk(
    @Body()
    body: {
      notifications: Array<{
        type: 'slack' | 'email' | 'sentry';
        message: string;
        options?: any;
      }>;
      batchId?: string;
    },
  ) {
    return this.notificationService.sendBulk(body.notifications, body.batchId);
  }
}
