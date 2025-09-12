# Docker 사용 가이드 (통합 스크립트 방식)

## 🚀 통합 스크립트로 간편하게 사용하기

### 기본 사용법

```bash
./docker.sh [환경] [docker-compose 명령어]
```

## 환경별 실행 방법

### 🚀 개발 환경 (dev)

```bash
# 개발 환경 시작 (로컬 DB 사용)
./docker.sh dev up -d

# 개발 환경 시작 (DB 포함)
./docker.sh dev --profile full up -d

# 특정 서비스만 시작
./docker.sh dev up -d gateway board

# 로그 확인
./docker.sh dev logs -f gateway

# 서비스 중지
./docker.sh dev down
```

### 🧪 QA 환경 (qa)

```bash
# QA 환경 전체 실행 (DB 포함 권장)
./docker.sh qa --profile full up -d

# 애플리케이션만 (외부 DB 사용 시)
./docker.sh qa up -d

# QA 환경 중지
./docker.sh qa down
```

### 🏭 프로덕션 환경 (prod)

```bash
# 프로덕션 환경 (외부 RDS/ElastiCache 사용)
./docker.sh prod up -d

# 특정 서비스만 배포
./docker.sh prod up -d gateway

# 프로덕션 환경 중지
./docker.sh prod down
```

## npm/pnpm 스크립트 방식 (선택사항)

### 빠른 시작/중지

```bash
# 환경별 시작
pnpm run docker:dev:up       # 개발 환경
pnpm run docker:qa:up        # QA 환경 (DB 포함)
pnpm run docker:prod:up      # 프로덕션 환경

# 환경별 중지
pnpm run docker:dev:down     # 개발 환경
pnpm run docker:qa:down      # QA 환경
pnpm run docker:prod:down    # 프로덕션 환경
```

## 프로필별 실행

### 서비스만 실행 (기본)

```bash
./docker.sh dev up -d
# 또는
./docker.sh dev --profile all up -d
```

### DB만 실행

```bash
./docker.sh dev --profile db up -d
```

### 전체 실행 (서비스 + DB)

```bash
./docker.sh dev --profile full up -d
```

## 자주 사용하는 명령어

### 컨테이너 상태 확인

```bash
./docker.sh dev ps
```

### 로그 확인

```bash
# 전체 로그
./docker.sh dev logs

# 특정 서비스 로그 (실시간)
./docker.sh dev logs -f gateway

# 최근 로그만 확인
./docker.sh dev logs --tail 100 gateway
```

### 컨테이너 내부 접속

```bash
./docker.sh dev exec gateway sh
```

### 서비스 재시작

```bash
./docker.sh dev restart gateway
```

### 이미지 재빌드

```bash
./docker.sh dev up -d --build
```

## 유용한 명령어

### 컨테이너 관리

```bash
# 실행 중인 컨테이너 확인
docker ps

# 모든 컨테이너 확인
docker ps -a

# 컨테이너 중지
docker stop <container_name>

# 컨테이너 삭제
docker rm <container_name>
```

### 이미지 관리

```bash
# 이미지 목록 확인
docker images

# 이미지 삭제
docker rmi <image_name>

# 사용하지 않는 이미지 정리
docker image prune -a
```

### 볼륨 및 네트워크 관리

```bash
# 볼륨 목록 확인
docker volume ls

# 볼륨 삭제
docker volume rm <volume_name>

# 네트워크 목록 확인
docker network ls

# 사용하지 않는 리소스 정리
docker system prune -a
```

## 환경별 설정

### 개발 환경 (dev)

- NODE_ENV=dev
- 로컬 DB 연결 (localhost)
- 포트: 3000-3003

### QA 환경 (qa)

- NODE_ENV=qa
- Docker DB 사용 또는 QA 전용 DB
- 포트: 3000-3003 (동일)

### 프로덕션 환경 (prod)

- NODE_ENV=prod
- 외부 RDS/ElastiCache 사용
- 포트: 3000-3003 (동일)

## CI/CD 준비

### GitHub Actions용 명령어

```bash
# 멀티 아키텍처 빌드 (ARM64, AMD64)
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --build-arg NODE_ENV=prod \
  -t your-registry/toy-project:latest \
  --push .
```

### AWS ECR 푸시

```bash
# ECR 로그인
aws ecr get-login-password --region ap-northeast-2 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-northeast-2.amazonaws.com

# 이미지 태그
docker tag toy-project:prod <account-id>.dkr.ecr.ap-northeast-2.amazonaws.com/toy-project:latest

# 이미지 푸시
docker push <account-id>.dkr.ecr.ap-northeast-2.amazonaws.com/toy-project:latest
```

## 빠른 시작 가이드

### 🎯 처음 사용하는 경우

```bash
# 1. 스크립트 실행 권한 확인
chmod +x docker.sh

# 2. 개발 환경 시작 (로컬 DB 사용)
./docker.sh dev up -d

# 3. 로그 확인
./docker.sh dev logs -f gateway
```

### 🔄 일상적인 개발 작업

```bash
# 개발 시작
./docker.sh dev up -d

# 코드 변경 후 재빌드
./docker.sh dev up -d --build gateway

# 작업 완료 후 정리
./docker.sh dev down
```

### 🧪 QA 테스트

```bash
# QA 환경 전체 실행 (DB 포함)
./docker.sh qa --profile full up -d

# 테스트 완료 후 정리
./docker.sh qa down -v  # 볼륨까지 삭제
```

### 🏭 프로덕션 배포

```bash
# 외부 DB 사용하는 프로덕션
./docker.sh prod up -d

# 특정 서비스만 업데이트
./docker.sh prod up -d --no-deps gateway
```

## 도움말

```bash
# 스크립트 사용법 확인
./docker.sh

# 또는 잘못된 환경 입력 시 자동으로 도움말 표시
./docker.sh invalid_env
```
