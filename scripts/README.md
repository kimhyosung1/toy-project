# 🚀 개발 서버 실행 스크립트

각 마이크로서비스를 개별적으로 실행할 수 있는 스크립트들입니다.

## 📋 사용법

새로운 터미널을 열고 다음 중 하나의 스크립트를 실행하세요:

### 1. Gateway 서비스 (Port: 3000)

```bash
./scripts/run-gateway.sh
```

### 2. Board 서비스 (Port: 3001)

```bash
./scripts/run-board.sh
```

### 3. Notification 서비스 (Port: 3005)

```bash
./scripts/run-notification.sh
```

### 4. Scheduler 서비스 (Port: 3004)

```bash
./scripts/run-scheduler.sh
```

## 🔧 요구사항

- **Node.js**: 22 버전 (nvm 사용)
- **Package Manager**: pnpm

## 📝 참고사항

각 스크립트는 다음 작업을 수행합니다:

1. `nvm use 22` - Node.js 22 버전 사용
2. 해당 서비스의 dev 모드 실행

## 🐳 Docker 실행

개별 스크립트 대신 Docker를 사용하려면:

```bash
# 전체 서비스
docker-compose up

# 스케줄러 + 알림 서비스만
docker-compose -f docker-compose.scheduler-notification.yml up
```
