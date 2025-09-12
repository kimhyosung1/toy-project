# Package Management - 익명 게시판 및 키워드 알림 시스템

## 📦 패키지 관리 개요

**패키지 매니저**: pnpm v8  
**Node.js 버전**: v22 (LTS)  
**프레임워크**: NestJS v11  
**TypeScript**: v5.1.3  
**컴파일러**: SWC (15.6% 성능 향상)  
**호환성**: Node.js v22 + pnpm v8 + SWC 완벽 호환

## 🚀 pnpm 선택 이유

### 1. 성능 최적화

- **디스크 공간 절약**: 심볼릭 링크를 통한 중복 제거
- **빠른 설치 속도**: npm/yarn 대비 2-3배 빠른 설치
- **효율적인 캐시**: 글로벌 저장소를 통한 패키지 재사용

### 2. 모노레포 지원

- **워크스페이스**: 멀티 패키지 프로젝트 최적화
- **의존성 호이스팅**: 효율적인 의존성 관리
- **크로스 패키지 참조**: libs 간 참조 최적화

### 3. 보안 강화

- **Phantom Dependencies 방지**: 직접 선언된 의존성만 접근 가능
- **의존성 격리**: 패키지 간 의존성 충돌 방지

## 📋 주요 의존성

### 1. 프로덕션 의존성

#### NestJS 생태계

```json
{
  "@nestjs/common": "^11.0.0", // 핵심 프레임워크
  "@nestjs/core": "^11.0.0", // 코어 모듈
  "@nestjs/platform-express": "^11.0.0", // Express 플랫폼
  "@nestjs/microservices": "^11.0.21", // 마이크로서비스 지원
  "@nestjs/config": "^4.0.2", // 설정 관리
  "@nestjs/swagger": "^11.1.5", // API 문서화
  "@nestjs/typeorm": "^11.0.0", // TypeORM 통합
  "@nestjs/bull": "^11.0.2" // Redis Queue 지원
}
```

#### 데이터베이스 & ORM

```json
{
  "typeorm": "^0.3.22", // ORM
  "mysql2": "^3.11.0" // MySQL 드라이버
}
```

#### 큐 & 캐싱

```json
{
  "bull": "^4.16.5" // Redis 기반 큐 시스템
}
```

#### 유틸리티 & 검증

```json
{
  "class-transformer": "^0.5.1", // 객체 변환
  "class-validator": "^0.14.1", // 유효성 검증
  "bcrypt": "^5.1.1", // 비밀번호 해시
  "uuid": "^11.1.0" // UUID 생성
}
```

#### 런타임

```json
{
  "express": "^5.1.0", // Express v5
  "rxjs": "^7.8.1", // 반응형 프로그래밍
  "reflect-metadata": "^0.1.13", // 메타데이터 지원
  "swagger-ui-express": "^5.0.1" // Swagger UI
}
```

### 2. 개발 의존성

#### NestJS 개발 도구

```json
{
  "@nestjs/cli": "^11.0.0", // CLI 도구
  "@nestjs/schematics": "^11.0.0", // 코드 생성
  "@nestjs/testing": "^11.0.0" // 테스트 유틸리티
}
```

#### TypeScript & 컴파일러

```json
{
  "typescript": "^5.1.3", // TypeScript 컴파일러
  "ts-node": "^10.9.1", // TypeScript 실행
  "ts-loader": "^9.4.3", // Webpack TypeScript 로더
  "tsconfig-paths": "^4.2.0" // 경로 별칭 지원
}
```

#### 테스트 프레임워크

```json
{
  "jest": "^29.5.0", // 테스트 프레임워크
  "ts-jest": "^29.1.0", // TypeScript Jest 지원
  "supertest": "^6.3.3" // HTTP 테스트
}
```

#### 코드 품질

```json
{
  "eslint": "^8.42.0", // 린터
  "@typescript-eslint/eslint-plugin": "^6.0.0",
  "@typescript-eslint/parser": "^6.0.0",
  "prettier": "^3.0.0", // 코드 포매터
  "eslint-config-prettier": "^9.0.0",
  "eslint-plugin-prettier": "^5.0.0"
}
```

#### 타입 정의

```json
{
  "@types/express": "^5.0.0", // Express v5 타입
  "@types/node": "^22.3.0", // Node.js v22 타입
  "@types/jest": "^29.5.2", // Jest 타입
  "@types/bcrypt": "^5.0.2", // bcrypt 타입
  "@types/supertest": "^2.0.12" // supertest 타입
}
```

## 🔧 스크립트 명령어

### 1. 개발 명령어

```json
{
  "build": "nest build", // 전체 빌드
  "start": "nest start", // 기본 시작
  "start:dev": "nest start --watch", // 개발 모드
  "start:dev:gateway": "NODE_ENV=dev nest start gateway --watch --debug",
  "start:dev:board": "NODE_ENV=dev nest start board --watch --debug",
  "start:dev:notification": "NODE_ENV=dev nest start notification --watch --debug",
  "start:dev:debug:test2": "NODE_ENV=dev nest start test2 --watch --debug"
}
```

