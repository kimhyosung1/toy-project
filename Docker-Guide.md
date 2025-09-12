# 🐳 Docker 사용 가이드

## 📋 Docker Compose 파일 종류

### 1. 개별 서비스 실행

#### 스케줄러만 실행

```bash
docker-compose -f docker-compose.scheduler.yml up
```

#### 알림 서비스만 실행

```bash
docker-compose -f docker-compose.notification.yml up
```

### 2. 조합 실행

#### 스케줄러 + 알림 서비스 함께 실행 (개발용)

```bash
docker-compose -f docker-compose.scheduler-notification.yml up
```

#### 전체 서비스 실행

```bash
docker-compose up
```

## 🔧 환경변수 설정

`.env` 파일을 생성하여 환경변수를 설정할 수 있습니다:

```bash
# .env 파일 예시
NODE_ENV=dev
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=toy_project
REDIS_HOST=localhost
REDIS_PORT=6379
SCHEDULER_SERVICE_PORT=3004
NOTIFICATION_SERVICE_PORT=3005
```

## 📦 Docker 빌드 파일

### Root 레벨 Docker 파일들

- `Dockerfile.scheduler` - 스케줄러 서비스 전용
- `Dockerfile.notification` - 알림 서비스 전용
- `Dockerfile` - 기본 Dockerfile (전체 서비스용)

## 🚀 빠른 시작

### 개발 환경에서 자주 사용하는 조합

1. **백그라운드 실행**:

```bash
docker-compose -f docker-compose.scheduler-notification.yml up -d
```

2. **로그 확인**:

```bash
docker-compose -f docker-compose.scheduler-notification.yml logs -f
```

3. **서비스 중지**:

```bash
docker-compose -f docker-compose.scheduler-notification.yml down
```

4. **이미지 다시 빌드**:

```bash
docker-compose -f docker-compose.scheduler-notification.yml up --build
```

## 📊 포트 정보

| 서비스       | 포트 | 설명            |
| ------------ | ---- | --------------- |
| Gateway      | 3000 | API Gateway     |
| Board        | 3001 | 게시판 서비스   |
| Scheduler    | 3004 | 스케줄러 서비스 |
| Notification | 3005 | 알림 서비스     |

## 🏥 헬스 체크

각 서비스의 상태를 확인할 수 있는 엔드포인트:

- 스케줄러: `http://localhost:3004/api`
- 알림 서비스: `http://localhost:3005/api/notifications/health`

## 🔍 트러블슈팅

### 포트 충돌 시

환경변수를 통해 포트를 변경하세요:

```bash
SCHEDULER_SERVICE_PORT=4004 NOTIFICATION_SERVICE_PORT=4005 docker-compose -f docker-compose.scheduler-notification.yml up
```

### 로그 볼륨

로그는 `./logs` 폴더에 저장됩니다.
