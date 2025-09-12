import { Module } from '@nestjs/common';
import { SlackService } from './services/slack.service';
import { SentryService } from './services/sentry.service';

@Module({
  providers: [SlackService, SentryService],
  exports: [SlackService, SentryService],
})
export class NotificationModule {}
