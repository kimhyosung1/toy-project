import { Module } from '@nestjs/common';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { DatabaseModule } from '@app/database';
import { CustomConfigModule } from '@app/core/config/config.module';
import { RedisModule } from '@app/core/redis';
import { ResponseOnlyInterceptorModule } from '@app/common';
import { UtilityModule } from '@app/utility';

@Module({
  imports: [
    CustomConfigModule,
    DatabaseModule,
    RedisModule,
    ResponseOnlyInterceptorModule, // 🔄 응답 데이터 검증/변환만 수행
    UtilityModule, // 🛠️ UtilityService 전역 사용
  ],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
