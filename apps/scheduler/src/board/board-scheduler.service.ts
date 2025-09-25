import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DatabaseService } from '@app/database';

@Injectable()
export class BoardSchedulerService {
  constructor(private readonly databaseService: DatabaseService) {}

  async testScheduler(): Promise<void> {
    console.log('testScheduler 실행');
  }
}
