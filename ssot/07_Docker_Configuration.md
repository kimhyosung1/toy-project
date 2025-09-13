# Docker Configuration - 마이크로서비스 컨테이너 구성

## 🏗️ 아키텍처 구성

### 마이크로서비스 구조

```
┌─────────────────────────────────────────┐
│              Docker Host                │
│  ┌─────────────────────────────────────┐│
│  │        toy-project Network          ││
│  │                                     ││
│  │  ┌─────────┐  ┌─────────────────┐   ││
│  │  │Gateway  │  │  Core Services  │   ││
│  │  │ :3000   │  │                 │   ││
│  │  └─────────┘  │ Board      :3001│   ││
│  │       │       │ Notification:3002│   ││
│  │       │       │ Scheduler   :3004│   ││
│  │       └───────┤                 │   ││
│  │               └─────────────────┘   ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
         │                    │
    ┌─────────┐         ┌─────────┐
    │ MySQL   │         │ Redis   │
    │ :3306   │         │ :6379   │
    └─────────┘         └─────────┘
   (외부 서비스)        (외부 서비스)
```

### 서비스 역할 분담

| 서비스           | 포트 | 역할                  | 통신 방식 |
| ---------------- | ---- | --------------------- | --------- |
| **Gateway**      | 3000 | API Gateway, 라우팅   | HTTP      |
| **Board**        | 3001 | 게시판 비즈니스 로직  | TCP       |
| **Notification** | 3002 | 알림 처리, Queue 관리 | TCP       |
| **Scheduler**    | 3004 | 배치 작업, 스케줄링   | TCP       |

### 🔧 새로운 서비스 Docker 추가 패턴

**포트 할당**: 3000번대 순차 할당 (다음: 3005, 3006, 3007...)
**컨테이너명**: 서비스명 소문자 (예: auth, file, payment)
**환경변수**: `{SERVICE_NAME}_SERVICE_PORT` 패턴

### 새 서비스 docker-compose.yml 템플릿

```yaml
  newservice:
    <<: *common-build
    container_name: newservice
    ports: ['3005:3005']
    environment:
      <<: *common-env
      APP_NAME: newservice
      NEWSERVICE_SERVICE_PORT: 3005
```

### 환경변수 패턴

**서비스 포트**: `{SERVICE_NAME}_SERVICE_PORT`

- 예: `AUTH_SERVICE_PORT=3005`, `FILE_SERVICE_PORT=3006`

**데이터베이스**: 공통 환경변수 사용

- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`

**Redis**: 공통 환경변수 사용

- `REDIS_HOST`, `REDIS_PORT`

### 통신 패턴

- **외부 → Gateway**: HTTP/HTTPS
- **Gateway → Services**: TCP (NestJS Microservice)
- **Services → Services**: Event-driven (Redis Queue)
- **Services → DB**: MySQL Connection Pool
- **Services → Cache**: Redis Connection

## 🔧 Docker Compose 구성

### 핵심 설정

```yaml
name: toy-project

# 공통 환경변수 (YAML 앵커 패턴)
x-common-env: &common-env
  NODE_ENV: ${NODE_ENV:-dev}
  DB_HOST: ${DB_HOST:-localhost}
  REDIS_HOST: ${REDIS_HOST:-localhost}

# 공통 빌드 설정
x-common-build: &common-build
  context: .
  dockerfile: Dockerfile
  target: app

services:
  gateway:
    <<: *common-build
    container_name: gateway
    ports: ['3000:3000']
    environment:
      <<: *common-env
      APP_NAME: gateway
    depends_on: [board, notification, scheduler]

  board:
    <<: *common-build
    container_name: board
    ports: ['3001:3001']
    environment:
      <<: *common-env
      APP_NAME: board

  notification:
    <<: *common-build
    container_name: notification
    ports: ['3002:3002']
    environment:
      <<: *common-env
      APP_NAME: notification

  scheduler:
    <<: *common-build
    container_name: scheduler
    ports: ['3004:3004']
    environment:
      <<: *common-env
      APP_NAME: scheduler
