# API Interface - 익명 게시판 및 키워드 알림 시스템

## 📡 API 개요

**Base URL**: `http://localhost:3000`
**API 문서**: `http://localhost:3000/api-docs`
**프로토콜**: HTTP/1.1, RESTful API
**인증**: None (익명 게시판)
**응답 형식**: JSON

## 🔧 자동화된 응답 검증/변환 시스템

이 API는 완전히 자동화된 응답 검증 및 변환 시스템을 구현합니다.

### 🎯 핵심 특징

#### **1. `@CheckResponse` 데코레이터 기반**

```typescript
@CheckResponse()
export class SelectBoardResponse {
  @Expose()
  @Type(() => SelectBoardModel)
  boards: SelectBoardModel[];

  @Expose()
  @Type(() => Number)
  totalCount: number;
}
```

#### **2. 자동 타입 추출 및 변환**

- TypeScript 메타데이터 기반 런타임 타입 추출
- 모든 필드에 `@Type` 데코레이터 적용으로 안전한 타입 변환
- `Promise<CreateBoardResponse>` → `CreateBoardResponse` 자동 감지

#### **3. 3단계 에러 방어 시스템**

```
요청 → ResponseTransformInterceptor → ErrorHandlerInterceptor → AllExceptionFilter → 안전한 응답
```

## 🏗️ 게시글 API

### 1. 게시글 목록 조회

**Endpoint**: `GET /api/board`

**Query Parameters**:

```typescript
interface SelectBoardRequest {
  page?: number = 1;        // 페이지 번호
  limit?: number = 10;      // 페이지당 개수
  title?: string;           // 제목 검색
  author?: string;          // 작성자 검색
}
```

**Response**: `SelectBoardResponse`

```typescript
interface SelectBoardResponse {
  boards: BoardModel[]; // 게시글 목록
  totalCount: number; // 전체 게시글 수
}

interface BoardModel {
  boardId: number; // 게시글 ID
  title: string; // 제목
  content: string; // 내용
  author: string; // 작성자
  createdAt: Date; // 작성일
  updatedAt: Date; // 수정일
}
```

**응답 예시**:

```json
{
  "boards": [
    {
      "boardId": 1,
      "title": "첫 번째 게시글",
      "content": "안녕하세요!",
      "author": "홍길동",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalCount": 1
}
```

### 2. 게시글 작성

**Endpoint**: `POST /api/board`

**Request Body**: `CreateBoardRequest`

```typescript
interface CreateBoardRequest {
  title: string; // 제목 (최대 255자)
  content: string; // 내용 (최대 2000자)
  author: string; // 작성자 (최대 50자)
  password: string; // 비밀번호 (최대 255자)
}
```

**Response**: `CreateBoardResponse extends BoardModel`

**요청 예시**:

```json
{
  "title": "새로운 게시글",
  "content": "게시글 내용입니다.",
  "author": "김철수",
  "password": "1234"
}
```

### 3. 게시글 수정

**Endpoint**: `PUT /api/board/:boardId`

**Path Parameters**:

- `boardId`: 게시글 ID

**Request Body**: `UpdateBoardRequest`

```typescript
interface UpdateBoardRequest {
  boardId: number; // 게시글 ID
  title: string; // 새 제목
  content: string; // 새 내용
  password: string; // 비밀번호 (검증용)
}
```

**Response**: `UpdateBoardResponse extends BoardModel`

### 4. 게시글 삭제

**Endpoint**: `DELETE /api/board/:boardId`

**Path Parameters**:

- `boardId`: 게시글 ID

**Request Body**: `DeleteBoardRequest`

```typescript
interface DeleteBoardRequest {
  boardId: number; // 게시글 ID
  password: string; // 비밀번호 (검증용)
}
```

**Response**: `DeleteBoardResponse extends BoardModel`

## 💬 댓글 API

### 1. 댓글 목록 조회

**Endpoint**: `GET /api/board/:boardId/comment`

**Path Parameters**:

- `boardId`: 게시글 ID

**Query Parameters**:

```typescript
interface SelectBoardCommentDto {
  boardId: number;          // 게시글 ID
  page?: number = 1;        // 페이지 번호
  limit?: number = 10;      // 페이지당 개수
}
```

