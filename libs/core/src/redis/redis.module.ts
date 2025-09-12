import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CustomConfigModule } from '../config/config.module';
import { CustomConfigService } from '../config/config.service';
import { RedisQueueName } from '@app/common/constants';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [CustomConfigModule],
      useFactory: (configService: CustomConfigService) => ({
        redis: {
          host: 'localhost', // Redis 호스트, 실제 환경에서는 configService에서 가져오도록 수정
          port: 6379, // Redis 포트, 실제 환경에서는 configService에서 가져오도록 수정
        },
      }),
      inject: [CustomConfigService],
    }),
    BullModule.registerQueue({
      name: RedisQueueName.NOTIFICATIONS,
    }),
  ],
  exports: [BullModule],
})
export class RedisModule {}
