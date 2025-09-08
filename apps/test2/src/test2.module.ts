import { Module } from '@nestjs/common';
import { Test2Controller } from './test2.controller';
import { Test2Service } from './test2.service';
import { CustomConfigModule } from '@app/core/config/config.module';
import { DatabaseModule } from '@app/database';
import { InterceptorModule } from '@app/common';
import { UtilityModule } from '@app/utility';
@Module({
  imports: [
    CustomConfigModule,
    DatabaseModule,
    InterceptorModule, // 🚀 ResponseTransformInterceptor 전역 등록
    UtilityModule, // 🛠️ UtilityService 전역 사용
  ],
  controllers: [Test2Controller],
  providers: [Test2Service],
})
export class Test2Module {}
