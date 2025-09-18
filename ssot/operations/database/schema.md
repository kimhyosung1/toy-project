# 🗄️ Database Schema - 데이터베이스 스키마

**MySQL 8.0+ 기반 데이터베이스 설계**

## 📊 현재 테이블 목록

| 테이블       | Entity            | 주요 기능            | 관계                                    |
| ------------ | ----------------- | -------------------- | --------------------------------------- |
| `tb_board`   | `TbBoardEntity`   | 게시글 CRUD          | 1:N → tb_comment                        |
| `tb_comment` | `TbCommentEntity` | 댓글/대댓글 (계층형) | N:1 → tb_board, tb_user, Self-Reference |
| `tb_user`    | `TbUserEntity`    | 사용자 정보          | 1:N → tb_comment                        |
| `tb_test1`   | `TbTest1Entity`   | 테스트용 테이블      | 독립 테이블 (관계 없음)                 |

## 🔗 테이블 관계

### 핵심 관계

- **tb_board** (1) ↔ (N) **tb_comment**: 게시글 ↔ 댓글
- **tb_user** (1) ↔ (N) **tb_comment**: 사용자 ↔ 댓글
- **tb_comment** (1) ↔ (N) **tb_comment**: 댓글 ↔ 대댓글 (계층형)

### 독립 테이블

- **tb_test1**: 다른 테이블과 관계 없음 (테스트용)

## 📝 관계 상세 설명

### tb_board → tb_comment (1:N)

- 게시글 하나에 여러 댓글 연결
- `tb_comment.board_id` → `tb_board.board_id`
- CASCADE 삭제: 게시글 삭제시 댓글 모두 삭제

### tb_user → tb_comment (1:N)

- 사용자 하나가 여러 댓글 작성 가능
- `tb_comment.user_id` → `tb_user.user_id`
- CASCADE 삭제: 사용자 삭제시 댓글 모두 삭제

### tb_comment → tb_comment (1:N, 계층형)

- 댓글에 대댓글 연결 (무제한 depth)
- `tb_comment.parent_id` → `tb_comment.comment_id`
- CASCADE 삭제: 부모 댓글 삭제시 자식 댓글 모두 삭제

### tb_test1 (독립)

- 다른 테이블과 관계 없음
- 테스트 목적으로 사용

---

> 📝 **참고**: 실제 Entity 코드는 `libs/database/src/entities/`에서 확인 가능