### 2. 프로덕션 명령어

```json
{
  "start:prod": "node dist/apps/toy-project/main",
  "start:prod:gateway": "node dist/apps/gateway/main",
  "start:prod:board": "node dist/apps/board/main",
  "start:prod:notification": "node dist/apps/notification/main"
}
```

### 3. 테스트 명령어

```json
{
  "test": "jest --config jest.config.js", // 단위 테스트
  "test:watch": "jest --watch --config jest.config.js", // 감시 모드
  "test:cov": "jest --coverage --config jest.config.js", // 커버리지
  "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand --config jest.config.js",
  "test:e2e": "jest --config ./jest.config.js apps/board/test/unit/board.e2e.spec.ts"
}
```

### 4. 코드 품질 명령어

```json
{
  "format": "prettier --write \"apps/**/*.ts\" \"libs/**/*.ts\"",
  "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix"
}
```

## 🏗️ 모노레포 구조

### 1. 워크스페이스 설정

```json
// package.json
{
  "name": "toy-project",
  "private": true,
  "workspaces": ["apps/*", "libs/*"]
}
```

### 2. 애플리케이션 구조

```
apps/
├── gateway/          # API Gateway (:3000)
├── board/           # Board Service (:3020)
├── notification/    # Notification Service (:3030)
└── test2/          # Test Service (:3010)
```

### 3. 라이브러리 구조

```
libs/
├── common/          # 공통 기능 (인터셉터, 데코레이터, 상수)
├── core/           # 핵심 인프라 (설정, Redis, 예외 필터)
├── database/       # 데이터 계층 (엔티티, 리포지토리)
├── global-dto/     # API 계약 (요청/응답 DTO)
├── utility/        # 유틸리티 (@Global 모듈)
└── proxy/          # 서비스 통신 (마이크로서비스 클라이언트)
```

## 🔗 TypeScript 경로 별칭

### 1. tsconfig.json 설정

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@app/common": ["libs/common/src"],
      "@app/common/*": ["libs/common/src/*"],
      "@app/core": ["libs/core/src"],
      "@app/core/*": ["libs/core/src/*"],
      "@app/database": ["libs/database/src"],
      "@app/database/*": ["libs/database/src/*"],
      "@app/proxy": ["libs/proxy/src"],
      "@app/proxy/*": ["libs/proxy/src/*"],
      "@app/global-dto": ["libs/global-dto/src"],
      "@app/global-dto/*": ["libs/global-dto/src/*"],
      "@app/utility": ["libs/utility/src"],
      "@app/utility/*": ["libs/utility/src/*"]
    }
  }
}
```

### 2. 사용 예시

```typescript
// 기존 상대 경로 (사용 금지)
import { BoardEntity } from '../../../libs/database/src/entities/board.entity';

// 경로 별칭 사용 (권장)
import { BoardEntity } from '@app/database/board';
import { UtilityService } from '@app/utility';
import { CreateBoardRequest } from '@app/global-dto/board/request';
```

## 🔄 의존성 관리 전략

### 1. 버전 고정 정책

#### 메이저 버전 고정

```json
{
  "@nestjs/common": "^11.0.0", // 11.x.x 범위 내 업데이트 허용
  "typescript": "^5.1.3", // 5.x.x 범위 내 업데이트 허용
  "express": "^5.1.0" // 5.x.x 범위 내 업데이트 허용
}
```

#### 패치 버전만 허용 (중요한 패키지)

```json
{
  "mysql2": "~3.11.0", // 3.11.x 범위 내만 업데이트
  "bcrypt": "~5.1.1" // 5.1.x 범위 내만 업데이트
}
```

### 2. 의존성 업데이트 가이드

```bash
# 의존성 확인
pnpm outdated

# 안전한 업데이트 (패치 버전만)
pnpm update

# 메이저 버전 업데이트 (신중히)
pnpm add @nestjs/common@latest

# 보안 취약점 확인
pnpm audit

# 보안 취약점 자동 수정
pnpm audit --fix
```

## 🚀 성능 최적화

### 1. pnpm 최적화 설정

```ini
# .npmrc
# 빠른 설치를 위한 설정
prefer-frozen-lockfile=true
strict-peer-dependencies=false
auto-install-peers=true

# 캐시 최적화
store-dir=~/.pnpm-store
cache-dir=~/.pnpm-cache

# 네트워크 최적화
network-concurrency=16
fetch-retries=3
fetch-retry-factor=2
```

### 2. 빌드 최적화

```json
// nest-cli.json
{
  "compilerOptions": {
    "deleteOutDir": true,
    "webpack": true,
    "webpackConfigPath": "webpack.config.js"
  }
}
```

### 3. 개발 환경 최적화

```bash
# 병렬 실행으로 개발 서버 시작
pnpm run start:dev:gateway &
pnpm run start:dev:board &
pnpm run start:dev:notification &
pnpm run start:dev:debug:test2 &
```

## 🔒 보안 고려사항

### 1. 의존성 보안

```bash
# 정기적인 보안 감사
pnpm audit

