import { CustomConfigModule } from '@app/core/config/config.module';
import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import {
  BOARD_FACTORY,
  NOTIFICATION_FACTORY,
  TEST2_FACTORY,
  SCHEDULER_FACTORY,
} from 'libs/proxy/src/common-proxy-client';
import { BoardController } from './board.controller';
import { HealthController } from './health.controller';
import { UtilityModule } from '@app/utility';

@Module({
  imports: [CustomConfigModule, UtilityModule], // 🛠️ UtilityService 전역 사용
  controllers: [GatewayController, BoardController, HealthController],
  providers: [
    TEST2_FACTORY,
    BOARD_FACTORY,
    NOTIFICATION_FACTORY,
    SCHEDULER_FACTORY,
  ],
})
export class GatewayModule {}
