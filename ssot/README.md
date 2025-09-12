# SSOT (Single Source of Truth) 문서

**익명 게시판 및 키워드 알림 시스템의 모든 기술 문서가 여기에 있습니다.**

## 📚 문서 구조

### 🔧 시스템 설계 및 아키텍처

| 문서                                                            | 설명                          | 주요 내용                                     |
| --------------------------------------------------------------- | ----------------------------- | --------------------------------------------- |
| **[📋 01_PRD.md](./01_PRD.md)**                                 | Product Requirements Document | 프로젝트 요구사항, 기능 명세, 사용자 스토리   |
| **[🏗️ 01_System_Architecture.md](./01_System_Architecture.md)** | 시스템 아키텍처               | 마이크로서비스 구조, 설계 원칙, 자동화 시스템 |
| **[🔄 02_UserFlow.md](./02_UserFlow.md)**                       | 사용자 플로우                 | 사용자 경험, 워크플로우, 상호작용             |

### 🌐 API 및 데이터베이스

| 문서                                                    | 설명                | 주요 내용                               |
| ------------------------------------------------------- | ------------------- | --------------------------------------- |
| **[🗄️ 03_Database_Schema.md](./03_Database_Schema.md)** | 데이터베이스 스키마 | 테이블 구조, 관계도, 인덱스 설계        |
| **[📡 04_API_Interface.md](./04_API_Interface.md)**     | API 인터페이스      | REST API 명세, 요청/응답 DTO, 사용 예시 |

### 🚀 개발 및 배포

| 문서                                                              | 설명            | 주요 내용                          |
| ----------------------------------------------------------------- | --------------- | ---------------------------------- |
| **[📦 05_Package_Management.md](./05_Package_Management.md)**     | 패키지 관리     | pnpm 설정, 의존성 관리, 스크립트   |
| **[⚡ 06_SWC_Build_System.md](./06_SWC_Build_System.md)**         | SWC 빌드 시스템 | 고성능 빌드 설정, 성능 비교        |
| **[🐳 07_Docker_Configuration.md](./07_Docker_Configuration.md)** | Docker 구성     | 컨테이너화, 배포 가이드, 환경 관리 |

### 📖 통합 가이드

| 문서                                  | 설명                 | 주요 내용                             |
| ------------------------------------- | -------------------- | ------------------------------------- |
| **[📝 00_README.md](./00_README.md)** | 전체 프로젝트 가이드 | 완전한 프로젝트 문서 (기존 README.md) |

## 🎯 문서 사용 가이드

### 👥 역할별 추천 문서

**🔧 개발자**:

1. [시스템 아키텍처](./01_System_Architecture.md) - 전체 구조 이해
2. [API 인터페이스](./04_API_Interface.md) - API 개발 및 테스트
3. [Docker 구성](./07_Docker_Configuration.md) - 로컬 개발 환경 설정

**🏗️ 아키텍트**:

1. [PRD](./01_PRD.md) - 요구사항 분석
2. [시스템 아키텍처](./01_System_Architecture.md) - 설계 원칙 및 구조
3. [데이터베이스 스키마](./03_Database_Schema.md) - 데이터 모델링

**🚀 DevOps**:

1. [Docker 구성](./07_Docker_Configuration.md) - 컨테이너 배포
2. [패키지 관리](./05_Package_Management.md) - 의존성 관리
3. [SWC 빌드 시스템](./06_SWC_Build_System.md) - 빌드 최적화

**📊 PM/PO**:

1. [PRD](./01_PRD.md) - 제품 요구사항
2. [사용자 플로우](./02_UserFlow.md) - 사용자 경험
3. [API 인터페이스](./04_API_Interface.md) - 기능 명세

### 🔍 상황별 문서 찾기

**🚀 프로젝트 시작**:

- [전체 가이드](./00_README.md) → [시스템 아키텍처](./01_System_Architecture.md) → [Docker 구성](./07_Docker_Configuration.md)

**🔧 API 개발**:

- [API 인터페이스](./04_API_Interface.md) → [데이터베이스 스키마](./03_Database_Schema.md) → [시스템 아키텍처](./01_System_Architecture.md)

**🐳 배포 및 운영**:

- [Docker 구성](./07_Docker_Configuration.md) → [패키지 관리](./05_Package_Management.md) → [SWC 빌드 시스템](./06_SWC_Build_System.md)

**🛠️ 문제 해결**:

- [시스템 아키텍처](./01_System_Architecture.md) → [Docker 구성](./07_Docker_Configuration.md) → [전체 가이드](./00_README.md)

## 📈 문서 업데이트 이력

### 2025-09-12 (최신)

- ✅ **전체 문서 구조 재정비**: SSOT 원칙 적용
- ✅ **시스템 아키텍처 업데이트**: 현재 Docker 구성 반영
- ✅ **API 인터페이스 완전 재작성**: 실제 구현 기반 명세
- ✅ **Docker 구성 문서 신규 작성**: 컨테이너화 완전 가이드
- ✅ **루트 README 간소화**: SSOT 문서 중심 구조

### 주요 변경사항

- **Docker 포트 정보 업데이트**: 3000(Gateway), 3001(Board), 3002(Notification), 3003(Test2)
- **컨테이너명 간소화**: `toy-project-gateway` → `gateway`
- **실제 API 엔드포인트 반영**: 구현된 API만 문서화
- **자동화 시스템 강조**: `@CheckResponseWithType` 데코레이터 시스템
- **성능 최적화 정보**: SWC 컴파일러, pnpm 최적화

## 🔄 문서 유지보수

### 문서 업데이트 원칙

1. **Single Source of Truth**: 중복 정보 제거, 단일 진실 공급원
2. **실제 구현 기반**: 코드와 일치하는 문서 유지
3. **역할별 최적화**: 사용자별 맞춤 정보 제공
4. **지속적 업데이트**: 코드 변경 시 문서 동기화

### 문서 기여 방법

1. **이슈 생성**: 문서 오류 또는 개선사항 제보
2. **Pull Request**: 문서 수정 및 추가
3. **리뷰 프로세스**: 기술적 정확성 검증
4. **버전 관리**: 변경 이력 추적

## 🔗 외부 참조

### 기술 문서

- **[NestJS 공식 문서](https://docs.nestjs.com/)**: 프레임워크 가이드
- **[TypeORM 문서](https://typeorm.io/)**: ORM 사용법
- **[Docker 공식 문서](https://docs.docker.com/)**: 컨테이너 가이드
- **[pnpm 문서](https://pnpm.io/)**: 패키지 매니저 가이드

### 개발 도구

- **[Swagger UI](http://localhost:3000/api-docs)**: API 문서 (로컬 실행 시)
- **[TypeScript 핸드북](https://www.typescriptlang.org/docs/)**: 타입스크립트 가이드
- **[SWC 문서](https://swc.rs/)**: 컴파일러 설정

## 📞 문서 관련 문의

### 문서 오류 신고

- **GitHub Issues**: 문서 오류 또는 누락 정보 신고
- **Pull Request**: 직접 수정 제안
- **Discussion**: 문서 구조 개선 제안

### 문서 요청

- **새 문서 요청**: 필요한 문서 주제 제안
- **상세 설명 요청**: 기존 문서 보완 요청
- **예시 추가 요청**: 사용 예시 보완

---

**📚 모든 문서는 실제 구현을 기반으로 작성되었으며, 지속적으로 업데이트됩니다.**

> 💡 **팁**: 문서를 읽기 전에 [전체 가이드](./00_README.md)를 먼저 읽어보시면 전체적인 이해에 도움이 됩니다.