**Response**: `SelectBoardCommentResponse`

```typescript
interface SelectBoardCommentResponse {
  comments: SelectBoardCommentModel[]; // 댓글 목록
  totalCount: number; // 전체 댓글 수
}

interface SelectBoardCommentModel {
  commentId: number; // 댓글 ID
  boardId: number; // 게시글 ID
  parentId?: number; // 부모 댓글 ID (대댓글인 경우)
  content: string; // 댓글 내용
  author: string; // 작성자
  createdAt: Date; // 작성일
  children: SelectBoardCommentModel[]; // 대댓글 목록
}
```

**응답 예시**:

```json
{
  "comments": [
    {
      "commentId": 1,
      "boardId": 1,
      "parentId": null,
      "content": "좋은 글이네요!",
      "author": "김철수",
      "createdAt": "2024-01-01T01:00:00.000Z",
      "children": [
        {
          "commentId": 2,
          "boardId": 1,
          "parentId": 1,
          "content": "감사합니다!",
          "author": "홍길동",
          "createdAt": "2024-01-01T02:00:00.000Z",
          "children": []
        }
      ]
    }
  ],
  "totalCount": 2
}
```

### 2. 댓글 작성

**Endpoint**: `POST /api/board/:boardId/comment`

**Path Parameters**:

- `boardId`: 게시글 ID

**Request Body**: `CreateBoardCommentDto`

```typescript
interface CreateBoardCommentDto {
  boardId: number; // 게시글 ID
  parentId?: number; // 부모 댓글 ID (대댓글인 경우)
  author: string; // 작성자 (최대 50자)
  content: string; // 댓글 내용 (최대 2000자)
}
```

**Response**: `CreateBoardCommentResponse extends SelectBoardCommentModel`

**요청 예시**:

```json
{
  "boardId": 1,
  "author": "이영희",
  "content": "댓글 내용입니다."
}
```

**대댓글 작성 예시**:

```json
{
  "boardId": 1,
  "parentId": 1,
  "author": "박민수",
  "content": "대댓글 내용입니다."
}
```

## 🔔 키워드 알림 시스템

### 알림 트리거 조건

키워드 알림은 다음 상황에서 자동으로 발생합니다:

1. **게시글 작성 시**: 제목 또는 내용에 등록된 키워드 포함
2. **댓글 작성 시**: 댓글 내용에 등록된 키워드 포함

### 알림 처리 플로우

```typescript
// 게시글/댓글 작성 → 키워드 검사 → 일치 시 알림 발송
async function processKeywordNotification(content: string, author: string) {
  const keywords = await findKeywordsByContent(content);
  for (const keyword of keywords) {
    if (keyword.author !== author) {
      // 본인 제외
      await sendNotification(keyword.author, content);
    }
  }
}
```

## 🚨 에러 응답

### 에러 응답 형식

```typescript
interface ErrorResponse {
  statusCode: number; // HTTP 상태 코드
  message: string | string[]; // 에러 메시지
  error: string; // 에러 타입
  timestamp: string; // 발생 시간
  path: string; // 요청 경로
}
```

### 주요 에러 코드

#### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": ["title should not be empty", "password should not be empty"],
  "error": "Bad Request",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/board"
}
```

#### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "비밀번호가 일치하지 않습니다.",
  "error": "Unauthorized",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/board/1"
}
```

#### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "게시글을 찾을 수 없습니다.",
  "error": "Not Found",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/board/999"
}
```

#### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "내부 서버 오류가 발생했습니다.",
  "error": "Internal Server Error",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/board"
}
```

## 🔄 자동 타입 변환

### 입력 데이터 변환 예시

**HTTP 요청에서 받은 데이터**:

```json
{
  "page": "1", // 문자열
  "limit": "10", // 문자열
  "title": "  hello  ", // 공백 포함 문자열
  "boardId": "123" // 문자열
}
```

**`@Type` + 커스텀 Transform 처리 후**:

```json
{
  "page": 1, // ✅ 숫자로 변환
  "limit": 10, // ✅ 숫자로 변환
  "title": "hello", // ✅ 공백 제거
  "boardId": 123 // ✅ 숫자로 변환
}
```

