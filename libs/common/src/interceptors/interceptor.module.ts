import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseTransformInterceptor } from './response-transform.interceptor';
import { UtilityModule } from '@app/utility';

/**
 * 🚀 InterceptorModule
 *
 * 역할:
 * - ResponseTransformInterceptor: 응답 데이터를 표준 형식으로 변환
 * - 에러 처리는 AllExceptionFilter에서 직접 처리 (인터셉터 불필요)
 * - 게이트웨이를 제외한 모든 마이크로서비스에서 import하여 사용
 *
 * 사용법:
 * @Module({
 *   imports: [
 *     CustomConfigModule,
 *     DatabaseModule,
 *     InterceptorModule, // 🎯 한 줄로 인터셉터 등록
 *   ],
 *   controllers: [SomeController],
 *   providers: [SomeService],
 * })
 * export class SomeModule {}
 */
@Module({
  imports: [UtilityModule], // UtilityService 사용을 위해 import
  providers: [
    // 📤 응답 변환 인터셉터 - AllExceptionFilter가 모든 에러를 처리하므로 이것만 필요
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
  ],
})
export class InterceptorModule {}
