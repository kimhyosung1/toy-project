# NestJS 마이크로서비스 스켈레톤

[![Node.js](https://img.shields.io/badge/Node.js-v22-green.svg)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-v11-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.1.3-blue.svg)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-v8-orange.svg)](https://pnpm.io/)
[![Docker](https://img.shields.io/badge/Docker-containerized-blue.svg)](https://www.docker.com/)

**NestJS v11 기반 마이크로서비스 아키텍처 스켈레톤 프로젝트**

> 🎯 **프로덕션 레디**: 기능만 추가하면 바로 운영 환경에 배포할 수 있는 완성도 높은 MSA 템플릿

## 📚 완전한 기술 문서 (SSOT)

> 🎯 **시작하기**: [SSOT 마스터 개요](./ssot/00_MASTER_OVERVIEW.md)에서 전체 시스템을 한눈에 파악하세요.

### 📋 핵심 문서

- **[마스터 개요](./ssot/00_MASTER_OVERVIEW.md)** - 전체 시스템 한눈에 보기 ⭐
- **[프로젝트 요구사항](./ssot/01_PRD.md)** - 기능 명세 및 사용자 스토리
- **[시스템 아키텍처](./ssot/02_System_Architecture.md)** - 마이크로서비스 구조
- **[데이터베이스 스키마](./ssot/03_Database_Schema.md)** - 테이블 구조 및 관계도
- **[API 인터페이스](./ssot/04_API_Interface.md)** - REST API 명세서

### 🚀 개발 가이드

- **[패키지 관리](./ssot/05_Package_Management.md)** - pnpm 및 의존성 관리
- **[SWC 빌드 시스템](./ssot/06_SWC_Build_System.md)** - 고성능 빌드 설정
- **[Docker 구성](./ssot/07_Docker_Configuration.md)** - 컨테이너화 및 배포
- **[Database Management](./ssot/08_Database_Management.md)** - 자동화된 DB 동기화

## 🎯 프로젝트 개요

### 핵심 특징 (즉시 사용 가능한 스켈레톤)

- **🚀 완전 자동화된 응답 검증/변환 시스템**: `@CheckResponseWithType` 데코레이터 기반
- **🛡️ 3단계 에러 방어 시스템**: 안전한 JSON 직렬화 및 예외 처리
- **🏗️ 마이크로서비스 아키텍처**: Gateway 패턴으로 서비스 분리
- **🐳 Docker 컨테이너화**: 일관된 개발/운영 환경
- **⚡ 고성능 최적화**: SWC 컴파일러 + pnpm v8
- **📊 Enhanced DB Sync System**: 완전 자동화된 Entity/Repository 생성
- **🎯 프로덕션 레디**: 기능만 추가하면 바로 운영 환경 배포 가능

### 현재 운영 중인 마이크로서비스

| 서비스           | 포트 | 역할                             | 상태    |
| ---------------- | ---- | -------------------------------- | ------- |
| **Gateway**      | 3000 | API Gateway, Swagger 문서        | ✅ 운영 |
| **Board**        | 3001 | 게시글/댓글 CRUD                 | ✅ 운영 |
| **Notification** | 3002 | 알림 처리 (Slack, Sentry, Email) | ✅ 운영 |
| **Scheduler**    | 3004 | 스케줄링, Cron 작업              | ✅ 운영 |

> **참고**: 게시판 기능은 스켈레톤 프로젝트의 **예시 구현**입니다. 실제 프로젝트에서는 필요한 기능으로 대체하여 사용하세요.

## 🚀 빠른 시작

### Docker로 실행 (권장)

```bash
# 1. 저장소 클론
git clone https://github.com/kimhyosung1/toy-project.git
cd toy-project

# 2. 실행 권한 부여
chmod +x docker.sh

# 3. 애플리케이션 빌드
pnpm run build:all:swc

# 4. Docker로 전체 시스템 시작
./docker.sh dev up -d

# 5. 상태 확인
./docker.sh dev ps
```

### 로컬 개발 환경

```bash
# 1. 의존성 설치
pnpm install

# 2. 각 서비스를 개별 터미널에서 실행
pnpm run start:dev:gateway      # 터미널 1
pnpm run start:dev:board        # 터미널 2
pnpm run start:dev:notification # 터미널 3
pnpm run start:dev:scheduler    # 터미널 4
```

### 서비스 확인

- **Gateway API**: http://localhost:3000
- **Swagger 문서**: http://localhost:3000/api-docs ⭐
- **헬스체크**: http://localhost:3000/health-check

## 🏗️ 기술 스택

### 백엔드 & 런타임

- **NestJS v11**: 최신 프레임워크
- **TypeScript v5.1.3**: 강력한 타입 시스템
- **Node.js v22**: 최신 LTS 버전
- **SWC 컴파일러**: 15.6% 빌드 성능 향상

### 데이터베이스 & 캐싱

- **MySQL 8.0+**: 관계형 데이터베이스
- **TypeORM**: ORM 라이브러리
- **Redis**: 캐싱 및 큐 시스템

### 인프라 & 도구

- **Docker + Docker Compose**: 컨테이너화
- **pnpm v8**: 고성능 패키지 매니저
- **Swagger**: API 문서화

## 🛠️ 개발 명령어

### 개발 서버 (SWC 자동 적용)

```bash
pnpm run start:dev:gateway      # Gateway 서비스
pnpm run start:dev:board        # Board 서비스
pnpm run start:dev:notification # Notification 서비스
pnpm run start:dev:scheduler    # Scheduler 서비스
```

### 빌드

```bash
pnpm run build:all:swc          # 모든 앱 SWC 빌드 (권장)
pnpm run build:all              # 모든 앱 기존 빌드
```

### Docker 관리

```bash
./docker.sh dev up -d           # 개발 환경 시작
./docker.sh dev logs gateway    # 로그 확인
./docker.sh dev down            # 서비스 중지
```

### 테스트

```bash
pnpm test                       # 단위 테스트
pnpm test:e2e                   # E2E 테스트
pnpm test:cov                   # 커버리지 테스트
```

## 📊 주요 API 엔드포인트

### 시스템 API

- `GET /health-check` - Gateway 헬스체크
- `GET /health` - 시스템 상태 확인
- `GET /api-docs` - Swagger API 문서

### 게시판 API (예시 구현)

- `POST /boards` - 게시글 작성
- `GET /boards` - 게시글 목록 조회 (페이징, 검색)
- `PUT /boards/:id` - 게시글 수정 (비밀번호 인증)
- `DELETE /boards/:id` - 게시글 삭제 (비밀번호 인증)

### 댓글 API (예시 구현)

- `POST /boards/:id/comments` - 댓글/대댓글 작성
- `GET /boards/:id/comments` - 댓글 목록 조회 (계층형)

> 📖 **상세한 API 명세**: [API 인터페이스 문서](./ssot/05_API_Interface.md) 참조

## 🔧 주요 기능

### 🤖 자동화된 응답 시스템

```typescript
@MessagePattern(CustomMessagePatterns.CreateBoard)
@CheckResponseWithType(CreateBoardResponse) // 👈 자동 변환 활성화
async createBoard(@Payload() input: CreateBoardRequest): Promise<CreateBoardResponse> {
  return this.boardService.createBoard(input);
}
```

### 🛡️ 3단계 에러 방어

1. **ResponseTransformInterceptor**: 자동 타입 변환 및 검증
2. **AllExceptionFilter**: 모든 예외의 최종 처리
3. **UtilityService**: 안전한 JSON 직렬화

### 📊 Enhanced DB Sync System

```bash
# 개발 환경에서 DB 스키마 동기화
./scripts/run-enhanced-db-sync.sh dev
```

## 📈 성능 최적화

### SWC 컴파일러

- **빌드 성능**: 15.6% 향상 (1710ms vs 2027ms)
- **개발 서버**: 483ms 초고속 빌드
- **자동 적용**: 모든 개발 스크립트에서 SWC 사용

### pnpm 패키지 관리

- **빠른 설치**: npm/yarn 대비 2-3배 빠른 속도
- **디스크 절약**: 심볼릭 링크를 통한 중복 제거
- **효율적 캐시**: 글로벌 저장소 활용

### Docker 최적화

- **멀티스테이지 빌드**: 최종 이미지 크기 최소화
- **pnpm 8.15.6 고정**: 일관된 의존성 관리
- **Alpine Linux**: 경량 베이스 이미지

## 🔒 보안 기능

### 입력 데이터 보안

- **class-validator**: 자동 유효성 검증
- **SQL Injection 방지**: TypeORM 사용
- **XSS 방지**: 입력 데이터 이스케이프

### 비밀번호 보안

- **bcrypt 해시**: 단방향 암호화
- **응답 제외**: `@Expose()` 없는 필드 자동 제외
- **salt 자동 생성**: 레인보우 테이블 공격 방지

### 기술 문서

- **완전한 가이드**: [SSOT 폴더](./ssot/) - 모든 상세 문서
- **아키텍처**: [시스템 아키텍처](./ssot/02_System_Architecture.md)
- **API 가이드**: [API 인터페이스](./ssot/04_API_Interface.md)
- **Docker 가이드**: [Docker 구성](./ssot/07_Docker_Configuration.md)

### 개발 지원

- **이슈 리포트**: GitHub Issues
- **기능 요청**: GitHub Discussions
- **문서 업데이트**: Pull Requests

## 🤖 AI 협업 팁

### SSOT 기반 질문 방법

```
이 NestJS 마이크로서비스 프로젝트에서 [질문 내용]을 하고 싶습니다.
SSOT 문서(ssot/ 폴더)를 참고하여 현재 아키텍처에 맞게 답변해주세요.
```

**참고할 핵심 문서**:

- 아키텍처 질문 → `02_System_Architecture.md`
- API 관련 → `04_API_Interface.md`
- 데이터베이스 → `03_Database_Schema.md`
- Docker 관련 → `07_Docker_Configuration.md`

---

**Made with ❤️ using NestJS v11, Node.js v22, Docker, and pnpm v8**

> 📚 **더 자세한 정보**: [SSOT 문서 폴더](./ssot/)에서 전체 프로젝트 문서를 확인하세요.
