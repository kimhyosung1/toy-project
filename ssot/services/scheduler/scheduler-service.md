# 🎯 Scheduler Service - 스케줄러

## 📊 서비스 정보

| 속성     | 값                              |
| -------- | ------------------------------- |
| **포트** | 3004                            |
| **역할** | 정기 작업 스케줄링 및 배치 처리 |
| **위치** | `apps/scheduler/`               |

## 🎯 핵심 기능

- **스케줄 관리**: Cron 기반 정기 작업 실행 (`@Cron` 데코레이터 사용)
- **배치 처리**: BoardSchedulerService를 통한 게시판 관련 배치 작업
- **통합 알림 시스템**: `CommonNotificationService`를 통한 Slack/Sentry/Email 알림
- **에러 처리**: 완벽한 예외 처리 및 알림 전송
- **서울 시간대**: Asia/Seoul 타임존 설정

## 🔧 모듈 구성 (2025.09.25 실제 구성)

```typescript
@Module({
  imports: [
    CustomConfigModule,
    ScheduleModule.forRoot(),
    DatabaseModule,
    UtilityModule,
    ResponseOnlyInterceptorModule, // 🔄 응답 데이터 검증/변환만 수행
    CommonNotificationModule, // 🌐 통합 알림 서비스
  ],
  controllers: [SchedulerController],
  providers: [SchedulerService, BoardSchedulerService],
})
export class SchedulerModule {}
```

## 🌐 통합 알림 시스템

- **CommonNotificationService**: Slack/Sentry/Email 통합 알림 전송
- **에러 처리**: 스케줄러 실패 시 자동 알림 (다중 채널 지원)
- **Asia/Seoul 타임존**: 모든 Cron 작업 서울 시간 기준
- **BoardSchedulerService**: 게시판 관련 배치 작업 처리

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
