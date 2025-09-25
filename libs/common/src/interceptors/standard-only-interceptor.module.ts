import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { StandardResponseInterceptor } from './standard-response.interceptor';

/**
 * 🌍 StandardOnlyInterceptorModule
 *
 * Gateway 전용 인터셉터 모듈
 * - StandardResponseInterceptor: 모든 응답을 표준 형태로 변환
 * - 마이크로서비스에서 온 응답을 { success: true, data: ... } 형태로 감싸기
 *
 * 역할:
 * - 마이크로서비스 응답을 받아서 표준 형태로 변환
 * - 클라이언트에게 일관된 API 응답 구조 제공
 *
 * 사용법:
 * @Module({
 *   imports: [
 *     CustomConfigModule,
 *     StandardOnlyInterceptorModule, // 🎯 Gateway 전용
 *   ],
 *   controllers: [GatewayController],
 *   providers: [...],
 * })
 * export class GatewayModule {}
 */
@Module({
  providers: [
    // 📋 표준 응답 형태 인터셉터만 등록
    {
      provide: APP_INTERCEPTOR,
      useClass: StandardResponseInterceptor,
    },
  ],
})
export class StandardOnlyInterceptorModule {}
