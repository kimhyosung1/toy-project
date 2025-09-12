import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DatabaseService } from '@app/database';
import { SlackService, SentryService } from '@app/notification';

@Injectable()
export class BoardSchedulerService {
  constructor(
    private readonly slackService: SlackService,
    private readonly sentryService: SentryService,
    private readonly databaseService: DatabaseService,
  ) {}

  async testScheduler(): Promise<void> {
    console.log('testScheduler 실행');
  }
}