### 출력 데이터 변환 예시

**데이터베이스에서 받은 데이터**:

```json
{
  "createdAt": "2024-01-01T00:00:00.000Z", // 문자열
  "totalCount": "50", // 문자열
  "boardId": 123 // 이미 숫자
}
```

**`@Type` + 인터셉터 처리 후**:

```json
{
  "createdAt": "2024-01-01T00:00:00.000Z", // ✅ Date 객체로 변환 후 JSON 직렬화
  "totalCount": 50, // ✅ 숫자로 변환
  "boardId": 123 // ✅ 숫자 유지
}
```

## 🛡️ 보안 및 검증

### 1. 입력 검증

모든 API 엔드포인트는 `class-validator`를 통한 자동 검증을 수행합니다:

- **@IsNotEmpty()**: 필수 필드 검증
- **@MaxLength()**: 최대 길이 제한
- **@IsString()**: 문자열 타입 검증
- **@IsNumber()**: 숫자 타입 검증
- **@Type()**: 타입 변환 보장

### 2. 응답 필터링

`@Expose()` 데코레이터가 적용된 필드만 응답에 포함되어 민감한 정보를 자동으로 차단합니다.

### 3. 비밀번호 보안

- bcrypt를 사용한 해시 암호화
- 응답에서 비밀번호 필드 자동 제외
- 수정/삭제 시 비밀번호 검증 필수

## 📊 성능 최적화

### 1. 캐싱 전략

- TypeScript 메타데이터 캐싱으로 타입 조회 성능 최적화
- Redis를 통한 세션 관리 (필요 시)

### 2. 페이징

모든 목록 API는 페이징을 지원하여 대용량 데이터 처리에 최적화되어 있습니다.

### 3. 인덱스 활용

데이터베이스 인덱스를 통한 검색 성능 최적화:

- `idx_title`: 제목 검색
- `idx_board_id`: 댓글 조회
- `idx_parent_id`: 대댓글 조회

## 🔮 API 확장성

### 1. 마이크로서비스 아키텍처

- Gateway 서비스를 통한 라우팅
- 각 기능별 독립적인 서비스 운영
- TCP 기반 내부 통신

### 2. 버전 관리

향후 API 버전 관리를 위한 구조:

```
/api/v1/board
/api/v1/board/:id/comment
```

### 3. 확장 가능한 검증 시스템

새로운 DTO 추가 시 `@CheckResponse` 데코레이터만 적용하면 자동으로 검증/변환 시스템이 적용됩니다.

## 📋 테스트 가이드

### 1. API 테스트 도구

- **Swagger UI**: `http://localhost:3000/api-docs`
- **Postman**: Collection 제공
- **cURL**: 명령줄 테스트

### 2. 테스트 시나리오

#### 게시글 작성 → 댓글 작성 → 키워드 알림 플로우

```bash
# 1. 게시글 작성
curl -X POST http://localhost:3000/api/board \
  -H "Content-Type: application/json" \
  -d '{"title":"테스트","content":"키워드 포함","author":"홍길동","password":"1234"}'

# 2. 댓글 작성
curl -X POST http://localhost:3000/api/board/1/comment \
  -H "Content-Type: application/json" \
  -d '{"boardId":1,"author":"김철수","content":"좋은 글이네요"}'

# 3. 목록 조회
curl "http://localhost:3000/api/board?page=1&limit=10"
```

## ⚠️ 주의사항

### 1. 타입 안전성

- 모든 숫자 필드는 자동으로 `Number` 타입으로 변환됩니다
- 날짜 필드는 `Date` 객체로 변환 후 JSON 직렬화됩니다
- 문자열 필드는 공백 제거 등의 변환이 적용됩니다

### 2. 에러 처리

- 3단계 에러 방어 시스템으로 안전한 에러 응답 보장
- 검증 실패 시에도 안전한 형태로 에러 반환
- 예상치 못한 에러도 표준화된 형식으로 응답

### 3. 성능 고려사항

- 대용량 데이터 조회 시 적절한 페이징 사용 권장
- 검색 기능 사용 시 인덱스 활용을 위한 적절한 조건 설정
- 키워드 알림 시스템은 비동기 처리로 응답 성능에 영향 없음