# 취약점 자동 수정
pnpm audit --fix

# 특정 패키지 보안 확인
pnpm audit --audit-level moderate
```

### 2. 패키지 무결성

```bash
# 락 파일 검증
pnpm install --frozen-lockfile

# 패키지 무결성 확인
pnpm install --verify-store-integrity
```

### 3. 프로덕션 의존성만 설치

```bash
# 프로덕션 배포 시
pnpm install --prod --frozen-lockfile
```

## 🧪 테스트 환경 설정

### 1. Jest 설정

```javascript
// jest.config.js
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['apps/**/*.(t|j)s', 'libs/**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>/apps/', '<rootDir>/libs/'],
  moduleNameMapping: {
    '^@app/(.*)$': '<rootDir>/libs/$1/src',
  },
};
```

### 2. 테스트 실행

```bash
# 전체 테스트
pnpm test

# 특정 앱 테스트
pnpm test apps/board

# 특정 라이브러리 테스트
pnpm test libs/database

# 커버리지 포함 테스트
pnpm test:cov
```

## 📊 패키지 분석

### 1. 번들 크기 분석

```bash
# 의존성 트리 확인
pnpm list

# 특정 패키지 의존성 확인
pnpm why @nestjs/common

# 중복 패키지 확인
pnpm list --depth=0
```

### 2. 성능 모니터링

```bash
# 설치 시간 측정
time pnpm install

# 캐시 상태 확인
pnpm store status

# 스토어 정리
pnpm store prune
```

## 🔄 CI/CD 통합

### 1. GitHub Actions 예시

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm test:cov

      - name: Build
        run: pnpm build
```

### 2. Docker 통합

```dockerfile
# Dockerfile
FROM node:22-alpine

# pnpm 설치
RUN npm install -g pnpm@8

WORKDIR /app

# 의존성 파일 복사
COPY package.json pnpm-lock.yaml ./

# 의존성 설치
RUN pnpm install --frozen-lockfile --prod

# 소스 코드 복사
COPY . .

# 빌드
RUN pnpm build

# 실행
CMD ["pnpm", "start:prod"]
```

## ⚠️ 주의사항 및 베스트 프랙티스

### 1. Node.js v22 + pnpm v8 호환성

✅ **완벽 호환**: Node.js v22와 pnpm v8은 완벽하게 호환됩니다.

- **Node.js v22**: 2024년 LTS 버전으로 안정성 보장
- **pnpm v8**: 최신 Node.js 버전 완벽 지원
- **성능**: 기존 npm/yarn 대비 월등한 성능

### 2. 의존성 관리 원칙

```bash
# ✅ 권장: 정확한 패키지명 사용
pnpm add @nestjs/common@^11.0.0

# ❌ 비권장: 버전 없이 설치
pnpm add @nestjs/common

# ✅ 권장: 개발 의존성 명시
pnpm add -D @types/node

# ✅ 권장: 락 파일 커밋
git add pnpm-lock.yaml
```

### 3. 모노레포 관리

```bash
# ✅ 권장: 루트에서 의존성 관리
pnpm add @nestjs/common

# ❌ 비권장: 개별 앱에서 의존성 추가
cd apps/gateway && pnpm add express

# ✅ 권장: 워크스페이스 명령어 사용
pnpm -r build  # 모든 패키지 빌드
pnpm -r test   # 모든 패키지 테스트
```

### 4. 성능 최적화 팁

```bash
# 캐시 활용
pnpm config set store-dir ~/.pnpm-store

# 병렬 설치 최적화
pnpm config set network-concurrency 16

# 불필요한 파일 제외
echo "node_modules/" >> .gitignore
echo "dist/" >> .gitignore
echo "coverage/" >> .gitignore
```

## 📈 향후 계획

### 1. 의존성 업그레이드 로드맵

- **NestJS v12**: 2024년 하반기 예정
- **TypeScript v5.2+**: 성능 개선 및 새 기능
- **Express v6**: 출시 시 마이그레이션 검토

### 2. 새로운 패키지 도입 검토

```json
{
  "@nestjs/throttler": "^5.0.0", // Rate limiting
  "@nestjs/cache-manager": "^2.0.0", // 캐싱 개선
  "@nestjs/event-emitter": "^2.0.0", // 이벤트 기반 아키텍처
  "helmet": "^7.0.0", // 보안 헤더
  "compression": "^1.7.4" // 응답 압축
}
```

### 3. 개발 도구 개선

```json
{
  "husky": "^8.0.0", // Git hooks
  "lint-staged": "^13.0.0", // 스테이징된 파일만 린트
  "@commitlint/cli": "^17.0.0", // 커밋 메시지 검증
  "semantic-release": "^21.0.0" // 자동 버전 관리
}
```
