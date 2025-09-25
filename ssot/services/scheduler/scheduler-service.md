# 🎯 Scheduler Service - 스케줄러

## 📊 서비스 정보

| 속성     | 값                              |
| -------- | ------------------------------- |
| **포트** | 3004                            |
| **역할** | 정기 작업 스케줄링 및 배치 처리 |
| **위치** | `apps/scheduler/`               |

## 🎯 핵심 기능

- **스케줄 관리**: Cron 기반 정기 작업 실행
- **배치 처리**: 대용량 데이터 일괄 처리
- **게시판 스케줄러**: 게시글 관련 정기 작업 처리
- **시스템 모니터링**: 스케줄 작업 상태 추적
- **표준 응답**: Gateway에서 `{success: boolean, data: any}` 형태로 변환

## 🔧 모듈 구성 (2025.09.25 업데이트)

```typescript
@Module({
  imports: [
    CustomConfigModule, // 🔧 통일된 환경 설정 사용
    ScheduleModule.forRoot(),
    DatabaseModule,
    UtilityModule,
    ResponseOnlyInterceptorModule, // 🔄 응답 데이터 검증/변환만 수행
    NotificationModule,
  ],
  controllers: [SchedulerController],
  providers: [
    SchedulerService,
    BoardSchedulerService,
    SlackNotificationService, // 🔧 Slack 알림 서비스 (별도 서비스로 분리)
    {
      provide: APP_FILTER,
      useFactory: (slackService: SlackNotificationService) => {
        const slackNotificationHandler = async (
          errorType,
          message,
          exception,
          context,
        ) => {
          await slackService.sendSchedulerErrorNotification(
            errorType,
            message,
            exception,
            context,
          );
        };
        return new GlobalExceptionFilter('scheduler', slackNotificationHandler);
      },
      inject: [SlackNotificationService], // 🔧 의존성 주입
    },
  ],
})
export class SchedulerModule {}
```

## 📢 Slack 알림 서비스

```typescript
// apps/scheduler/src/services/slack-notification.service.ts
@Injectable()
export class SlackNotificationService {
  constructor(private readonly configService: CustomConfigService) {}

  async sendSchedulerErrorNotification(errorType, message, exception, context) {
    // 에러 메시지 포맷팅 및 Slack 전송
  }

  async sendNotification(message: string, channel: string = '#general') {
    // 일반 알림 전송
  }
}
```

## 🌐 API 엔드포인트

```bash
# 시스템
GET /health                         # 헬스체크
```

## 📊 데이터 모델

```typescript
// 현재 별도 Entity 없음 - 간단한 스케줄링 작업만 수행
// 필요시 향후 작업 관리 Entity 추가 예정
```

## 🔧 개발 명령어

```bash
# 개발 실행
pnpm run start:dev:scheduler

# 테스트
pnpm test apps/scheduler

# 헬스체크
curl http://localhost:3004/health

# Docker 실행
docker-compose -f docker-compose.scheduler.yml up
```

---

> 📝 **핵심 특징**: Cron 기반 스케줄링, 게시판 배치 처리, 작업 상태 모니터링
