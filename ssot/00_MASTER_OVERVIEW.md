# 🎯 NestJS 마이크로서비스 스켈레톤 - 마스터 개요

**NestJS v11 기반 마이크로서비스 아키텍처 스켈레톤 프로젝트**

> 🤖 **AI 개발자 참고**: 코드 변경 시 아래 AI 작업 가이드를 반드시 따라 문서 일치율 95% 이상을 유지하세요!

## 📋 프로젝트 핵심 정보

### 기본 정보

- **프로젝트명**: NestJS 마이크로서비스 스켈레톤
- **프로젝트 성격**: 즉시 사용 가능한 완성도 높은 MSA 템플릿
- **버전**: 0.0.1
- **아키텍처**: MSA (Microservice Architecture)
- **기술 스택**: NestJS v11, TypeScript v5.1.3, MySQL, Redis
- **런타임**: Node.js v22 (LTS)
- **컴파일러**: SWC (15.6% 성능 향상)
- **패키지 매니저**: pnpm v8

### 핵심 특징 (즉시 사용 가능한 스켈레톤)

- **🚀 완전 자동화된 응답 검증/변환 시스템**: `@CheckResponseWithType` 데코레이터 기반
- **🛡️ 3단계 에러 방어 시스템**: 안전한 JSON 직렬화 및 예외 처리
- **🏗️ 마이크로서비스 아키텍처**: Gateway 패턴으로 서비스 분리
- **🐳 Docker 컨테이너화**: 일관된 개발/운영 환경
- **⚡ 고성능 최적화**: SWC 컴파일러 + pnpm v8
- **📊 Enhanced DB Sync System**: 완전 자동화된 Entity/Repository 생성
- **🎯 프로덕션 레디**: 기능만 추가하면 바로 운영 환경 배포 가능

## 🏛️ 마이크로서비스 구조

### 현재 운영 중인 서비스 (6개)

| 서비스           | 포트 | 역할                             | 상태    |
| ---------------- | ---- | -------------------------------- | ------- |
| **Gateway**      | 3000 | API Gateway, HTTP → TCP 프록시   | ✅ 운영 |
| **Board**        | 3001 | 게시글/댓글 CRUD, 비밀번호 인증  | ✅ 운영 |
| **Notification** | 3002 | 알림 처리 (Slack, Sentry, Email) | ✅ 운영 |
| **Scheduler**    | 3004 | 스케줄링, Cron 작업              | ✅ 운영 |
| **Account**      | 3005 | 계정 관리, 사용자 인증           | ✅ 운영 |
| **File**         | 3006 | 파일 업로드/다운로드, 파일 관리  | ✅ 운영 |

### 🔧 새로운 서비스 추가 패턴

**포트 할당 규칙**: 3000번대 순차 할당 (3007, 3008, 3009...)
**서비스명 규칙**: PascalCase (예: AuthService, PaymentService)
**컨테이너명 규칙**: lowercase (예: auth, payment)

**새 서비스 추가 시 업데이트할 문서들**:

1. `00_MASTER_OVERVIEW.md` - 서비스 목록 추가
2. `02_System_Architecture.md` - 아키텍처 다이어그램 업데이트
3. `03_Database_Schema.md` - 새 테이블 스키마 추가 (필요시)
4. `04_API_Interface.md` - 새 API 엔드포인트 추가
5. `07_Docker_Configuration.md` - 새 컨테이너 설정 추가

> **참고**: 시스템 단순화를 위해 불필요한 테스트 서비스들은 제거되었습니다. (일부 레거시 코드는 호환성을 위해 유지)

## 🌐 API 구조

### 시스템 API

- `GET /health-check` - Gateway 헬스체크
- `GET /health` - 시스템 상태 확인
- `GET /api-docs` - Swagger API 문서 ⭐

### 게시판 API

- `POST /boards` - 게시글 작성
- `GET /boards` - 게시글 목록 조회 (페이징, 검색)
- `PUT /boards/:id` - 게시글 수정 (비밀번호 인증)
- `DELETE /boards/:id` - 게시글 삭제 (비밀번호 인증)

