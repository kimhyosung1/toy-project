import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { NotificationService } from './notification.service';
import { RedisQueueName } from 'libs/common/src/constants';

@Processor(RedisQueueName.KEYWORD_NOTIFICATIONS)
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Process('*') // 모든 작업 패턴을 처리
  async processNotification(job: Job<any>): Promise<void> {
    try {
      this.logger.log(
        `[알림 프로세서] ${job.name} 작업 처리 시작 (ID: ${job.id})`,
      );

      console.log('job.data', job.data);
      // redis queue에 담긴 데이터를 받아 DB 정보 적재 및 갱신 , 알림발송처리, 단일저장시 DB IO 최소화 방법 찾기
    } catch (error) {
      this.logger.error(
        `[알림 프로세서] 작업 처리 중 오류: ${error.message}`,
        error.stack,
      );
      throw error; // Bull이 재시도 처리하도록 오류 전파
    }
  }
}
