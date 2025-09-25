import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { SlackService } from './services/slack.service';
import { SentryService } from './services/sentry.service';
import { CustomConfigModule } from '@app/core/config/config.module';
import { ResponseOnlyInterceptorModule } from '@app/common';

@Module({
  imports: [
    CustomConfigModule, // 🔧 통일된 환경 설정 사용
    ResponseOnlyInterceptorModule, // 🔄 응답 데이터 검증/변환만 수행
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    SlackService, // 🔧 통합된 Slack 서비스
    SentryService, // 🔧 통합된 Sentry 서비스
  ],
})
export class NotificationModule {}
