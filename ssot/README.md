# SSOT (Single Source of Truth) - 익명 게시판 프로젝트

## 📚 문서 개요

이 폴더는 **익명 게시판 및 키워드 알림 시스템**의 모든 핵심 정보를 담고 있는 **SSOT(Single Source of Truth)** 디렉터리입니다.

AI 기반 코딩을 위한 완전한 프로젝트 컨텍스트를 제공하며, 모든 개발 작업은 이 문서들을 기반으로 진행됩니다.

## 📋 문서 구조

### 1. [PRD (Product Requirements Document)](./01_PRD.md)

**내용**: 프로젝트 요구사항 및 기능 명세

- 프로젝트 목적 및 범위
- 핵심 기능 요구사항
- 시스템 아키텍처 개요
- 보안 및 성능 요구사항
- 미구현 기능 및 부족한 정보 분석

**AI 활용**: 새로운 기능 개발 시 요구사항 확인 및 기능 범위 결정

### 2. [UserFlow (사용자 플로우)](./02_UserFlow.md)

**내용**: 모든 사용자 상호작용과 시스템 플로우

- 게시글/댓글 관련 플로우
- 키워드 알림 플로우
- 서비스 간 통신 플로우
- 에러 처리 플로우
- 트랜잭션 관리 플로우

**AI 활용**: 기능 개발 시 전체적인 플로우 이해 및 예외 상황 처리

### 3. [Database Schema (데이터베이스 스키마)](./03_Database_Schema.md)

**내용**: 데이터베이스 구조 및 관계

- 모든 테이블 구조 및 컬럼 정의
- Entity 관계 및 외래키 제약조건
- 인덱스 및 성능 최적화 정보
- TypeORM Entity 매핑 정보
- 쿼리 최적화 가이드

**AI 활용**: DB 관련 작업 시 스키마 정보 참조 및 쿼리 최적화

### 4. [API Interface (API 인터페이스)](./04_API_Interface.md)

**내용**: 모든 API 엔드포인트 및 스펙

- REST API 엔드포인트 정의
- Request/Response DTO 스키마
- 에러 코드 및 응답 형식
- API 플로우 및 통신 방식
- 보안 및 성능 고려사항

**AI 활용**: API 개발 및 수정 시 인터페이스 일관성 유지

### 5. [Package Management (패키지 관리)](./05_Package_Management.md)

**내용**: 패키지 관리 및 빌드 시스템

- pnpm v8 패키지 매니저 최적화
- SWC 컴파일러 성능 향상 (15.6%)
- 의존성 관리 및 버전 호환성
- 빌드 최적화 전략

**AI 활용**: 패키지 업데이트 및 빌드 최적화 시 참조

### 6. [SWC Build System (SWC 빌드 시스템)](./06_SWC_Build_System.md)

**내용**: SWC 컴파일러 기반 고성능 빌드 시스템

- SWC vs TypeScript 성능 비교
- 자동 SWC 적용 설정
- 개발 서버 최적화 (483ms 빌드)
- 프로덕션 빌드 최적화

**AI 활용**: 빌드 성능 최적화 및 컴파일러 설정 시 참조

**내용**: 프로젝트 의존성 및 설정 관리

- 모든 의존성 패키지 목록 및 버전
- 스크립트 명령어 및 설정 파일
- 환경별 설정 관리
- 빌드 및 배포 가이드
- 의존성 관리 전략

**AI 활용**: 패키지 추가/수정 시 호환성 검증 및 설정 관리

## 🤖 AI 코딩 활용 가이드

### 1. 새로운 기능 개발 시

1. **PRD** → 요구사항 확인
2. **UserFlow** → 플로우 설계
3. **Database Schema** → 데이터 모델 확인
4. **API Interface** → API 설계
5. **Package Management** → 필요한 의존성 확인

### 2. 버그 수정 시

1. **UserFlow** → 예상 플로우와 비교
2. **API Interface** → 응답 형식 확인
3. **Database Schema** → 데이터 무결성 확인

### 3. 성능 최적화 시

1. **Database Schema** → 인덱스 및 쿼리 최적화
2. **API Interface** → 응답 시간 목표 확인
3. **Package Management** → 번들 크기 최적화

### 4. 새로운 의존성 추가 시

1. **Package Management** → 기존 의존성과의 호환성 확인
2. **PRD** → 요구사항 부합 여부 확인

## 📊 프로젝트 현황 요약

### ✅ 구현 완료 기능

- 게시글 CRUD (작성, 조회, 수정, 삭제)
- 댓글 시스템 (댓글, 대댓글)
- 키워드 알림 시스템 (매칭 및 큐 처리)
- 마이크로서비스 아키텍처 (Gateway, Board, Notification)
- 페이징 및 검색 기능
- 비밀번호 암호화 (bcrypt)

### ⚠️ 부족한 정보 및 미구현 기능

1. **환경 설정**: 환경별 설정 가이드 부족
2. **API 문서**: 상세한 에러 코드 정의 부족
3. **배포 가이드**: Docker, CI/CD 설정 부족
4. **모니터링**: 로깅 전략 및 에러 추적 시스템 부재
5. **키워드 관리**: 키워드 등록/삭제 API 미구현
6. **실제 알림**: 이메일, 푸시 알림 기능 미구현

### 🔧 기술 스택

- **Runtime**: Node.js v22.12.0 (LTS)
- **Backend**: NestJS v11, TypeScript
- **Web Framework**: Express v5
- **Database**: MySQL, TypeORM
- **Cache/Queue**: Redis, Bull
- **API Docs**: Swagger
- **Security**: bcrypt, class-validator
- **Architecture**: MSA (TCP 통신)

## 🔄 문서 업데이트 규칙

### 1. 코드 변경 시 문서 동기화

- 새로운 API 추가 → **API Interface** 업데이트
- DB 스키마 변경 → **Database Schema** 업데이트
- 새로운 의존성 추가 → **Package Management** 업데이트

### 2. 문서 우선순위

1. **PRD**: 요구사항 변경 시
2. **UserFlow**: 플로우 변경 시
3. **Database Schema**: DB 변경 시
4. **API Interface**: API 변경 시
5. **Package Management**: 의존성 변경 시

### 3. 문서 일관성 유지

- 용어 통일 (Entity명, API 경로 등)
- 버전 정보 동기화
- 예시 코드 업데이트

## 🎯 AI 코딩 최적화 팁

### 1. 컨텍스트 제공

이 SSOT 문서들을 AI에게 제공하여 프로젝트 전체 맥락을 이해시킨 후 작업 요청

### 2. 단계별 접근

큰 기능은 작은 단위로 나누어 각 단계별로 해당 문서 참조

### 3. 일관성 유지

기존 코드 패턴과 일치하도록 문서의 예시 및 규칙 준수

### 4. 검증 단계

개발 완료 후 각 문서의 내용과 일치하는지 검증

## 📞 문의 및 개선 제안

이 SSOT 문서들에 대한 개선 제안이나 추가가 필요한 정보가 있으면 프로젝트 팀에 문의해 주세요.

---

**마지막 업데이트**: 2024년 (NestJS v11 업그레이드)
**문서 버전**: 1.1.0
**프로젝트 버전**: 0.0.1
**Node.js 버전**: v22.12.0 (LTS)
**NestJS 버전**: v11.x
