# 🕒 Enterprise Scheduler Service

CAPA 스타일의 고도화된 스케줄링 마이크로서비스입니다.

## 🎯 주요 기능

### ⚡ 커스텀 Cron 표현식

- **CustomCronExpression**: 상세한 시간 설정 (매분/시간/일/주/월)
- **CustomMsCronExpression**: 밀리초 기반 인터벌 설정
- **타임존 지원**: Asia/Seoul 기본 설정

### 🏗️ 도메인별 스케줄러

- **BoardSchedulerService**: 게시글 정리, 통계, 백업, 인덱스 최적화
- **NotificationSchedulerService**: 키워드 알림, 중복 정리, 성능 분석
- **SchedulerCommonService**: 공통 유틸리티, 성능 측정, 재시도 메커니즘

### 🌍 환경별 실행 제어

- **개발환경**: 모든 작업 실행
- **QA환경**: 정리 작업 포함
- **프로덕션**: 인덱스 최적화 등 고급 작업만

## 🚀 실행 방법

### 개발 환경

```bash
# 스케줄러만 실행
pnpm run start:dev:scheduler

# 모든 서비스와 함께 실행
docker-compose up scheduler
```

### 프로덕션 환경

```bash
# Docker로 스케줄러만 배포
docker-compose up -d scheduler

# 환경별 설정
NODE_ENV=prod SCHEDULER_ENABLED=true pnpm run start:prod:scheduler
```

## 📅 스케줄 작업 목록

### 🗂️ 게시판 관리

| 작업              | 주기   | 시간         | 환경    | 설명                                   |
| ----------------- | ------ | ------------ | ------- | -------------------------------------- |
| **게시글 정리**   | 매일   | 03:00        | QA/PROD | 30일 이상 오래된 댓글 없는 게시글 정리 |
| **댓글 통계**     | 매시간 | 정시         | 전체    | 게시글별 댓글 수 통계 업데이트         |
| **인덱스 최적화** | 매주   | 일요일 00:00 | PROD    | 데이터베이스 인덱스 분석 및 최적화     |
| **게시글 백업**   | 주간   | 일요일 02:00 | PROD    | 중요 게시글 백업                       |
| **태그 생성**     | 매일   | 05:00        | 전체    | 키워드 추출 및 자동 태그 생성          |

### 🔔 알림 관리

| 작업            | 주기     | 시간      | 환경    | 설명                          |
| --------------- | -------- | --------- | ------- | ----------------------------- |
| **알림 배치**   | 15분마다 | -         | 전체    | 키워드 알림 일괄 처리         |
| **중복 정리**   | 매일     | 04:00     | QA/PROD | 동일 사용자 중복 키워드 제거  |
| **통계 생성**   | 매일     | 09:00     | 전체    | 일일 알림 통계 리포트         |
| **비활성 정리** | 매월     | 1일 02:00 | PROD    | 6개월 이상 비활성 키워드 정리 |
| **재시도 처리** | 30분마다 | -         | 전체    | 실패한 알림 재발송            |

### 🖥️ 시스템 모니터링

| 작업                | 주기     | 시간 | 환경 | 설명                        |
| ------------------- | -------- | ---- | ---- | --------------------------- |
| **헬스체크**        | 5분마다  | -    | 전체 | 메모리/CPU 사용량 모니터링  |
| **DB 연결**         | 30분마다 | -    | 전체 | 데이터베이스 연결 상태 확인 |
| **실시간 모니터링** | 30초마다 | -    | 전체 | 활성 작업 수 추적           |
| **GC 모니터링**     | 5분마다  | -    | 전체 | 가비지 컬렉션 최적화        |

## 🎛️ 제어 API

### TCP 메시지 패턴

```typescript
// 스케줄러 제어
CustomMessagePatterns.SchedulerStart; // 스케줄러 시작
CustomMessagePatterns.SchedulerStop; // 스케줄러 중지
CustomMessagePatterns.SchedulerStatus; // 상태 확인
CustomMessagePatterns.SchedulerHealthCheck; // 헬스체크
```

