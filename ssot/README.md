# SSOT (Single Source of Truth) 문서

**NestJS 마이크로서비스 스켈레톤 프로젝트의 모든 기술 문서가 여기에 있습니다.**

> 🎯 **시작하기**: [마스터 개요](./00_MASTER_OVERVIEW.md)에서 전체 시스템을 한눈에 파악하세요.

## 📚 문서 구조

### 🎯 핵심 문서

| 문서                                                            | 설명              | 주요 내용                                   |
| --------------------------------------------------------------- | ----------------- | ------------------------------------------- |
| **[🎯 00_MASTER_OVERVIEW.md](./00_MASTER_OVERVIEW.md)** ⭐      | **마스터 개요**   | 전체 시스템 한눈에 보기, 빠른 시작 가이드   |
| **[📋 01_PRD.md](./01_PRD.md)**                                 | 프로젝트 요구사항 | 기능 명세, 사용자 스토리, 비즈니스 요구사항 |
| **[🏗️ 02_System_Architecture.md](./02_System_Architecture.md)** | 시스템 아키텍처   | 마이크로서비스 구조, 설계 원칙, 통신 방식   |

### 🌐 API 및 데이터

| 문서                                                    | 설명                | 주요 내용                              |
| ------------------------------------------------------- | ------------------- | -------------------------------------- |
| **[🗄️ 04_Database_Schema.md](./04_Database_Schema.md)** | 데이터베이스 스키마 | 테이블 구조, 관계도, 인덱스 설계       |
| **[📡 05_API_Interface.md](./05_API_Interface.md)**     | API 인터페이스      | REST API 명세, Swagger 문서, 사용 예시 |

### 🚀 개발 및 배포

| 문서                                                                       | 설명                 | 주요 내용                           |
| -------------------------------------------------------------------------- | -------------------- | ----------------------------------- |
| **[📦 06_Package_Management.md](./06_Package_Management.md)**              | 패키지 관리          | pnpm v8, 의존성 관리, 모노레포 구조 |
| **[⚡ 07_SWC_Build_System.md](./07_SWC_Build_System.md)**                  | SWC 빌드 시스템      | 고성능 컴파일러, 빌드 최적화        |
| **[🐳 08_Docker_Configuration.md](./08_Docker_Configuration.md)**          | Docker 구성          | 컨테이너화, 멀티스테이지 빌드       |
| **[🔄 09_Enhanced_DB_Sync_System.md](./09_Enhanced_DB_Sync_System.md)** ⭐ | **Enhanced DB Sync** | 자동화된 Entity/Repository 생성     |

### 📖 참고 자료

| 문서                                                                                | 설명             | 주요 내용                         |
| ----------------------------------------------------------------------------------- | ---------------- | --------------------------------- |
| **[🔄 03_UserFlow.md](./03_UserFlow.md)**                                           | 사용자 플로우    | 사용자 경험, 워크플로우, 상호작용 |
| **[📋 10_Database_Procedures_Functions.md](./10_Database_Procedures_Functions.md)** | DB 프로시저 정책 | 저장 프로시저, 함수 관리 정책     |

## 🎯 역할별 추천 문서

### 👨‍💻 개발자

1. **[마스터 개요](./00_MASTER_OVERVIEW.md)** - 전체 시스템 이해 ⭐
2. **[Enhanced DB Sync](./09_Enhanced_DB_Sync_System.md)** - DB 자동화 시스템 ⭐
3. **[API 인터페이스](./05_API_Interface.md)** - API 개발 및 테스트
4. **[Docker 구성](./08_Docker_Configuration.md)** - 로컬 개발 환경

### 🏗️ 아키텍트

1. **[PRD](./01_PRD.md)** - 요구사항 분석
2. **[시스템 아키텍처](./02_System_Architecture.md)** - 설계 원칙 및 구조
3. **[데이터베이스 스키마](./04_Database_Schema.md)** - 데이터 모델링

### 🚀 DevOps

1. **[Docker 구성](./08_Docker_Configuration.md)** - 컨테이너 배포
2. **[Enhanced DB Sync](./09_Enhanced_DB_Sync_System.md)** - DB 자동화 파이프라인
3. **[패키지 관리](./06_Package_Management.md)** - 의존성 관리
4. **[SWC 빌드 시스템](./07_SWC_Build_System.md)** - 빌드 최적화

## 🚀 빠른 시작

### 프로젝트 이해하기

```bash
# 1. 마스터 개요 읽기
cat ssot/00_MASTER_OVERVIEW.md

# 2. 로컬 환경 설정
./docker.sh dev up -d

# 3. API 문서 확인
open http://localhost:3000/api-docs
```

### DB 자동화 시스템 사용

```bash
# 개발 환경에서 DB 스키마 동기화
./scripts/run-enhanced-db-sync.sh dev

# 테스트 실행 (파일 생성 안함)
./scripts/run-enhanced-db-sync.sh dev --dry-run
```

## 📈 최신 업데이트 (2025-09-13)

### ✅ 완료된 작업

- **마스터 개요 문서 신규 작성**: 전체 시스템 한눈에 보기
- **중복 문서 제거**: 00_README.md, 00_SUMMARY.md, 03_API_Interface.md, 09_Complete_Project_Structure.md 통합
- **외부 README 간소화**: SSOT 중심 구조로 변경
- **문서 구조 단순화**: 핵심 문서 중심으로 재구성

### 🔄 통합된 내용

- **Test2 서비스 비활성화**: 실제 운영에서는 사용하지 않음 (레거시 코드 일부 유지)
- **키워드 알림 기능 단순화**: 복잡성 감소를 위한 기능 제거
- **포트 번호 정정**: 실제 운영 포트 번호로 업데이트
- **서비스 상태 정확화**: 현재 운영 중인 4개 서비스만 표시

## 🔗 외부 참조

### 기술 문서

- **[NestJS 공식 문서](https://docs.nestjs.com/)**: 프레임워크 가이드
- **[TypeORM 문서](https://typeorm.io/)**: ORM 사용법
- **[Docker 공식 문서](https://docs.docker.com/)**: 컨테이너 가이드
- **[pnpm 문서](https://pnpm.io/)**: 패키지 매니저 가이드

### 개발 도구

- **[Swagger UI](http://localhost:3000/api-docs)**: API 문서 (로컬 실행 시)
- **[TypeScript 핸드북](https://www.typescriptlang.org/docs/)**: 타입스크립트 가이드

---

**📚 모든 문서는 실제 구현을 기반으로 작성되었으며, 지속적으로 업데이트됩니다.**

> 💡 **팁**: 처음 시작하시는 분은 [마스터 개요](./00_MASTER_OVERVIEW.md)부터 읽어보세요!
