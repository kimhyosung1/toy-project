import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';
import { DatabaseModule } from '@app/database';
import { UtilityModule } from '@app/utility';
import {
  ResponseOnlyInterceptorModule,
  CommonNotificationModule,
} from '@app/common';
import { CustomConfigModule } from '@app/core/config/config.module';

// 도메인별 스케줄러 서비스들
import { BoardSchedulerService } from './board/board-scheduler.service';

@Module({
  imports: [
    CustomConfigModule, // 🔧 통일된 환경 설정 사용
    ScheduleModule.forRoot(), // 스케줄링 기능 활성화
    DatabaseModule,
    UtilityModule,
    ResponseOnlyInterceptorModule, // 🔄 응답 데이터 검증/변환만 수행
    CommonNotificationModule, // 🌐 공통 알림 서비스 (자동 재시도, 예외처리 포함)
  ],
  controllers: [SchedulerController],
  providers: [SchedulerService, BoardSchedulerService],
})
export class SchedulerModule {}