### Gateway 엔드포인트

```bash
# 헬스체크
curl http://localhost:3000/scheduler/health-check

# 상태 확인 (TCP를 통해 내부적으로 호출)
# { isRunning, timestamp, uptime, environment, jobs, timezone }
```

## 🔧 커스텀 스케줄 추가

### 1. 새로운 Cron 표현식 추가

```typescript
// libs/common/src/constants/custom-cron.ts
export enum CustomCronExpression {
  EVERY_CUSTOM_TIME = '0 30 14 * * 1-5', // 평일 14:30
}
```

### 2. 스케줄 메서드 구현

```typescript
// apps/scheduler/src/scheduler.service.ts
@Cron(CustomCronExpression.EVERY_CUSTOM_TIME, {
  timeZone: 'Asia/Seoul',
})
async customScheduledJob() {
  if (!this.isRunning) return;

  if (this.canRunInCurrentEnvironment([Environment.PRODUCTION])) {
    try {
      await this.customSchedulerService.doCustomWork();
    } catch (error) {
      this.commonService.logJobError('customScheduledJob', error);
    }
  }
}
```

### 3. 도메인 서비스에 비즈니스 로직 추가

```typescript
// apps/scheduler/src/custom/custom-scheduler.service.ts
async doCustomWork(): Promise<void> {
  await this.commonService.measurePerformance(
    'custom_work',
    async () => {
      // 실제 비즈니스 로직
      this.logger.log('커스텀 작업 실행');
      return { processed: true };
    }
  );
}
```

## 🔍 모니터링 및 로깅

### 로그 레벨

```bash
# 환경변수 설정
SCHEDULER_LOG_LEVEL=debug  # debug, info, warn, error
```

### 성능 메트릭

- **작업 실행 시간**: 밀리초 단위 측정
- **메모리 사용량**: 500MB 임계치 모니터링
- **활성 작업 수**: 실시간 추적
- **재시도 메커니즘**: 3회 재시도 + 지수 백오프

### 로그 확인

```bash
# 컨테이너 로그
docker logs scheduler

# 실시간 로그
docker logs -f scheduler

# 특정 작업 로그 필터링
docker logs scheduler | grep "게시글 정리"
```

## 📊 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    Scheduler Service                        │
├─────────────────────────────────────────────────────────────┤
│  SchedulerService (메인 컨트롤러)                             │
│  ├── BoardSchedulerService (게시판 도메인)                    │
│  ├── NotificationSchedulerService (알림 도메인)               │
│  └── SchedulerCommonService (공통 유틸리티)                   │
├─────────────────────────────────────────────────────────────┤
│  CustomCronExpression (시간 설정)                            │
│  Environment (환경별 제어)                                   │
│  SchedulerJobType (작업 타입)                               │
├─────────────────────────────────────────────────────────────┤
│  Database (TypeORM + MySQL)                                │
│  Logger (성능 측정 + 에러 추적)                               │
│  Redis (향후 큐 시스템 확장용)                                │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 CI/CD

`.github/workflows/scheduler-ci-cd.yml`로 독립적인 배포:

- **트리거**: `apps/scheduler/**` 경로 변경 시
- **테스트**: 단위 테스트, 통합 테스트, 성능 테스트
- **빌드**: Docker 이미지 `toy-project-scheduler`
- **배포**: GitHub Container Registry

## ⚠️ 주의사항

### 운영 환경

- **데이터 삭제 작업**: 실제 운영에서는 신중히 활성화
- **메모리 모니터링**: 500MB 임계치 초과 시 알림
- **시간대**: Asia/Seoul 고정, 변경 시 주의

### 성능 최적화

- **배치 처리**: 대용량 데이터는 배치 단위로 처리
- **재시도 메커니즘**: 지수 백오프로 시스템 부하 방지
- **인덱스 최적화**: 프로덕션에서만 실행

---

**CAPA 스타일 Enterprise 스케줄러 완성! 🚀**
