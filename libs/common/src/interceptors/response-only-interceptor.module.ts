import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseTransformInterceptor } from './response-transform.interceptor';
import { UtilityModule } from '@app/utility';

/**
 * 🔄 ResponseOnlyInterceptorModule
 *
 * 마이크로서비스 전용 인터셉터 모듈
 * - ResponseTransformInterceptor: 응답 데이터 검증 및 변환만 수행
 * - StandardResponseInterceptor는 Gateway에서만 처리
 *
 * 역할:
 * - 마이크로서비스: 원본 데이터 형태로 응답 (검증된 데이터)
 * - Gateway: 표준 형태로 감싸서 클라이언트에게 전달
 *
 * 사용법:
 * @Module({
 *   imports: [
 *     CustomConfigModule,
 *     DatabaseModule,
 *     ResponseOnlyInterceptorModule, // 🎯 마이크로서비스용
 *   ],
 *   controllers: [SomeController],
 *   providers: [SomeService],
 * })
 * export class SomeModule {}
 */
@Module({
  imports: [UtilityModule], // UtilityService 사용을 위해 import
  providers: [
    // 📤 응답 변환 인터셉터만 등록 (데이터 검증/변환)
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
  ],
})
export class ResponseOnlyInterceptorModule {}
