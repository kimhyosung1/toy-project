import { CustomConfigModule } from '@app/common/config/config.module';
import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import {
  BOARD_FACTORY,
  NOTIFICATION_FACTORY,
  TEST2_FACTORY,
} from 'libs/proxy/src/common-proxy-client';
import { BoardController } from './board.controller';

@Module({
  imports: [CustomConfigModule],
  controllers: [GatewayController, BoardController],
  providers: [TEST2_FACTORY, BOARD_FACTORY, NOTIFICATION_FACTORY],
})
export class GatewayModule {}
