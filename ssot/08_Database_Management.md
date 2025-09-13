# Database Management - 자동화된 DB 관리 시스템

## 🎯 개요

MySQL 데이터베이스 스키마를 분석하여 **TypeORM Entity, Repository, Procedures**를 자동으로 생성하는 완전 자동화 시스템입니다.

## 🚀 사용법

### 기본 실행

```bash
# 개발 환경에서 실행 (병합 모드)
./scripts/run-enhanced-db-sync.sh dev

# QA/운영 환경
./scripts/run-enhanced-db-sync.sh qa
./scripts/run-enhanced-db-sync.sh prod
```

### 고급 옵션

```bash
# 테스트 실행 (파일 생성 안함)
./scripts/run-enhanced-db-sync.sh dev --dry-run

# 강제 덮어쓰기
./scripts/run-enhanced-db-sync.sh dev --overwrite

# 선택적 생성
./scripts/run-enhanced-db-sync.sh dev --skip-entities
./scripts/run-enhanced-db-sync.sh dev --skip-repositories
./scripts/run-enhanced-db-sync.sh dev --skip-procedures
```

## 🏗️ 핵심 기능

### 1. 자동 Entity 생성

- **Snake_case → camelCase** 자동 변환
- **관계 매핑** (OneToMany, ManyToOne) 자동 생성
- **기존 수동 코드 보존** (스마트 병합)

```typescript
@Entity('tb_board')
export class TbBoardEntity {
  @PrimaryGeneratedColumn({ name: 'board_id' })
  boardId: number;

  @Column({ length: 255 })
  title: string;

  // 수동으로 추가한 관계 (보존됨)
  @OneToMany(() => TbCommentEntity, (comment) => comment.board)
  comments: TbCommentEntity[];
}
```

### 2. 자동 Repository 생성

- **기존 Repository 보존** (덮어쓰지 않음)
- **새로운 테이블**에 대해서만 Repository 생성

### 3. 삭제된 테이블 감지

- DB에서 삭제된 테이블 자동 감지
- `@deprecated` 주석 자동 추가로 안전한 하위 호환성 보장

```typescript
/**
 * @deprecated This table has been deleted from the database.
 * Deletion detected on: 2025-09-13
 */
@Entity('tb_deleted_table')
export class TbDeletedTableEntity {
  // ...
}
```

### 4. Procedures & Functions 자동 추출

- **저장 프로시저**와 **함수** 자동 추출
- **SQL 파일**로 개별 저장
- **문서화** 자동 생성

## 📁 생성되는 파일 구조

```
libs/database/src/
├── entities/
│   ├── tb-board.entity.ts
│   ├── tb-comment.entity.ts
│   ├── tb-user.entity.ts
│   └── index.ts                    # ALL_ENTITIES 배열
├── repositories/
│   ├── board.repository.ts         # 기존 Repository (보존)
│   ├── tb-user.repository.ts       # 새로 생성된 Repository
│   └── index.ts                    # ALL_REPOSITORIES 배열
└── procedures/
    ├── procedures/                 # 저장 프로시저 (.sql)
    ├── functions/                  # 함수 (.sql)
    └── *.sql                       # 개별 프로시저/함수 파일
```

## 🔄 실행 과정

### 1. 스키마 분석

```
📋 Analyzing database schema...
✅ Connected to dev database: public
🔍 Found 3 tables: tb_board, tb_comment, tb_user
```

### 2. 삭제된 테이블 감지

```
🗑️ Checking for deleted tables...
🏷️ Added @deprecated to tb-old-table.entity.ts
```

### 3. Entity 생성 (병합 모드)

```
🏗️ Generating entities...
🔄 Merged with existing tb-board.entity.ts
🔗 Preserving manual relation: comments
📦 Added TypeORM imports: OneToMany
```

### 4. Repository 생성

```
🔧 Generating repositories...
⚠️ Skipping existing: board.repository.ts
🔧 Generated: tb-user.repository.ts
```

### 5. Procedures 추출

```
📋 Extracting procedures and functions...
📝 Generated: generate_keywords.sql
📝 Generated: sp_hello_world1.sql
```

## ⚙️ 환경 설정

### 환경 변수 파일

```bash
# env/dev.env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your-password
DB_DATABASE=your-database
```

## 🛡️ 안전 기능

- **백업 시스템**: 실행 전 자동 백업 생성
- **중복 방지**: 기존 Import/관계 중복 체크
- **타입 안전성**: TypeScript 컴파일 검증
- **롤백 지원**: 오류 발생 시 자동 롤백

## 📋 Procedures & Functions 관리

### 파일 명명 규칙

- **프로시저**: `{procedure_name}.sql`
- **함수**: `{function_name}.sql`
- **모두 소문자**로 생성

### 파일 구조

```sql
-- ================================================================
-- PROCEDURE: procedure_name
-- ================================================================
-- Description: 프로시저 설명
-- Parameters: IN param1 VARCHAR(100), OUT param2 INT
-- Created: 2025-09-13T08:58:50.000Z
-- Environment: dev
-- ================================================================

DELIMITER $$
CREATE PROCEDURE `procedure_name`(...)
BEGIN
    -- 프로시저 본문
END$$
DELIMITER ;
```

### 사용법

```sql
-- 프로시저 호출
CALL procedure_name(param1, param2);

-- 함수 사용
SELECT function_name(param1) AS result FROM table_name;
```

### 파일 임포트

```bash
# 모든 프로시저 임포트
mysql -u username -p database_name < libs/database/src/procedures/procedures/*.sql

# 특정 프로시저 임포트
mysql -u username -p database_name < libs/database/src/procedures/procedure_name.sql
```

## ⚠️ 주의사항

1. **MySQL만 지원** (PostgreSQL 등 미지원)
2. **실행 전 백업 권장**
3. **수동 편집 금지**: 생성된 파일을 직접 편집하지 말 것
4. **의존성 주의**: 프로시저/함수 간 의존관계 확인 필요

## 🎉 자동화의 장점

- **개발 생산성 향상**: 수동 작업 제거, 시간 절약
- **유지보수성 향상**: 스키마 동기화, 관계 매핑 자동화
- **안전성 보장**: 기존 코드 보존, 하위 호환성 유지

---

> **완전 자동화된 데이터베이스 관리로 개발 생산성을 극대화하세요! 🚀**
