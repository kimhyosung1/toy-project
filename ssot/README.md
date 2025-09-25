# 🎯 SSOT (Single Source of Truth) - 통합 문서 시스템

**NestJS 마이크로서비스 스켈레톤 프로젝트의 모든 기술 문서**

> 🚀 **빠른 시작**: [완전한 가이드](./COMPLETE_GUIDE.md)에서 모든 정보를 한번에 확인하세요!

## 📚 문서 구조

### 🎯 메인 가이드

- **[00_COMPLETE_GUIDE.md](./00_COMPLETE_GUIDE.md)** - 🚀 **모든 정보 통합 가이드 (완전 통합)**
- **[01_UPDATE_GUIDE.md](./01_UPDATE_GUIDE.md)** - 🔄 **SSOT 갱신 가이드 (AI용)**

### 🔧 서비스별 문서

| 서비스       | 포트 | 문서                                                                       | 역할            |
| ------------ | ---- | -------------------------------------------------------------------------- | --------------- |
| Gateway      | 3000 | [gateway-service.md](./services/gateway/gateway-service.md)                | API Gateway     |
| Board        | 3001 | [board-service.md](./services/board/board-service.md)                      | 게시판 시스템   |
| Notification | 3002 | [notification-service.md](./services/notification/notification-service.md) | 알림 시스템     |
| Scheduler    | 3004 | [scheduler-service.md](./services/scheduler/scheduler-service.md)          | 스케줄링        |
| Account      | 3005 | [account-service.md](./services/account/account-service.md)                | JWT 인증 시스템 |
| File         | 3006 | [file-service.md](./services/file/file-service.md)                         | 파일 관리       |

### 🚀 운영 문서

- **[operations/CI-CD/](./operations/CI-CD/)** - CI/CD 및 Docker 설정
- **[operations/database/](./operations/database/)** - DB 관리

## 🤖 AI와 효율적인 협업

### 효율적인 질문 방법

```bash
# ✅ 구체적인 키워드 사용 (토큰 절약)
ssot gateway "라우팅 수정하고 싶어"
ssot board "게시글 좋아요 기능 추가"
ssot database "새 테이블 추가"

# ❌ 모호한 질문 (토큰 낭비)
ssot "뭔가 안돼요"
ssot "전체 시스템 수정"
```

### 서비스별 키워드

| 키워드                   | 대상 서비스  | 예시                     |
| ------------------------ | ------------ | ------------------------ |
| `gateway`, `라우팅`      | Gateway      | "새 API 엔드포인트 추가" |
| `board`, `게시글`        | Board        | "댓글 수정 기능 구현"    |
| `notification`, `알림`   | Notification | "통합 알림 시스템 사용"  |
| `database`, `entity`     | Database     | "새 컬럼 추가"           |
| `docker`, `cicd`, `배포` | Operations   | "CI/CD 파이프라인 설정"  |

## 🚀 빠른 시작

### 1. 개발 환경 설정

```bash
# 의존성 설치
pnpm install

# Docker 환경 시작
./docker.sh dev up -d

# API 확인
curl http://localhost:3000/health-check
```

### 2. 개발 서버 실행

```bash
# Gateway (필수)
pnpm run start:dev:gateway

# Board 서비스
pnpm run start:dev:board

# 기타 서비스
pnpm run start:dev:notification
```

### 3. API 문서 확인

```bash
# Swagger UI
open http://localhost:3000/api-docs

# API 테스트
curl -X POST http://localhost:3000/boards \
  -H "Content-Type: application/json" \
  -d '{"title":"테스트","content":"내용","author":"작성자","password":"1234"}'
```

## 📊 주요 특징

### 🎯 핵심 기술

- **NestJS v11** + TypeScript v5.1.3
- **SWC 컴파일러** (15.6% 성능 향상)
- **마이크로서비스 아키텍처** (6개 서비스)
- **Docker 컨테이너화** (개발/운영 환경 분리)

### 🔒 보안 기능

- **bcrypt 비밀번호 해싱**
- **class-validator 입력 검증**
- **CORS 설정**
- **SQL Injection 방지**

### ⚡ 성능 최적화

- **Redis 캐싱**
- **데이터베이스 인덱스**
- **페이징 처리**
- **압축 응답**

## 🔧 주요 명령어

### 개발

```bash
# 개발 서버
pnpm run start:dev:[서비스명]

# 테스트
pnpm test apps/[서비스명]

# 빌드
pnpm run build:all:swc
```

### Docker

```bash
# 환경 시작
./docker.sh [dev|qa|prod] up -d

# 로그 확인
./docker.sh dev logs -f [서비스명]

# 서비스 재시작
./docker.sh dev restart [서비스명]
```

## 📈 업데이트 내역 (2025-09-25)

### ✅ v6.1 - 통합 알림 시스템 완성 (2025.09.25)

- **🌐 CommonNotificationService**: 모든 앱에서 사용하는 통합 알림 클라이언트
- **🎯 타입 안전성**: Enum 기반 타입 시스템 구축
- **🔄 배치 처리**: 500개씩 청킹하여 대량 알림 처리
- **🛡️ 완벽한 예외 처리**: 절대 throw하지 않음, 안정성 보장
- **📋 SSOT 완전 갱신**: 95% 이상 코드 일치율 달성

### ✅ v6.0 - 완전 통합 완성

- **📄 2개 핵심 문서**: 00_COMPLETE_GUIDE.md + 01_UPDATE_GUIDE.md
- **🗂️ 완전 단순화**: 3개 파일을 2개로 통합 (01_PRD.md, CORE_REFERENCE.md 통합)
- **🔄 갱신 체계화**: AI가 일관되게 SSOT 업데이트할 수 있는 명확한 가이드
- **🎯 극한 효율성**: AI 작업에 꼭 필요한 정보만 2개 파일에 집약

### 🧹 완전 통합 완료

- **01_PRD.md** → 삭제 (DEPRECATED, 더 이상 사용 안함)
- **CORE_REFERENCE.md** → 00_COMPLETE_GUIDE.md에 통합
- **00_MASTER_INDEX.md** → 삭제 (메타 정보만 있어서 불필요)
- **01_UPDATE_GUIDE.md** → 신규 추가 (SSOT 갱신 체계화)
- **core/ 폴더 4개 파일** → 모두 00_COMPLETE_GUIDE.md에 통합
- **AI_DEVELOPMENT_GUIDE.md** → 00_COMPLETE_GUIDE.md 통합
- **SERVICE\_\*\_GUIDE.md** → 00_COMPLETE_GUIDE.md 통합

---

**💡 팁**:

- **모든 정보**: [00_COMPLETE_GUIDE.md](./00_COMPLETE_GUIDE.md) - 아키텍처부터 개발까지 모든 것
- **갱신 가이드**: [01_UPDATE_GUIDE.md](./01_UPDATE_GUIDE.md) - AI가 SSOT를 일관되게 갱신
- **2개 파일로 완전한 SSOT 시스템!** 🚀