### 댓글 API

- `POST /boards/:id/comments` - 댓글/대댓글 작성
- `GET /boards/:id/comments` - 댓글 목록 조회 (계층형)

## 🗄️ 데이터베이스 구조

### 데이터베이스 테이블

**현재 활성 테이블** (4개):

- `tb_board` - 게시글 (제목, 내용, 작성자, 비밀번호)
- `tb_comment` - 댓글 (계층형 구조, 자기참조)
- `tb_user` - 사용자 정보 (기본 구조 준비됨)
- `tb_test1` - 테스트용 테이블

**기타**: 추가 엔티티 파일들 존재하지만 현재 비활성화 상태

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
pnpm run start:dev:account      # 터미널 5
pnpm run start:dev:file         # 터미널 6
```

### 서비스 확인

- **Gateway API**: http://localhost:3000
- **Swagger 문서**: http://localhost:3000/api-docs ⭐ ("NestJS 마이크로서비스 스켈레톤 API")
- **헬스체크**: http://localhost:3000/health-check

## 📚 SSOT 문서 구조

### 🔧 핵심 시스템

- **[01_PRD.md](./01_PRD.md)** - 프로젝트 요구사항 및 기능 명세
- **[02_System_Architecture.md](./02_System_Architecture.md)** - 마이크로서비스 구조 및 설계 원칙

### 🌐 API 및 데이터

- **[03_Database_Schema.md](./03_Database_Schema.md)** - 테이블 구조 및 관계도
- **[04_API_Interface.md](./04_API_Interface.md)** - REST API 명세서 및 사용법

### 🚀 개발 및 배포

- **[07_Docker_Configuration.md](./07_Docker_Configuration.md)** - 컨테이너화 및 배포 가이드
- **[08_Database_Management.md](./08_Database_Management.md)** - 자동화된 DB 동기화 시스템

> **📦 패키지 관리 및 빌드 시스템**: [02_System_Architecture.md](./02_System_Architecture.md)의 "개발 환경 및 빌드 시스템" 섹션 참조

## 🔧 주요 기능

### 자동화된 응답 시스템

```typescript
@MessagePattern(CustomMessagePatterns.CreateBoard)
@CheckResponseWithType(CreateBoardResponse) // 👈 자동 변환 활성화
async createBoard(@Payload() input: CreateBoardRequest): Promise<CreateBoardResponse> {
  return this.boardService.createBoard(input);
}
```

### 3단계 에러 방어

1. **ResponseTransformInterceptor**: 자동 타입 변환 및 검증
2. **AllExceptionFilter**: 모든 예외의 최종 처리
3. **UtilityService**: 안전한 JSON 직렬화

### Enhanced DB Sync System

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

## 🔒 보안 기능

### 입력 데이터 보안

- **class-validator**: 자동 유효성 검증
- **SQL Injection 방지**: TypeORM 사용
- **XSS 방지**: 입력 데이터 이스케이프

### 비밀번호 보안

- **bcrypt 해시**: 단방향 암호화
- **응답 제외**: `@Expose()` 없는 필드 자동 제외
- **salt 자동 생성**: 레인보우 테이블 공격 방지

## 🛠️ 개발 명령어

### 개발 서버 (SWC 자동 적용)

```bash
pnpm run start:dev:gateway      # Gateway 서비스
pnpm run start:dev:board        # Board 서비스
pnpm run start:dev:notification # Notification 서비스
pnpm run start:dev:scheduler    # Scheduler 서비스
pnpm run start:dev:account      # Account 서비스
pnpm run start:dev:file         # File 서비스
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

## 🎯 현재 구현 상태

### 완료된 핵심 기능

- **✅ 마이크로서비스 아키텍처**: 6개 서비스 운영 중
- **✅ 자동화된 응답 시스템**: `@CheckResponseWithType` 데코레이터
- **✅ Docker 컨테이너화**: 완전한 개발/운영 환경
- **✅ 게시판 시스템**: CRUD + 댓글 기능
- **✅ 알림 시스템**: 키워드 기반 알림 처리
- **✅ 스케줄링**: Cron 기반 배치 작업
- **✅ 계정 관리**: 사용자 인증 및 계정 관리
- **✅ 파일 관리**: 파일 업로드/다운로드 시스템

