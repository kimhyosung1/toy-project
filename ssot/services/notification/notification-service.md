# 🎯 Notification Service - 통합 알림 시스템

**📅 최종 업데이트: 2025-09-25**

## 📊 시스템 개요

| 속성          | 값                                     |
| ------------- | -------------------------------------- |
| **App 포트**  | 3002                                   |
| **App 위치**  | `apps/notification/`                   |
| **Lib 위치**  | `libs/common/src/notification/`        |
| **접근 방식** | `CommonNotificationService` 경유       |
| **역할**      | Slack/Sentry/Email 통합 알림 발송 관리 |

## 🏗️ 시스템 아키텍처

```
┌─────────────────┐    HTTP 요청    ┌─────────────────┐
│   각 앱들        │ ──────────────► │   Notification  │
│ (account, board, │                 │      App        │
│  scheduler 등)   │                 │                 │
└─────────────────┘                 └─────────────────┘
         │                                   │
         ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐
│CommonNotification│                 │ 실제 알림 전송   │
│    Service      │                 │ (Slack, Email,  │
│  (HTTP Client)  │                 │  Sentry 등)     │
└─────────────────┘                 └─────────────────┘
```

### 역할 분담

1. **각 앱**: 비즈니스 로직 실행 + `CommonNotificationService` 호출
2. **CommonNotificationService**: HTTP 클라이언트, 재시도/타임아웃/에러 처리
3. **Notification App**: 실제 알림 전송 (Slack API, Sentry SDK 등)

## 🌐 API 엔드포인트

```bash
# Notification App (포트 3002)
GET /api/notifications/health         # 헬스체크
POST /api/notifications/bulk          # 배치 알림 처리 (최대 500개)
```

## 🎯 주요 기능

### Notification App (간소화된 구조)

- **SlackService**: webhook을 통한 Slack 메시지 전송 (`sendMessage`, `sendError`)
- **SentryService**: Sentry SDK를 통한 에러 추적 (`reportError`)
- **Email 알림**: 예정 (현재 미구현, success: true로 처리)
- **배치 처리**: 500개씩 순차 처리, 성공/실패 카운트 반환
- **간단한 응답**: `{success: boolean}` 형태로 통일

### CommonNotificationService (libs/common)

- **HTTP 클라이언트**: Notification App으로 요청 전송
- **자동 재시도**: 3회 재시도 (지수 백오프: 1초, 2초, 4초)
- **배치 처리**: 500개씩 청킹하여 처리
- **완벽한 예외 처리**: 절대 throw하지 않음, 모든 에러를 catch하여 응답으로 반환
- **실패 알림**: 실패 시 #notification-failures 채널로 긴급 Slack 알림
- **타임아웃**: 5초/요청
- **구조화된 로깅**: 실패 데이터 저장 준비 (추후 DB 연동)

## 🔧 사용법

### 1. 모듈 Import

```typescript
@Module({
  imports: [CommonNotificationModule], // 🌐 전역 모듈
})
```

### 2. 알림 전송 요청 예시

```typescript
// 성공 알림
await this.notification.sendNotifications({
  message: '일일 배치 작업이 완료되었습니다',
  level: NotificationLevelEnum.SUCCESS,
  slack: { channel: '#reports', emoji: '✅' },
});

// 에러 알림 (다중 채널)
await this.notification.sendNotifications({
  message: '데이터베이스 연결 실패',
  level: NotificationLevelEnum.ERROR,
  context: { service: 'scheduler', errorCode: 'DB_CONN_FAIL' },
  slack: { channel: '#critical-alerts', emoji: '🚨', username: 'ErrorBot' },
  emails: [
    {
      to: 'admin@company.com',
      subject: '[긴급] 시스템 에러',
      body: '즉시 확인 필요',
    },
    {
      to: 'dev@company.com',
      subject: '[개발팀] 에러 알림',
      body: '로그 확인 바람',
    },
  ],
  sentry: { level: SentryLevel.ERROR, tags: { service: 'scheduler' } },
});

// 대량 이메일 전송
await this.notification.sendNotifications({
  message: '주간 리포트 발송',
  level: NotificationLevelEnum.INFO,
  emails: [
    { to: 'ceo@company.com', subject: 'CEO 리포트', body: '경영진용 요약...' },
    { to: 'cto@company.com', subject: 'CTO 리포트', body: '기술팀 현황...' },
    // ... 최대 500개까지 자동 배치 처리
  ],
});
```

## 📋 타입 시스템

### Enum 정의 (libs/common/src/notification/enums)

- `NotificationType`: SLACK, EMAIL, SENTRY
- `NotificationLevel`: SUCCESS, WARNING, ERROR, INFO
- `EmailFormat`: TEXT, HTML
- `SentryLevel`: DEBUG, INFO, WARNING, ERROR, FATAL

### 주요 클래스

- `SendNotificationsRequest`: HTTP 서비스 요청 모델
- `SimpleSlackOptions`, `SimpleEmailOptions`, `SimpleSentryOptions`: 옵션 클래스

## 🔧 디렉토리 구조

```
libs/common/src/notification/
├── enums/index.ts                    # Enum 정의
├── model/                           # 모델 클래스들
├── notification-http.service.ts      # 메인 HTTP 클라이언트
└── notification-http.module.ts       # 모듈 정의
```

## ⚡ 성능 특성

- **배치 크기**: 최대 500개/요청
- **재시도**: 최대 3회 (1초, 2초, 4초)
- **타임아웃**: 5초/HTTP 요청
- **처리 방식**: 청크별 순차, 청크 내 타입별 병렬

## 🚨 현재 제한사항

- **Email 전송**: Notification App에서 미구현 (true로 처리)
- **실패 데이터 저장**: DB 저장 미구현 (로그만)
- **재처리**: 자동 재처리 미구현

## 🎯 환경 설정

```bash
# 필수 환경 변수
NOTIFICATION_SERVICE_PORT=3002
NOTIFICATION_SERVICE_URL=http://localhost:3002  # 다른 앱에서 접근용
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
SENTRY_DSN_DEV=https://...
```

---

> 📝 **핵심**:
>
> - 모든 앱에서 `CommonNotificationService` 하나로 통합 알림 처리
> - 완벽한 예외 처리로 서버 안정성 보장
> - 500개씩 배치 처리로 대량 알림 지원
