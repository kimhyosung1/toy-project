import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';
import { DatabaseModule } from '@app/database';
import { UtilityModule } from '@app/utility';
import { InterceptorModule } from '@app/common';
import { NotificationModule } from '@app/notification';
import { GlobalExceptionFilter } from '@app/core';
import { CustomConfigModule } from '@app/core/config/config.module';

// 도메인별 스케줄러 서비스들
import { BoardSchedulerService } from './board/board-scheduler.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`env/${process.env.NODE_ENV || 'dev'}.env`],
      isGlobal: true,
    }),
    CustomConfigModule, // CustomConfigService 제공을 위해 추가
    ScheduleModule.forRoot(), // 스케줄링 기능 활성화
    DatabaseModule,
    UtilityModule,
    InterceptorModule,
    NotificationModule,
  ],
  controllers: [SchedulerController],
  providers: [
    SchedulerService,
    BoardSchedulerService,
    {
      provide: APP_FILTER,
      useFactory: () => {
        // Scheduler 앱을 위한 간단한 Slack 알림 핸들러
        const slackNotificationHandler = async (
          errorType: string,
          message: string,
          exception: any,
          context?: any,
        ) => {
          const errorMessage =
            `🚨 **스케줄러 에러 발생**\n` +
            `• 에러 타입: ${errorType}\n` +
            `• 메시지: ${message}\n` +
            `• 발생시간: ${new Date().toISOString()}\n` +
            (context?.serviceName ? `• 서비스: ${context.serviceName}\n` : '') +
            (exception?.stack
              ? `• 스택트레이스:\n\`\`\`\n${exception.stack}\n\`\`\``
              : '');

          // 환경변수에서 직접 Slack 웹훅 호출
          const webhookUrl = process.env.SLACK_WEBHOOK_URL;
          if (webhookUrl) {
            try {
              await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  text: errorMessage,
                  channel: '#scheduler-alerts',
                  username: 'Scheduler Bot',
                  icon_emoji: ':warning:',
                }),
              });
            } catch (error) {
              console.error('Slack 알림 전송 실패:', error);
            }
          }
        };

        return new GlobalExceptionFilter('scheduler', slackNotificationHandler);
      },
    },
  ],
})
export class SchedulerModule {}
