# Database Schema - 데이터베이스 설계

## 🗄️ 데이터베이스 개요

**DBMS**: MySQL 8.0+  
**ORM**: TypeORM  
**연결 방식**: 외부 서비스 (Docker 컨테이너 외부)  
**스키마 설계**: 도메인별 분리 구조  
**네이밍 규칙**: snake_case (테이블), camelCase (Entity)

## 🏗️ 도메인별 구조

### 📁 libs/database 구조

```
libs/database/src/
├── board/                    # 게시판 도메인
│   ├── entities/
│   │   ├── board.entity.ts
│   │   └── comment.entity.ts
│   └── repositories/
│       ├── board.repository.ts
│       └── comment.repository.ts
├── common/                   # 공통 도메인
│   ├── entities/
│   │   ├── keyword-notification.entity.ts
│   │   └── test.entity.ts
│   └── repositories/
│       ├── keyword-notification.repository.ts
│       └── test.repository.ts
├── database.module.ts        # 데이터베이스 모듈
└── database.service.ts       # 데이터베이스 서비스
```

## 📊 테이블 구조 개요

### 게시판 도메인

| 테이블       | Entity          | 주요 기능            | 관계                           |
| ------------ | --------------- | -------------------- | ------------------------------ |
| `tb_board`   | `BoardEntity`   | 게시글 CRUD          | 1:N → tb_comment               |
| `tb_comment` | `CommentEntity` | 댓글/대댓글 (계층형) | N:1 → tb_board, Self-Reference |

### 공통 도메인

| 테이블                    | Entity                      | 주요 기능        | 관계        |
| ------------------------- | --------------------------- | ---------------- | ----------- |
| `tb_keyword_notification` | `KeywordNotificationEntity` | 키워드 알림 설정 | 독립 테이블 |
| `tb_test`                 | `TestEntity`                | 개발/테스트용    | 독립 테이블 |

## 🔗 Entity 관계도

```mermaid
erDiagram
    tb_board ||--o{ tb_comment : "has many"
    tb_comment ||--o{ tb_comment : "parent-child"

    tb_board {
        int board_id PK
        varchar(255) title "최대 255자, 인덱스"
        text content
        varchar(50) author "최대 50자"
        varchar(255) password "bcrypt 해시, 최대 255자"
        timestamp created_at
        timestamp updated_at
    }

    tb_comment {
        int comment_id PK
        int board_id FK
        int parent_id FK "대댓글용, NULL 가능"
        varchar(2000) content "최대 2000자"
        varchar(50) author "최대 50자"
        timestamp created_at
    }

    tb_keyword_notification {
        int key_notification_id PK
        varchar(50) author "최대 50자, 인덱스"
        varchar(100) keyword "최대 100자, 인덱스"
        timestamp created_at
        unique(author, keyword) "중복 방지"
    }
```

## 🎯 주요 설계 원칙

### 1. 도메인 분리

- **게시판 도메인**: board, comment 관련
- **공통 도메인**: 여러 서비스에서 사용하는 공통 기능
- **독립성**: 각 도메인별로 Entity와 Repository 분리

### 2. 계층형 댓글 구조

- **Self-Reference**: comment 테이블의 parent_id
- **무한 깊이**: 대댓글의 대댓글 지원
- **Cascade 삭제**: 게시글 삭제 시 댓글 자동 삭제

### 3. 보안 설계

- **비밀번호 해시**: bcrypt 사용, salt 자동 생성
- **인덱스 최적화**: 검색 성능 향상
- **제약 조건**: 데이터 무결성 보장

## 🚀 키워드 알림 시스템

### 키워드 매칭 테이블

```sql
-- 키워드 알림 설정
tb_keyword_notification (
  key_notification_id,  -- PK
  author,              -- 알림 받을 사용자
  keyword,             -- 매칭할 키워드
  UNIQUE(author, keyword)  -- 중복 방지
)
```

### 동작 방식

1. **게시글/댓글 작성** → Board/Notification 서비스
2. **키워드 매칭** → tb_keyword_notification 조회
3. **알림 큐 생성** → Redis Bull Queue
4. **비동기 처리** → 백그라운드 알림 발송

