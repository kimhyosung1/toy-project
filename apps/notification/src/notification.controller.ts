import { Controller, Get, Logger } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { CustomMessagePatterns } from '@app/proxy/common-proxy-client';

@Controller()
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @MessagePattern(CustomMessagePatterns.NotificationHealthCheck)
  healthCheck(): string {
    return this.notificationService.healthCheck();
  }

  /**
   * 키워드 매칭 이벤트 수신 핸들러
   * Board 서비스가 발행한 키워드 매칭 이벤트를 수신하여 알림 처리
   */
  @EventPattern('keyword.matched')
  async handleKeywordMatched(@Payload() data: any): Promise<void> {
    try {
      this.logger.log(
        `[알림 이벤트] 키워드 매칭 이벤트 수신: ${data.keywordMatches.length}개 매치`,
      );

      // 키워드 매치를 알림 큐에 추가 - 비동기 처리 (await 제거)
      this.notificationService.addKeywordMatchesQueue(
        data.sourceType,
        data.sourceId,
        data.title,
        data.content,
        data.keywordMatches,
        data.timestamp,
      );

      this.logger.log(
        '[알림 이벤트] 키워드 매칭 이벤트 처리 요청 완료 (비동기 처리 중)',
      );
    } catch (error) {
      this.logger.error(
        `[알림 이벤트] 키워드 매칭 이벤트 처리 중 오류: ${error.message}`,
        error.stack,
      );
    }
  }
}
