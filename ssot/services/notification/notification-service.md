# 🎯 Notification Service - 알림 관리

## 📊 서비스 정보

| 속성     | 값                              |
| -------- | ------------------------------- |
| **포트** | 3002                            |
| **역할** | Slack, Sentry 알림 발송 및 관리 |
| **위치** | `apps/notification/`            |

## 🎯 핵심 기능

- **Slack 알림**: 메시지, 에러, 성공, 경고 알림 발송
- **Sentry 리포팅**: 에러 추적 및 메시지 리포팅
- **다양한 알림 타입**: 성공, 경고, 에러 등 상황별 알림
- **비동기 처리**: 큐 기반 알림 처리 시스템

## 🌐 API 엔드포인트

```bash
# 시스템
GET /health                         # 헬스체크

# Slack 알림
POST /slack                         # Slack 메시지 전송
POST /slack/error                   # Slack 에러 알림
POST /success                       # 성공 알림
POST /warning                       # 경고 알림

# Sentry 리포팅
POST /sentry                        # Sentry 메시지 리포팅
POST /sentry/error                  # Sentry 에러 리포팅
```

## 📊 데이터 모델

```typescript
// 현재 별도 Entity 없음 - Slack/Sentry API 호출만 수행
// Controller에서 인라인 타입으로 요청 처리
// 예: { message: string; channel?: string; context?: any }
```

## 🔧 개발 명령어

```bash
# 개발 실행
pnpm run start:dev:notification

# 테스트
pnpm test apps/notification

# 헬스체크
curl http://localhost:3002/health

# Docker 실행
docker-compose -f docker-compose.notification.yml up
```

---

> 📝 **핵심 특징**: Slack/Sentry 통합, 다양한 알림 타입 지원, 큐 기반 비동기 처리
