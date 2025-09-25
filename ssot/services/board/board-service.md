# 🎯 Board Service - 게시판 관리

## 📊 서비스 정보

| 속성     | 값                              |
| -------- | ------------------------------- |
| **포트** | 3001                            |
| **역할** | 게시글/댓글 CRUD, 비밀번호 인증 |
| **위치** | `apps/board/`                   |

## 🎯 핵심 기능

- **게시글 관리**: CRUD, 페이징, 검색, 비밀번호 인증
- **댓글 시스템**: 계층형 댓글/대댓글 (무제한 depth)
- **자동화**: `@CheckResponseWithType` 응답 검증/변환
- **보안**: bcrypt 비밀번호 해싱, 응답 필터링
- **표준 응답**: Gateway에서 `{success: boolean, data: any}` 형태로 변환

## 🔧 모듈 구성 (2025.09.25 업데이트)

```typescript
@Module({
  imports: [
    CustomConfigModule,
    DatabaseModule,
    RedisModule,
    ResponseOnlyInterceptorModule, // 🔄 응답 데이터 검증/변환만 수행
    UtilityModule,
  ],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
```

## 🌐 API 엔드포인트

```bash
# 게시글 API
CreateBoard                         # 게시글 작성
FindAllBoards                       # 게시글 목록 (페이징, 검색)
UpdateBoard                         # 게시글 수정 (비밀번호 필요)
DeleteBoard                         # 게시글 삭제 (비밀번호 필요)

# 댓글 API
FindCommentsByBoard                 # 댓글 목록 (계층형)
CreateComment                       # 댓글 작성

# 시스템
BoardHealthCheck                    # 헬스체크
```

## 📊 데이터 모델

```typescript
// 게시글 Entity (tb_board)
- boardId, title, content, author, password
- createdAt, updatedAt
- 관계: comments (1:N with TbCommentEntity)

// 댓글 Entity (tb_comment)
- commentId, boardId, parentId, content, author, userId
- createdAt
- 관계: board (N:1), user (N:1), parent/children (계층형)
```

## 🔧 개발 명령어

```bash
# 개발 실행
pnpm run start:dev:board

# 테스트
pnpm test apps/board

# 헬스체크 (Gateway 경유)
curl http://localhost:3000/boards/health
```

---

> 📝 **핵심 특징**: `@CheckResponseWithType` 데코레이터로 응답 타입 안전성 보장, bcrypt 비밀번호 보안, 계층형 댓글 시스템 지원
