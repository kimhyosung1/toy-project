import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { DatabaseModule } from '@app/database';
import { CustomConfigModule } from '@app/core/config/config.module';
import { BullModule } from '@nestjs/bull';
import { RedisModule } from '@app/core/redis';
import { ConfigService } from '@nestjs/config';
import { CustomConfigService } from '@app/core/config';
import { RedisQueueName } from '@app/common/constants';
import { NotificationProcessor } from './notification.processor';
import { InterceptorModule } from '@app/common';
import { UtilityModule } from '@app/utility';

@Module({
  imports: [
    CustomConfigModule,
    DatabaseModule,
    RedisModule,
    InterceptorModule, // 🚀 ResponseTransformInterceptor 전역 등록
    UtilityModule, // 🛠️ UtilityService 전역 사용
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: CustomConfigService) => ({
        redis: {
          host: configService.redisHost, // Redis 서버 호스트
          port: configService.redisPort, // Redis 서버 포트
        },
        defaultJobOptions: {
          attempts: 3, // 작업 실패 시 최대 3번 재시도
          backoff: {
            type: 'exponential', // 지수적 백오프(점점 간격 늘림)
            delay: 1000, // 초기 지연 시간(1초)
          },
        },
        limiter: {
          max: 100, // 최대 100개 작업 처리
          duration: 5000, // 5초 기간 동안
        },
      }),
    }),
    BullModule.registerQueue({
      name: RedisQueueName.KEYWORD_NOTIFICATIONS, // 큐 이름 등록
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationProcessor],
})
export class NotificationModule {}
