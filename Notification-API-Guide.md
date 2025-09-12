# 📱 초간단 알림 API 가이드

## 🎯 특징

- **간단함**: 복잡한 설정 없이 바로 사용
- **명확함**: 성공/실패만 반환 (`{ success: boolean }`)
- **다양함**: Slack, Sentry, 조합 알림 지원

## 🚀 API 엔드포인트

### Base URL

```
http://localhost:3005/api/notifications
```

### 1. 📱 Slack 메시지 전송

```bash
POST /slack
```

**요청:**

```json
{
  "message": "안녕하세요! 테스트 메시지입니다.",
  "channel": "#general" // 선택사항, 기본값: #general
}
```

**응답:**

```json
{ "success": true }
```

### 2. 🚨 에러 알림 (Slack + Sentry 동시)

```bash
POST /error
```

**요청:**

```json
{
  "message": "데이터베이스 연결 실패",
  "context": {
    // 선택사항
    "userId": 123,
    "action": "login"
  }
}
```

**응답:**

```json
{ "success": true }
```

### 3. ✅ 성공 알림

```bash
POST /success
```

**요청:**

```json
{
  "message": "데이터 처리가 완료되었습니다."
}
```

**응답:**

```json
{ "success": true }
```

### 4. ⚠️ 경고 알림

```bash
POST /warning
```

**요청:**

```json
{
  "message": "디스크 용량이 80%를 초과했습니다."
}
```

**응답:**

```json
{ "success": true }
```

### 5. 📝 Sentry 전용 리포팅

```bash
POST /sentry
```

**요청:**

```json
{
  "message": "API 응답 시간이 느립니다.",
  "level": "warning" // 선택사항: info, warning, error
}
```

**응답:**

```json
{ "success": true }
```

### 6. 🏥 헬스 체크

```bash
GET /health
```

**응답:**

```json
{
  "status": "healthy",
  "timestamp": "2024-09-12T14:30:00.000Z"
}
```

## 💻 사용 예제

### curl 명령어

```bash
# Slack 메시지
curl -X POST http://localhost:3005/api/notifications/slack \
  -H "Content-Type: application/json" \
  -d '{"message": "배포가 완료되었습니다!", "channel": "#deployments"}'

# 에러 리포팅
curl -X POST http://localhost:3005/api/notifications/error \
  -H "Content-Type: application/json" \
  -d '{"message": "결제 처리 실패", "context": {"orderId": "12345"}}'

# 성공 알림
curl -X POST http://localhost:3005/api/notifications/success \
  -H "Content-Type: application/json" \
  -d '{"message": "일일 백업 완료"}'
```

### JavaScript/TypeScript

```typescript
// Slack 메시지 전송
const response = await fetch('http://localhost:3005/api/notifications/slack', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: '새로운 주문이 들어왔습니다!',
    channel: '#orders',
  }),
});

const result = await response.json();
console.log(result); // { success: true }
```

### Python

```python
import requests

# 에러 리포팅
response = requests.post(
    'http://localhost:3005/api/notifications/error',
    json={
        'message': '서버 과부하 감지',
        'context': {'cpu': '95%', 'memory': '87%'}
    }
)

print(response.json())  # {'success': True}
```

## 🔧 환경 설정

### 필수 환경변수

```bash
# Slack 설정
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Sentry 설정
SENTRY_DSN_DEV=https://your-dev-dsn@sentry.io/project
SENTRY_DSN_PRODUCTION=https://your-prod-dsn@sentry.io/project
```

## 📊 채널 매핑

| 알림 타입   | 기본 Slack 채널 |
| ----------- | --------------- |
| 일반 메시지 | #general        |
| 에러        | #errors         |
| 성공        | #general        |
| 경고        | #warnings       |

## ⚡ 빠른 테스트

서비스가 실행 중인지 확인:

```bash
curl http://localhost:3005/api/notifications/health
```

간단한 테스트 메시지:

```bash
curl -X POST http://localhost:3005/api/notifications/slack \
  -H "Content-Type: application/json" \
  -d '{"message": "🧪 테스트 메시지입니다!"}'
```

## 🎯 장점

1. **단순함**: 복잡한 설정이나 상태 관리 없음
2. **명확함**: 성공/실패만 반환하여 결과 판단 쉬움
3. **유연함**: 원하는 알림 방식 선택 가능
4. **안정성**: 실패해도 앱이 중단되지 않음