```

### 멀티스테이지 Dockerfile

```dockerfile
# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.15.6 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.15.6 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG TARGET_APPS
RUN pnpm run build:${TARGET_APPS:-all}:swc

# Stage 3: Runtime
FROM node:22-alpine AS app
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
USER nestjs
ARG APP_NAME
ENV APP_NAME=${APP_NAME}
EXPOSE 3000
CMD ["sh", "-c", "node dist/apps/${APP_NAME}/main.js"]
```

## 🚀 운영 관리

### 환경별 배포

```bash
# 개발 환경
./docker.sh dev up -d

# QA 환경 (포트 4000-4004)
./docker.sh qa up -d

# 프로덕션 환경
./docker.sh prod up -d
```

### 서비스 관리

```bash
# 전체 서비스 상태 확인
./docker.sh dev ps

# 특정 서비스 재시작
./docker.sh dev restart board notification

# 로그 모니터링
./docker.sh dev logs -f gateway
./docker.sh dev logs --tail=100 board

# 서비스 스케일링 (기본 1개 인스턴스)
./docker.sh dev ps
```

### 헬스체크 및 모니터링

```bash
# 전체 시스템 헬스체크
curl http://localhost:3000/health-check

# 개별 서비스 상태
curl http://localhost:3000/board/health-check
curl http://localhost:3000/notification/health-check
curl http://localhost:3000/scheduler/health-check

# 시스템 리소스 모니터링
docker stats
./docker.sh dev top
```

### 주요 환경변수

```bash
# 서비스 포트
GATEWAY_SERVICE_PORT=3000
BOARD_SERVICE_PORT=3001
NOTIFICATION_SERVICE_PORT=3002
SCHEDULER_SERVICE_PORT=3004

# 외부 서비스 (Docker 외부)
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=${DB_PASSWORD}
DB_DATABASE=${DB_DATABASE}

# Redis 설정
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# 애플리케이션 설정
NODE_ENV=${NODE_ENV:-dev}
LOG_LEVEL=${LOG_LEVEL:-info}
```

## 🔄 CI/CD 준비사항

### GitHub Actions 통합 준비

```yaml
# .github/workflows/docker-deploy.yml (예시)
name: 🐳 Docker Deploy

on:
  push:
    branches: [main, develop]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deploy environment'
        required: true
        default: 'dev'
        type: choice
        options: [dev, qa, prod]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build and Deploy
        run: |
          ./docker.sh ${{ inputs.environment }} up -d --build
```

### 배포 전략

```bash
# Blue-Green 배포 준비
./docker.sh prod up -d --scale gateway=2
./docker.sh prod stop gateway_old
./docker.sh prod rm gateway_old

# Rolling Update 준비
./docker.sh prod up -d --no-deps gateway
./docker.sh prod up -d --no-deps board
```

## 🔍 트러블슈팅

### 일반적인 문제 해결

```bash
# 포트 충돌 해결
lsof -ti:3000,3001,3002,3004 | xargs kill -9

# Docker 캐시 클리어
docker system prune -a -f
docker builder prune -a -f

# 네트워크 문제 해결
docker network prune -f
./docker.sh dev down && ./docker.sh dev up -d

# 볼륨 문제 해결
docker volume prune -f
```

### 성능 최적화

```bash
# 이미지 크기 최적화 확인
docker images | grep toy-project

# 컨테이너 리소스 사용량 확인
docker stats --no-stream

# 빌드 시간 최적화
DOCKER_BUILDKIT=1 ./docker.sh dev up -d --build
```

## 🛡️ 보안 구현 현황

### 컨테이너 보안

- **비root 사용자**: nestjs 사용자로 실행
- **최소 권한**: 필요한 포트만 노출
- **보안 스캔**: 정기적인 이미지 취약점 검사
- **시크릿 관리**: 환경변수로 민감 정보 관리

### 네트워크 보안

- **내부 통신**: Docker 네트워크 격리
- **외부 접근**: Gateway를 통한 단일 진입점
- **SSL/TLS**: 프로덕션 환경 HTTPS 적용

---

> **확장 가능한 마이크로서비스 Docker 구성으로 안정적인 서비스 운영을 시작하세요! 🐳**
