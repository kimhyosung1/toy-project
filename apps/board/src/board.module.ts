import { Module } from '@nestjs/common';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { DatabaseModule } from 'libs/database/src';
import { CustomConfigModule } from '@app/common/config/config.module';
import { RedisModule } from '@app/common/redis';
import { NOTIFICATION_FACTORY } from 'libs/proxy/src/common-proxy-client';

@Module({
  imports: [CustomConfigModule, DatabaseModule, RedisModule],
  controllers: [BoardController],
  providers: [BoardService, NOTIFICATION_FACTORY],
})
export class BoardModule {}
