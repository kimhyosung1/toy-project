# 🚀 개선된 Raw SQL 쿼리 사용 가이드

`DatabaseService`에 추가된 새로운 기능을 사용하여 Raw SQL 쿼리 결과를 자동으로 `snake_case`에서 `camelCase`로 변환하고 타입 안정성을 보장하는 방법을 설명합니다.

## 📋 목차

1. [기본 개념](#기본-개념)
2. [새로운 메서드들](#새로운-메서드들)
3. [사용 예제](#사용-예제)
4. [타입 안정성](#타입-안정성)
5. [비교표](#비교표)
6. [Best Practices](#best-practices)

## 🎯 기본 개념

### Before (기존 방식)

```typescript
// 기존: snake_case 그대로 반환
const result = await this.databaseService.query(
  'SELECT user_id, first_name, last_name, created_at FROM users WHERE id = ?',
  [1],
);
console.log(result[0].user_id); // snake_case 사용
console.log(result[0].first_name); // snake_case 사용
console.log(result[0].created_at); // snake_case 사용
```

### After (개선된 방식)

```typescript
// 개선: 자동으로 camelCase 변환
const result = await this.databaseService.queryOneResult(
  'SELECT user_id, first_name, last_name, created_at FROM users WHERE id = ?',
  [1],
);
console.log(result.userId); // camelCase 자동 변환
console.log(result.firstName); // camelCase 자동 변환
console.log(result.createdAt); // camelCase 자동 변환
```

## 🛠️ 새로운 메서드들

### 1. `queryOneResult<T>()` - 단일 결과 조회 (camelCase 변환)

```typescript
async queryOneResult<T extends object>(
  query: string,
  parameters?: any[],
  classConstructor?: ClassConstructor<T>
): Promise<T | null>
```

### 2. `queryManyResults<T>()` - 다중 결과 조회 (camelCase 변환)

```typescript
async queryManyResults<T extends object>(
  query: string,
  parameters?: any[],
  classConstructor?: ClassConstructor<T>
): Promise<T[]>
```

### 3. `query()` - CRUD 작업 및 Stored Procedure 호출

```typescript
async query(sql: string, parameters?: any[]): Promise<any>
```

**사용 용도:**

- INSERT, UPDATE, DELETE 쿼리
- Stored Procedure 호출
- 변환이 필요 없는 모든 Raw SQL

## 📚 사용 예제

### 예제 1: 기본 사용법 (타입 검증 없음)

```typescript
// 단일 결과
const board = await this.databaseService.queryOneResult(
  'SELECT board_id, title, content, created_at FROM board WHERE id = ?',
  [1],
);

console.log(board.boardId); // ✅ camelCase
console.log(board.createdAt); // ✅ camelCase

// 다중 결과
const boards = await this.databaseService.queryManyResults(
  'SELECT board_id, title, author, created_at FROM board ORDER BY created_at DESC LIMIT ?',
  [10],
);

boards.forEach((board) => {
  console.log(board.boardId); // ✅ camelCase
  console.log(board.createdAt); // ✅ camelCase
});
```

### 예제 2: DTO 클래스와 함께 사용 (타입 안전)

```typescript
// DTO 클래스 정의
export class BoardDto {
  @IsNumber()
  id: number;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsNumber()
  @IsOptional()
  commentCount?: number;
}

// 타입 안전한 사용
const board = await this.databaseService.queryOneResult(
  `SELECT 
     b.id, 
     b.title, 
     b.content, 
     b.created_at,
     COUNT(c.id) as comment_count
   FROM board b 
   LEFT JOIN board_comment c ON b.id = c.board_id 
   WHERE b.id = ?
   GROUP BY b.id`,
  [1],
  BoardDto, // 🎯 타입 검증 + 변환
);

// TypeScript가 자동완성 지원
console.log(board.id); // ✅ number 타입
console.log(board.createdAt); // ✅ Date 타입
console.log(board.commentCount); // ✅ number | undefined 타입
```

### 예제 3: 복잡한 JOIN 쿼리

```typescript
const boardsWithComments = await this.databaseService.queryManyResults(
  `SELECT 
     b.id,
     b.title,
     b.content,
     b.author,
     b.created_at,
     b.updated_at,
     COALESCE(c.comment_count, 0) as comment_count,
     COALESCE(c.latest_comment_date, b.created_at) as last_activity_date
   FROM board b
   LEFT JOIN (
     SELECT 
       board_id,
       COUNT(*) as comment_count,
       MAX(created_at) as latest_comment_date
     FROM board_comment 
     GROUP BY board_id
   ) c ON b.id = c.board_id
   WHERE b.deleted_at IS NULL
   ORDER BY last_activity_date DESC
   LIMIT ?`,
  [20],
  BoardWithCommentCountDto,
);

// 모든 결과가 camelCase로 변환됨
boardsWithComments.forEach((board) => {
  console.log(board.commentCount); // ✅ camelCase
  console.log(board.lastActivityDate); // ✅ camelCase
});
```

### 예제 4: CRUD 작업 (변환 없음)

```typescript
// INSERT 쿼리
const insertResult = await this.databaseService.query(
  'INSERT INTO board (title, content, author) VALUES (?, ?, ?)',
  ['새 게시글', '내용입니다', '작성자'],
);
console.log(insertResult.insertId); // 새로 생성된 ID

// UPDATE 쿼리
const updateResult = await this.databaseService.query(
  'UPDATE board SET title = ? WHERE id = ?',
  ['수정된 제목', 1],
);
console.log(updateResult.affectedRows); // 영향받은 행 수

// DELETE 쿼리
const deleteResult = await this.databaseService.query(
  'DELETE FROM board WHERE id = ?',
  [1],
);
console.log(deleteResult.affectedRows); // 삭제된 행 수
```

### 예제 5: Stored Procedure 호출

```typescript
// Stored Procedure 직접 호출
const results = await this.databaseService.query('CALL sp_get_board_stats(?)', [
  7,
]);
console.log(results); // 원본 결과 (변환 없음)

// 결과가 필요한 경우 수동 변환
const stats = this.databaseService['columnToCamel'](results[0]);
console.log(stats.totalBoards); // ✅ camelCase
console.log(stats.uniqueAuthors); // ✅ camelCase

// 또는 타입 안전한 방식으로 직접 호출
const boardStats = await this.databaseService.queryManyResults(
  'CALL sp_get_board_stats(?)',
  [7],
  BoardStatisticsDto,
);
```

### 예제 6: 트랜잭션과 함께 사용

```typescript
async updateBoardWithHistory(boardId: number, newTitle: string) {
  const queryRunner = await this.databaseService.startTransaction();

  try {
    // 1. 이전 데이터 조회 (camelCase 변환)
    const oldBoard = await queryRunner.query(
      'SELECT id, title, content, version FROM board WHERE id = ?',
      [boardId]
    );
    const converted = this.databaseService['columnToCamel'](oldBoard[0]);

    // 2. 업데이트
    await queryRunner.query(
      'UPDATE board SET title = ?, version = version + 1 WHERE id = ?',
      [newTitle, boardId]
    );

    // 3. 히스토리 기록
    await queryRunner.query(
      'INSERT INTO board_history (board_id, old_title, new_title, updated_at) VALUES (?, ?, ?, NOW())',
      [boardId, converted.title, newTitle]
    );

    await this.databaseService.commitTransaction(queryRunner);
    return '업데이트 완료';
  } catch (error) {
    await this.databaseService.rollbackTransaction(queryRunner);
    throw error;
  }
}
```

## 🎯 타입 안정성

### DTO 클래스 작성 가이드

```typescript
import { IsNumber, IsString, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UserProfileDto {
  @IsNumber()
  userId: number;

  @IsString()
  userName: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsDate()
  @Type(() => Date) // 중요: Date 변환을 위해 필요
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  lastLoginAt?: Date;

  @IsNumber()
  @IsOptional()
  postCount?: number;
}
```

### 타입 검증 사용

```typescript
// 타입 검증 있음 - 추천
const user = await this.databaseService.queryOneResult(
  'SELECT user_id, user_name, first_name, last_name, created_at FROM users WHERE id = ?',
  [1],
  UserProfileDto, // 검증 + 변환
);

// 타입 검증 없음 - 빠른 프로토타이핑용
const user = await this.databaseService.queryOneResult(
  'SELECT user_id, user_name, first_name, last_name, created_at FROM users WHERE id = ?',
  [1],
  // DTO 없음 - 변환만 수행
);
```

## 📊 비교표

| 기능            | 기존 방식      | 개선된 방식         |
| --------------- | -------------- | ------------------- |
| **키 네이밍**   | snake_case     | ✅ camelCase        |
| **타입 안전성** | ❌ any 타입    | ✅ DTO 기반 타입    |
| **자동완성**    | ❌ 지원 안함   | ✅ 완벽 지원        |
| **유효성 검증** | ❌ 수동 검증   | ✅ 자동 검증        |
| **에러 감지**   | ❌ 런타임 에러 | ✅ 컴파일 타임 감지 |
| **코드 가독성** | ❌ 낮음        | ✅ 높음             |

### 성능 비교

```typescript
// 기존 방식 - 수동 변환
const result = await this.databaseService.query(sql, params);
const converted = result.map((row) => ({
  boardId: row.board_id,
  createdAt: new Date(row.created_at),
  // ... 수동으로 모든 필드 변환
}));

// 개선된 방식 - 자동 변환
const result = await this.databaseService.queryManyResults(
  sql,
  params,
  BoardDto,
);
// 🎯 자동 변환 + 타입 검증 완료!
```

## 🌟 Best Practices

### 1. 올바른 메서드 선택하기

```typescript
// ✅ SELECT 쿼리 - camelCase 변환 필요
const boards = await this.databaseService.queryManyResults(
  sql,
  params,
  BoardDto,
);
const board = await this.databaseService.queryOneResult(sql, params, BoardDto);

// ✅ INSERT/UPDATE/DELETE/Stored Procedure - 변환 불필요
const result = await this.databaseService.query(sql, params);
```

### 2. DTO 클래스 활용하기

```typescript
// ✅ 권장: DTO 클래스 사용
const boards = await this.databaseService.queryManyResults(
  sql,
  params,
  BoardDto,
);

// ❌ 비권장: 타입 없음 (프로토타이핑 제외)
const boards = await this.databaseService.queryManyResults(sql, params);
```

### 3. Date 타입 처리

```typescript
// ✅ DTO에서 Date 변환 설정
export class EventDto {
  @IsDate()
  @Type(() => Date) // 중요!
  eventDate: Date;
}
```

### 4. 옵셔널 필드 처리

```typescript
// ✅ 옵셔널 필드는 @IsOptional() 사용
export class UserDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional() // NULL 허용
  nickname?: string;
}
```

### 5. 복잡한 쿼리 분리

```typescript
// ✅ 권장: 복잡한 쿼리는 별도 메서드로 분리
private getBoardsWithCommentsQuery(): string {
  return `
    SELECT
      b.id,
      b.title,
      COUNT(c.id) as comment_count
    FROM board b
    LEFT JOIN board_comment c ON b.id = c.board_id
    GROUP BY b.id
    ORDER BY b.created_at DESC
  `;
}

async findBoardsWithComments(): Promise<BoardDto[]> {
  return this.databaseService.queryManyResults(
    this.getBoardsWithCommentsQuery(),
    [],
    BoardDto
  );
}
```

### 6. 에러 처리

```typescript
// ✅ 권장: 타입 검증 실패 처리
try {
  const result = await this.databaseService.queryOneResult(
    sql,
    params,
    UserDto,
  );
  return result;
} catch (error) {
  if (error.message.includes('Validation failed')) {
    // 타입 검증 실패 처리
    this.logger.warn('Data validation failed:', error.message);
    return null;
  }
  throw error;
}
```

## 🚀 마이그레이션 가이드

### 기존 코드 변환 방법

```typescript
// Before
const result = await this.databaseService.query(
  'SELECT user_id, first_name, created_at FROM users',
  [],
);
const users = result.map((user) => ({
  id: user.user_id,
  name: user.first_name,
  createdAt: user.created_at,
}));

// After
const users = await this.databaseService.queryManyResults(
  'SELECT user_id, first_name, created_at FROM users',
  [],
  UserDto,
);
// 🎯 변환 및 타입 검증 자동화!
```

이제 Raw SQL 쿼리를 사용할 때 자동으로 `snake_case`를 `camelCase`로 변환하고 타입 안정성을 보장할 수 있습니다! 🎉
