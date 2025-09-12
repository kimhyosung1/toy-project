# 🚀 Enhanced Database Schema Analyzer

DB 스키마를 분석해서 TypeORM Entity와 Repository를 자동으로 생성하는 도구입니다.

## ✨ 주요 기능

- **🔍 DB 스키마 자동 분석** - 테이블, 컬럼, 관계, 인덱스 등 모든 정보 수집
- **🏗️ Entity 자동 생성** - TypeORM 데코레이터가 적용된 Entity 클래스 생성
- **🔧 Repository 자동 생성** - 기본 Repository 구조 생성
- **🏪 Procedure 추출** - Stored Procedure와 Function을 SQL 파일로 추출
- **📝 index.ts 자동 업데이트** - `ALL_ENTITIES`, `ALL_REPOSITORIES` 배열 자동 관리

## 🚀 사용 방법

### 1. 간단한 실행 (추천)

```bash
# dev 환경에서 실행
./scripts/db-analyzer/simple-run.sh dev

# qa 환경에서 실행
./scripts/db-analyzer/simple-run.sh qa

# prod 환경에서 실행
./scripts/db-analyzer/simple-run.sh prod
```

### 2. 고급 실행 (더 많은 옵션)

```bash
# 테스트 실행 (파일 생성 안함)
./scripts/run-enhanced-db-sync.sh dev --dry-run

# 실제 실행
./scripts/run-enhanced-db-sync.sh dev

# 강제 덮어쓰기
./scripts/run-enhanced-db-sync.sh dev --overwrite
```

## 📁 생성되는 파일 구조

```
libs/database/src/
├── entities/
│   ├── tb-board.entity.ts
│   ├── tb-comment.entity.ts
│   ├── tb-user.entity.ts
│   └── index.ts              # ALL_ENTITIES 배열 포함
├── repositories/
│   ├── tb-board.repository.ts
│   ├── tb-comment.repository.ts
│   ├── tb-user.repository.ts
│   └── index.ts              # ALL_REPOSITORIES 배열 포함
└── procedures/
    ├── procedures/           # Stored Procedures
    ├── functions/           # Functions
    └── docs/               # 문서화
```

## ⚙️ 환경 설정

환경별 DB 연결 정보는 `env/` 폴더의 파일에서 읽어옵니다:

- `env/dev.env` - 개발 환경
- `env/qa.env` - QA 환경
- `env/prod.env` - 운영 환경

필요한 환경 변수:

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your-password
DB_DATABASE=your-database
```

## 🎯 생성되는 Entity 예시

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tb_user')
export class TbUser {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ type: 'varchar', length: 255 })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;
}
```

## 🔧 생성되는 Repository 예시

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbUser } from '../entities/tb-user.entity';

@Injectable()
export class TbUserRepository {
  constructor(
    @InjectRepository(TbUser)
    private readonly repository: Repository<TbUser>,
  ) {}
}
```

## 🎉 자동화의 장점

1. **더 이상 수동 작업 불필요** - DB에 테이블 추가하면 자동으로 Entity/Repository 생성
2. **타입 안전성** - TypeScript 타입이 자동으로 매핑됨
3. **일관성** - 모든 Entity와 Repository가 동일한 패턴으로 생성
4. **시간 절약** - 수십 개의 테이블도 몇 초 만에 처리

## 🔄 GitHub Actions 자동화

`.github/workflows/db-sync.yml`을 통해 자동화도 가능합니다:

- **수동 실행** - Actions 탭에서 워크플로우 실행
- **자동 실행** - 매일 새벽 3시 자동 스키마 동기화
- **알림** - Slack, Email로 결과 통지

## 📋 주의사항

- 기존 Entity/Repository 파일들은 덮어써집니다
- 커스텀 메서드는 별도로 추가해야 합니다
- DB 연결 정보가 올바른지 확인하세요

---

> 🤖 **자동 생성 도구** - 더 이상 Entity를 수동으로 만들 필요가 없습니다!
