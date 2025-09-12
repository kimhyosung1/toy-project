import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DatabaseService } from '@app/database';
import { SlackService, SentryService } from '@app/notification';
import { SchedulerLoggerService } from '../common/logger.service';

@Injectable()
export class BoardSchedulerService {
  constructor(
    private readonly logger: SchedulerLoggerService,
    private readonly slackService: SlackService,
    private readonly sentryService: SentryService,
    private readonly databaseService: DatabaseService,
  ) {}

  async testScheduler(): Promise<void> {
    const startTime = Date.now();
    try {
      this.logger.logSchedulerStart('testScheduler', 'EVERY_SECOND');

      // 여기에 실제 스케줄러 로직을 추가하세요
      // 예시: await this.processBoardData();

      const duration = Date.now() - startTime;
      this.logger.logSchedulerComplete('testScheduler', duration);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.logSchedulerError('testScheduler', error as Error, duration);
      throw error;
    }
  }
}
