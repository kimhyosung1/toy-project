import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { DatabaseModule } from '@app/database';
import { CustomConfigModule } from '@app/core/config/config.module';
import { RedisModule } from '@app/core/redis';
import { InterceptorModule } from '@app/common';
import { UtilityModule } from '@app/utility';

@Module({
  imports: [
    CustomConfigModule,
    DatabaseModule,
    RedisModule,
    InterceptorModule, // 🚀 ResponseTransformInterceptor 전역 등록
    UtilityModule, // 🛠️ UtilityService 전역 사용
  ],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
