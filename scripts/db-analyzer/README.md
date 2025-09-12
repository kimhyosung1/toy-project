# 🚀 Database Schema Analyzer & Entity Generator

MySQL 데이터베이스 스키마를 분석하여 TypeORM Entity와 Repository를 자동으로 생성하는 도구입니다.

## ✨ 주요 기능

- 📊 **스키마 분석**: MySQL 테이블, 컬럼, 인덱스, 외래키 분석
- 🏗️ **Entity 생성**: TypeORM Entity 클래스 자동 생성
- 📦 **SP Repository**: 스토어드 프로시저 기반 Repository 생성
- 🔄 **자동화**: GitHub Actions를 통한 CI/CD 자동화
- 🎯 **환경별 지원**: dev, qa, prod 환경별 스키마 관리

## 🛠️ 설치 및 설정

### 1. 환경 변수 설정

```bash
# .env 파일 생성
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database
```

### 2. 의존성 설치

```bash
cd scripts/db-analyzer
npm install
```

## 🚀 사용법

### 1. 스키마 분석

```bash
# 데이터베이스 스키마 분석
npm run analyze

# 또는 직접 실행
ts-node schema-analyzer.ts
```

### 2. Entity 생성

```bash
# TypeORM Entity 생성
npm run generate-entities

# 또는 직접 실행
ts-node entity-generator.ts ../../temp/db-schema.json libs/database/src/entities
```

### 3. 스토어드 프로시저 Repository 생성

```bash
# SP Repository 생성
npm run generate-sp

# 또는 직접 실행
ts-node sp-repository-generator.ts ../../temp/db-schema.json libs/database/src/procedures
```

### 4. 전체 프로세스 실행

```bash
# 분석 + 생성을 한번에
npm run analyze-and-generate
```

## 📋 생성되는 파일들

### Entity 파일 구조

```
libs/database/src/entities/
├── board.entity.ts           # 게시판 엔티티
├── comment.entity.ts         # 댓글 엔티티
├── user.entity.ts            # 사용자 엔티티
├── product.entity.ts         # 상품 엔티티
└── index.ts                  # 모든 엔티티 export
```

### SP Repository 구조

```
libs/database/src/procedures/
├── board-sp.repository.ts     # 게시판 SP Repository
├── user-sp.repository.ts      # 사용자 SP Repository
├── product-sp.repository.ts   # 상품 SP Repository
├── stored-procedure.service.ts # 통합 SP 서비스
└── index.ts                   # 모든 SP Repository export
```

## 🔧 GitHub Actions 워크플로우

### 수동 실행

```yaml
# .github/workflows/db-sync.yml에서 수동 트리거
environment: dev | qa | prod
force_update: true | false
```

### 자동 실행

- **Push 이벤트**: main, develop 브랜치에 push 시
- **스케줄**: 매일 새벽 3시 자동 실행 (dev 환경)

## 📊 생성 예시

### Entity 예시

```typescript
// board.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { CommentEntity } from './comment.entity';

@Entity('tb_board')
export class BoardEntity {
  @PrimaryGeneratedColumn()
  boardId: number;

  @Column({ type: 'varchar', length: 255 })
  @Index('idx_title')
  title: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CommentEntity, (comment) => comment.board)
  comments: CommentEntity[];
}
```

### SP Repository 예시

```typescript
// board-sp.repository.ts
@Injectable()
export class BoardSPRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * sp_board_get_list 스토어드 프로시저 실행
   */
  async getBoardList(page: number, limit: number): Promise<any[]> {
    try {
      const query = 'CALL sp_board_get_list(?, ?)';
      const result = await this.dataSource.query(query, [page, limit]);
      return result[0] || [];
    } catch (error) {
      throw new Error(`Failed to execute sp_board_get_list: ${error.message}`);
    }
  }
}
```

## 🎯 지원하는 MySQL 타입

### 데이터 타입 매핑

| MySQL 타입          | TypeScript 타입 | TypeORM 타입        |
| ------------------- | --------------- | ------------------- |
| INT, BIGINT         | number          | int, bigint         |
| VARCHAR, TEXT       | string          | varchar, text       |
| DATETIME, TIMESTAMP | Date            | datetime, timestamp |
| DECIMAL, NUMERIC    | string          | decimal             |
| JSON                | any             | json                |
| BOOLEAN, BIT        | boolean         | boolean             |

### 특별 처리

- **created_at**: `@CreateDateColumn()` 자동 적용
- **updated_at**: `@UpdateDateColumn()` 자동 적용
- **Primary Key**: `@PrimaryGeneratedColumn()` 자동 적용
- **Foreign Key**: `@ManyToOne()`, `@JoinColumn()` 자동 생성
- **Index**: `@Index()` 자동 적용
- **Unique**: `@Unique()` 자동 적용

## 🔒 환경별 설정

### GitHub Secrets 설정 필요

```
# Dev 환경
DEV_DB_HOST
DEV_DB_PORT
DEV_DB_USER
DEV_DB_PASSWORD
DEV_DB_NAME

# QA 환경
QA_DB_HOST
QA_DB_PORT
...

# Prod 환경
PROD_DB_HOST
PROD_DB_PORT
...

# 알림 설정
SLACK_WEBHOOK_URL
NOTIFICATION_EMAIL
EMAIL_USERNAME
EMAIL_PASSWORD
```

## 🚨 주의사항

1. **백업**: 기존 Entity 파일들은 자동으로 백업됩니다
2. **권한**: 데이터베이스 읽기 권한이 필요합니다
3. **네이밍**: 테이블명은 `tb_` 접두사를 권장합니다
4. **검증**: 생성된 코드는 자동으로 TypeScript/ESLint 검증됩니다

## 🎉 결과

이제 배포할 때마다:

1. 🔍 **자동 스키마 분석**: MySQL DB 구조 파악
2. 🏗️ **자동 Entity 생성**: TypeORM Entity 클래스 생성
3. 📦 **자동 SP Repository**: 스토어드 프로시저 Repository 생성
4. 💾 **자동 커밋**: 변경사항 자동 커밋 및 푸시
5. 📢 **자동 알림**: Slack/Email로 결과 알림

**더 이상 수동으로 Entity를 만들 필요가 없습니다!** 🚀
