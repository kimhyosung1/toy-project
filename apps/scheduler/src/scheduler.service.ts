import { Injectable, Logger } from '@nestjs/common';
import { Cron, SchedulerRegistry, Timeout, Interval } from '@nestjs/schedule';
import { UtilityService } from '@app/utility';
import {
  CustomCronExpression,
  CustomMsCronExpression,
  Environment,
  SchedulerJobType,
} from '@app/common/constants';
import { BoardSchedulerService } from './board/board-scheduler.service';
import { CustomConfigService } from '@app/core';

@Injectable()
export class SchedulerService {
  private readonly SEOUL_TIME_ZONE = 'Asia/Seoul';

  constructor(
    private readonly configService: CustomConfigService,
    private readonly utilityService: UtilityService,
    private readonly boardSchedulerService: BoardSchedulerService,
  ) {}

  @Cron(CustomCronExpression.EVERY_SECOND, {
    timeZone: 'Asia/Seoul',
  })
  async testScheduler() {
    // BoardSchedulerService에서 로그를 처리하므로 여기서는 제거
    await this.boardSchedulerService.testScheduler();
  }
}
