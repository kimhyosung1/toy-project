import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationModule as SharedNotificationModule } from '@app/notification';
import { GlobalExceptionFilter } from '@app/core/filter';
import { CustomConfigModule } from '@app/core/config/config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`env/${process.env.NODE_ENV || 'dev'}.env`],
      isGlobal: true,
    }),
    CustomConfigModule, // CustomConfigService 제공을 위해 추가
    SharedNotificationModule,
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    {
      provide: APP_FILTER,
      useFactory: () => {
        // Notification 앱에서는 자체적으로 알림을 처리하므로 Slack 핸들러 없음
        return new GlobalExceptionFilter('notification', null);
      },
    },
  ],
})
export class NotificationModule {}
