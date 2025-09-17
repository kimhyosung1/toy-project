# 🗄️ Database Management - 자동화된 DB 관리

## 🎯 핵심 기능

MySQL 스키마 → TypeORM Entity, Repository, 프로시저 **자동 생성**

## 🚀 실행 방법

### 수동 실행

```bash
# 기본 실행 - 모든 것 자동 생성/업데이트
./scripts/run-enhanced-db-sync.sh dev
```

### GitHub Actions 자동 실행

```yaml
# .github/workflows/orm-generater.yml
# 브랜치 푸시시 자동 실행: dev, qa, production
on:
  push:
    branches: [dev, qa, production]
  workflow_dispatch: # 수동 실행도 지원
```

## 🤖 자동생성 로직

### 1. Entity 자동생성

- **MySQL 스키마 분석** → TypeORM Entity 클래스 생성
- **snake_case → camelCase** 변환 (board_id → boardId)
- **기존 수동 코드 보존** (관계, 커스텀 메서드 유지)

### 2. Repository 자동생성

- **새 테이블만** Repository 생성 (기존 수동 Repository 보존)
- **기본 CRUD 메서드** 자동 포함 (TypeORM 패턴)

### 3. 프로시저/함수 추출

- **MySQL Procedures & Functions** → 개별 .sql 파일
- **procedures/ 및 functions/ 폴더**로 분리 저장
- **문서화 헤더** 자동 추가 (생성일, 환경, 파라미터 정보)

### 4. 삭제된 테이블 감지

- **DB에서 삭제된 테이블** → `@deprecated` 마킹

## 📁 생성 위치

```
libs/database/src/
├── entities/           # Entity 클래스들 자동 생성
├── repositories/      # 새 테이블의 Repository만 자동 생성
└── procedures/        # SQL 프로시저/함수들
    ├── procedures/    # 프로시저 파일들 (.sql)
    └── functions/     # 함수 파일들 (.sql)
```

## ⚙️ 핵심 스크립트

### 주요 파일들

- `enhanced-db-sync.ts` - 메인 동기화 로직
- `enhanced-entity-generator.ts` - Entity 생성 로직
- `enhanced-repository-generator.ts` - Repository 생성 로직
- `procedure-extractor.ts` - 프로시저/함수 추출 로직
- `enhanced-schema-analyzer.ts` - DB 스키마 분석 로직

### 안전 장치

- **기존 Repository 보존** (board.repository.ts, comment.repository.ts 등)
- **Entity 병합 모드** (새 필드 추가, 기존 관계 유지)
- **백업 및 롤백** 시스템

## 🔄 작동 원리

### 스키마 분석 → 코드 생성

1. **MySQL INFORMATION_SCHEMA** 조회
2. **테이블 구조 분석** (컬럼, 타입, 관계)
3. **TypeORM Entity 코드 생성**
4. **기존 파일과 스마트 병합** (수동 코드 보존)

### 병합 알고리즘

- **새 필드 추가** → 자동 추가
- **기존 관계** → 그대로 유지
- **수동 메서드** → 보존
- **삭제된 테이블** → `@deprecated` 마킹

## ⚠️ 주의사항

- **MySQL 전용** (다른 DB 미지원)
- **생성된 파일 직접 편집 금지** (다음 실행시 덮어씀)
- **실행 전 백업** 자동 생성됨

## 🔄 GitHub Actions CI/CD 자동화

### ORM Generator 워크플로우 (.github/workflows/orm-generater.yml)

#### 자동 트리거

- **브랜치 푸시**: dev, qa, production 브랜치에 코드 푸시시 자동 실행
- **수동 실행**: GitHub Actions UI에서 환경 선택하여 수동 실행 가능
- **대기 시간**: Main Services CI/CD 완료 후 5분 대기 (순서 보장)

#### 지능형 스킵 로직

```bash
# 자동 커밋 루프 방지
if echo "$COMMIT_MSG" | grep -qE "\[skip ci\]|🤖 Auto-sync"; then
  echo "🤖 Auto-commit detected, skipping ORM generation"
  exit 0
fi
```

#### 환경별 DB 설정 자동화

```bash
case "${{ github.ref_name }}" in
  "dev")
    # 개발 환경 (하드코딩)
    DB_HOST=localhost
    DB_DATABASE=public
    ;;
  "qa"|"production")
    # QA/운영 환경 (GitHub Secrets 사용)
    DB_HOST=${{ secrets.QA_DB_HOST }}
    DB_PASSWORD=${{ secrets.QA_DB_PASSWORD }}
    ;;
esac
```

#### 자동 커밋 & 푸시

```bash
# 변경사항 감지 후 자동 커밋
if changes_detected; then
  git add -A
  git commit -m "🤖 Auto-sync database schema from $ENV_NAME [skip ci]"
  git push origin ${{ github.ref_name }}
fi
```

### CI/CD 실행 흐름

1. **트리거**: 브랜치 푸시 또는 수동 실행
2. **대기**: Main Services CI/CD 완료 후 5분 대기
3. **스킵 체크**: 자동 커밋인지 확인 ([skip ci] 태그)
4. **환경 설정**: 브랜치별 DB 연결 정보 설정
5. **스키마 동기화**: `./scripts/run-enhanced-db-sync.sh` 실행
6. **변경 감지**: 생성된 파일 변경사항 확인
7. **자동 커밋**: 변경사항이 있으면 자동 커밋 & 푸시

### 보안 & 안정성

- **GitHub Secrets**: QA/운영 DB 접속 정보 암호화 저장
- **무한 루프 방지**: `[skip ci]` 태그로 자동 커밋 체인 차단
- **대기 시간**: 다른 CI/CD와 충돌 방지
- **권한 관리**: `contents: write` 권한으로 자동 커밋

---

> 🚀 **MySQL 스키마 변경 → GitHub Actions → 자동 코드 동기화 → 자동 커밋!**
>
> **완전 자동화**: 브랜치 푸시만으로 DB 스키마 → TypeORM 코드 변환 완료
