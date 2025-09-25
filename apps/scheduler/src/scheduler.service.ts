import { Injectable } from '@nestjs/common';
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
import { CommonNotificationService } from '@app/common';
import {
  NotificationLevelEnum,
  SentryLevel,
} from '@app/common/notification/enums';

@Injectable()
export class SchedulerService {
  private readonly SEOUL_TIME_ZONE = 'Asia/Seoul';

  constructor(
    private readonly configService: CustomConfigService,
    private readonly utilityService: UtilityService,
    private readonly boardSchedulerService: BoardSchedulerService,
    private readonly notification: CommonNotificationService, // 🌐 공통 알림 서비스
  ) {}

  @Cron(CustomCronExpression.EVERY_SECOND, {
    timeZone: 'Asia/Seoul',
  })
  async testScheduler() {
    try {
      // BoardSchedulerService에서 로그를 처리하므로 여기서는 제거
      await this.boardSchedulerService.testScheduler();
    } catch (error) {
      // 🌐 간단한 알림 전송 - sendAlert 내부에서 모든 예외 처리됨
      const notificationResult = await this.notification.sendNotifications({
        message: `🚨 스케줄러 작업 실패: testScheduler\n에러: ${error.message}`,
        level: NotificationLevelEnum.ERROR,
        context: {
          scheduler: 'testScheduler',
          error: error.stack,
          timestamp: new Date().toISOString(),
        },
        slack: { channel: '#scheduler-alerts', emoji: '🚨' },
        emails: [
          {
            to: 'admin@company.com',
            subject: '[긴급] 스케줄러 작업 실패',
            body: `관리자님께 긴급 알림입니다.\n\n스케줄러 작업에서 오류가 발생했습니다.\n\n에러: ${error.message}\n시간: ${new Date().toISOString()}\n\n즉시 확인 부탁드립니다.`,
          },
          {
            to: 'dev-team@company.com',
            subject: '[개발팀] 스케줄러 에러',
            body: `개발팀께 알림드립니다.\n\n에러: ${error.message}\n스택: ${error.stack}\n\n로그를 확인해 주세요.`,
          },
        ],
        sentry: {
          level: SentryLevel.ERROR,
          tags: { service: 'scheduler', job: 'testScheduler' },
          extra: { errorStack: error.stack },
        },
      });

      // 📊 알림 결과 간단 로깅
      if (notificationResult.success) {
        console.log(
          `📤 에러 알림 전송 성공: ${notificationResult.successCount}개`,
        );
      } else {
        console.log(`⚠️ 에러 알림 전송 실패: ${notificationResult.error}`);
      }

      // 🎯 원본 스케줄러 에러를 그대로 throw
      throw error;
    }
  }

  /**
   * 🚀 스케줄러 상태 알림
   */
  async notifySchedulerStatus() {
    // 🌐 간단한 알림 전송 - sendAlert 내부에서 모든 예외 처리됨
    const result = await this.notification.sendNotifications({
      message: '🕒 스케줄러 서비스가 정상 작동 중입니다.',
      level: NotificationLevelEnum.INFO,
      slack: { channel: '#scheduler-status', emoji: '🕒' },
    });

    // 📊 결과 간단 로깅 (선택적)
    if (result.success) {
      console.log('📤 상태 알림 전송 성공');
    } else {
      console.log(`⚠️ 상태 알림 전송 실패: ${result.error}`);
    }
  }
}
