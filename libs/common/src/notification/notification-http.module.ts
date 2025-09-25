import { Module, Global } from '@nestjs/common';
import { CommonNotificationService } from './notification-http.service';
import { CustomConfigModule } from '@app/core';

// 📋 알림 모델들도 함께 export
export * from './model';

/**
 * 🌐 CommonNotificationModule
 *
 * 모든 앱에서 Notification 앱과 HTTP 통신하기 위한 공통 모듈
 *
 * 특징:
 * - @Global() 데코레이터로 전역 사용 가능
 * - 자동 재시도, 타임아웃, 예외처리 포함
 * - 모든 앱에서 동일한 방식으로 알림 전송
 *
 * 사용법:
 * @Module({
 *   imports: [
 *     CommonNotificationModule, // 🌐 한 줄 추가로 알림 기능 사용
 *   ],
 *   controllers: [SomeController],
 *   providers: [SomeService],
 * })
 * export class SomeModule {}
 *
 * @Injectable()
 * export class SomeService {
 *   constructor(
 *     private readonly notification: CommonNotificationService, // 🎯 간단한 주입
 *   ) {}
 *
 *   async doSomething() {
 *     try {
 *       // 비즈니스 로직
 *     } catch (error) {
 *       // 🚨 한 줄로 에러 알림 전송 (예외처리 포함)
 *       await this.notification.sendSlackError('작업 실패', { error });
 *     }
 *   }
 * }
 */
@Global() // 🌍 전역 모듈로 설정
@Module({
  imports: [
    CustomConfigModule, // CustomConfigService 사용을 위해 필요
  ],
  providers: [CommonNotificationService],
  exports: [
    CommonNotificationService, // 다른 모듈에서 사용할 수 있도록 export
  ],
})
export class CommonNotificationModule {}
