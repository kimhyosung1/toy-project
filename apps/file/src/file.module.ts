import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { DatabaseModule } from '@app/database';
import { CustomConfigModule } from '@app/core/config/config.module';
// Redis Queue 미사용으로 제거
import { ResponseOnlyInterceptorModule } from '@app/common';
import { UtilityModule } from '@app/utility';

@Module({
  imports: [
    CustomConfigModule,
    DatabaseModule,
    // RedisModule 제거 - Queue 미사용
    ResponseOnlyInterceptorModule, // 🔄 응답 데이터 검증/변환만 수행
    UtilityModule, // 🛠️ UtilityService 전역 사용
  ],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