## 📝 개발 가이드

### Entity 작성 규칙

```typescript
// 예시: BoardEntity
@Entity('tb_board')
export class BoardEntity {
  @PrimaryGeneratedColumn()
  boardId: number;

  @Column({ length: 255 })
  title: string;

  @OneToMany(() => CommentEntity, (comment) => comment.board)
  comments: CommentEntity[];

  @CreateDateColumn()
  createdAt: Date;
}
```

### Repository 패턴

```typescript
// 예시: BoardRepository
@Injectable()
export class BoardRepository extends Repository<BoardEntity> {
  async findWithComments(boardId: number) {
    return this.findOne({
      where: { boardId },
      relations: ['comments'],
    });
  }
}
```

## 🔧 데이터베이스 설정

### 연결 설정 (외부 서비스)

```bash
# env/dev.env
DB_HOST=localhost      # 외부 MySQL 서버
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=public
```

### TypeORM 설정

- **동기화**: 개발 환경에서만 `synchronize: true`
- **마이그레이션**: 프로덕션에서는 별도 마이그레이션 관리
- **연결 풀**: 기본 설정 사용

## 📊 성능 최적화

### 인덱스 전략

- **Primary Key**: 자동 인덱스
- **Foreign Key**: 관계 조회 최적화
- **검색 필드**:
  - `tb_board.title` (`idx_title`) - 제목 검색
  - `tb_comment.board_id` (`idx_board_id`) - 댓글 조회
  - `tb_comment.parent_id` (`idx_parent_id`) - 대댓글 조회
  - `tb_keyword_notification.author` (`idx_author`) - 사용자별 키워드
  - `tb_keyword_notification.keyword` (`idx_keyword`) - 키워드 매칭
- **유니크 제약**: `tb_keyword_notification(author, keyword)` - 중복 방지

### 쿼리 최적화

- **N+1 문제 방지**: relations 사용
- **페이징**: LIMIT, OFFSET 활용
- **부분 로딩**: 필요한 필드만 SELECT

## 🎯 현재 운영 상태

### 활성 테이블 현황

- **게시판 도메인**: tb_board, tb_comment (완전 구현)
- **알림 시스템**: tb_keyword_notification (운영 중)
- **테스트 환경**: tb_test (개발용)

### 성능 최적화 적용

- **인덱스 최적화**: 검색 성능 향상 완료
- **페이징 처리**: 대용량 데이터 효율적 처리
- **관계 매핑**: N+1 문제 방지 적용
- **캐싱**: Redis 기반 결과 캐싱

## 🔧 새로운 테이블 추가 패턴

### 테이블 네이밍 규칙

**기본 패턴**: `tb_{domain}` 또는 `tb_{domain}_{entity}`

- 예: `tb_user`, `tb_board_like`, `tb_file_upload`

**관계 테이블**: `tb_{entity1}_{entity2}`

- 예: `tb_user_role`, `tb_board_tag`

### Entity 네이밍 규칙

**Entity 클래스**: `{TableName}Entity` (PascalCase)

- 예: `TbUserEntity`, `TbBoardLikeEntity`

**Repository 클래스**: `{Domain}Repository`

- 예: `UserRepository`, `BoardRepository`

### 새 테이블 추가 템플릿

```typescript
// Entity 예시
@Entity('tb_new_table')
export class TbNewTableEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ length: 255 })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### 관계 설정 패턴

**OneToMany/ManyToOne**:

```typescript
// 부모 Entity
@OneToMany(() => ChildEntity, (child) => child.parent)
children: ChildEntity[];

// 자식 Entity
@ManyToOne(() => ParentEntity, (parent) => parent.children)
@JoinColumn({ name: 'parent_id' })
parent: ParentEntity;
```

---

> 💡 **AI 지시 시 참고**:
>
> - 새 테이블 추가 시 도메인별로 분리 (`board/`, `common/`)
> - Entity는 camelCase, 테이블은 snake_case
> - Repository 패턴으로 비즈니스 로직 분리
> - 키워드 알림은 `tb_keyword_notification` 테이블 기반

**Made with ❤️ using TypeORM + MySQL**