## 🤖 AI 개발자 작업 가이드

### 핵심 원칙

> **모든 코드 변경 후 SSOT 문서와의 일치율이 95% 이상이 되도록 자동으로 문서를 업데이트해야 합니다.**

### 🚀 즉시 사용 가능한 프롬프트

#### 1. 전체 일치율 확인 (개발 완료 후 필수)

```
ssot 현재 구현되어있는 코드랑 모든 SSOT 문서들의 일치율이 95%이상인지 확인하고, 부족한 문서들은 자동으로 업데이트해줘
```

#### 2. 새 서비스 추가 후 문서 동기화

```
ssot [서비스명] 서비스를 포트 [포트번호]로 추가했습니다. 관련 SSOT 문서들을 실제 구현에 맞게 업데이트하여 일치율 95% 이상을 달성해주세요.
```

#### 3. 새 테이블/Entity 추가 후 문서 동기화

```
ssot [테이블명/Entity명]을 추가했습니다. Database Schema 문서와 관련 SSOT 문서들을 실제 구현에 맞게 업데이트해주세요.
```

#### 4. 새 API 엔드포인트 추가 후 문서 동기화

```
ssot [HTTP_METHOD] [엔드포인트] API를 추가했습니다. API Interface 문서를 업데이트하고 관련 SSOT 문서들의 일치율을 95% 이상으로 맞춰주세요.
```

#### 5. 기능 제거/Deprecated 처리

```
ssot [기능명/테이블명]을 제거했습니다. 모든 SSOT 문서에서 해당 내용을 @deprecated 처리하거나 제거하여 실제 구현과 일치시켜주세요.
```

### 📋 SSOT 문서 업데이트 대상

| 변경 유형                | 업데이트 대상 문서                                                          |
| ------------------------ | --------------------------------------------------------------------------- |
| **새 서비스 추가**       | `00_MASTER_OVERVIEW.md`, `02_System_Architecture.md`, `04_API_Interface.md` |
| **새 Entity/Table 추가** | `03_Database_Schema.md`, `00_MASTER_OVERVIEW.md`                            |
| **새 API 엔드포인트**    | `04_API_Interface.md`, `02_System_Architecture.md`                          |
| **Docker 설정 변경**     | `02_System_Architecture.md`, `05_Docker_Configuration.md`                   |
| **기능 추가/제거**       | `01_PRD.md`, `00_MASTER_OVERVIEW.md`                                        |
| **빌드/패키지 변경**     | `02_System_Architecture.md` (개발 환경 섹션)                                |
| **DB 구조 변경**         | `03_Database_Schema.md`, `06_Database_Management.md`                        |

### ⚠️ 필수 검증 사항

**작업 완료 후 반드시 확인**:

- [ ] 변경된 코드가 모든 관련 SSOT 문서에 반영되었는가?
- [ ] 새로운 기능이 적절한 문서 섹션에 추가되었는가?
- [ ] Deprecated된 기능이 올바르게 표시되었는가?
- [ ] 모든 SSOT 문서의 일치율이 95% 이상인가?
- [ ] 문서 간 일관성이 유지되고 있는가?

### 💡 95% 일치율 달성 기준

- **구조 일치**: 실제 폴더/파일 구조와 100% 일치
- **기능 일치**: 구현된 기능만 문서화, 미구현 기능 제외
- **상태 정확성**: 활성/비활성/Deprecated 상태 정확히 반영
- **관계 일치**: Entity 관계, 서비스 간 통신 등 정확히 반영
- **설정 일치**: 포트, 환경변수, Docker 설정 등 정확히 반영

> **🤖 AI 개발자 핵심 원칙**: Single Source of Truth 원칙 준수가 프로젝트 품질의 핵심입니다!

---

**Made with ❤️ using NestJS v11, Node.js v22, Docker, and pnpm v8**

> 📚 **더 자세한 정보**: 각 SSOT 문서에서 상세한 기술 문서를 확인하세요.
