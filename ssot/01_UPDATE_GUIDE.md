# 🔄 SSOT 업데이트 가이드

**AI가 새 기능 구현 후 SSOT 문서를 일관되게 갱신하는 방법**

## 🎯 갱신 원칙

### 1. 95% 일치율 유지

- 코드와 문서가 항상 95% 이상 일치해야 함
- 실제 코드를 기준으로 문서 작성
- 추상적인 설명보다 구체적인 구현 내용 반영

### 2. 일관된 업데이트 순서

1. **기능 구현 완료** → 코드 작성/수정
2. **영향도 분석** → 어떤 문서들을 업데이트해야 하는지 파악
3. **SSOT 갱신** → 아래 가이드에 따라 문서 업데이트
4. **검증** → 코드-문서 일치율 확인

## 📋 변경 유형별 갱신 가이드

### 🔧 새 서비스 추가 시

#### 갱신 대상

1. **00_COMPLETE_GUIDE.md** → 서비스 구조 테이블 + 새 서비스 섹션 추가
2. **services/[새서비스]/[서비스명]-service.md** → 새 파일 생성
3. **README.md** → 서비스별 문서 테이블 업데이트
4. **operations/CI-CD/configuration.md** → 배포 파이프라인 테이블 업데이트
5. **Docker 설정** → docker-compose.yml 또는 독립 docker-compose 파일 추가

#### 갱신 템플릿

````markdown
# 00_COMPLETE_GUIDE.md에 추가할 내용

### 서비스 구조 (테이블에 행 추가)

| **[서비스명]** | [포트] | [역할 설명] | ✅ |

### [서비스명] 섹션 (하단에 추가)

## 🔧 [서비스명] Service

### 핵심 기능

- **[기능1]**: [설명]
- **[기능2]**: [설명]

### 주요 엔드포인트

```bash
[실제 API 엔드포인트들]
```
````

### 보안 기능

- **[보안 요소들]**

````

### 🌐 새 API 엔드포인트 추가 시

#### 갱신 대상
1. **00_COMPLETE_GUIDE.md** → API 명세 섹션 업데이트
2. **services/[해당서비스]/[서비스명]-service.md** → API 섹션 업데이트

#### 갱신 템플릿
```markdown
# API 명세 섹션에 추가

### 주요 엔드포인트
```bash
# [새 기능] API
[HTTP_METHOD] /[경로]         # [설명]
````

### 요청/응답 예시 (필요한 경우)

```typescript
// [새 API] 요청
interface [RequestName] {
  [필드]: [타입]; // [설명]
}

// [새 API] 응답
interface [ResponseName] {
  [필드]: [타입]; // [설명]
}
```

````

### 🗄️ 새 Entity/테이블 추가 시

#### 갱신 대상
1. **00_COMPLETE_GUIDE.md** → 데이터베이스 섹션 업데이트
2. **operations/database/schema.md** → 테이블 목록 및 관계 정보 추가
3. **해당 서비스 README.md** → 데이터 모델 섹션 업데이트

#### 갱신 템플릿

**00_COMPLETE_GUIDE.md 갱신**:
```markdown
# 데이터베이스 섹션에 추가
### 주요 엔티티
```typescript
@Entity('[테이블명]')
export class [EntityName] {
  [실제 Entity 코드 복사]
}
````

**operations/database/schema.md 갱신**:

```markdown
# 테이블 목록에 행 추가

| `[테이블명]` | `[EntityName]` | [주요 기능] | [관계 설명] |

# 관계 설명에 추가 (관계가 있는 경우)

### [테이블명] → [연결테이블] (1:N 또는 N:1)

- [관계 설명]
- `[외래키필드]` → `[참조테이블.참조필드]`
- CASCADE 설정: [삭제 정책]
```

````

### 🐳 Docker 설정 변경 시

#### 갱신 대상
1. **00_COMPLETE_GUIDE.md** → Docker 환경 섹션
2. **CORE_REFERENCE.md** → Docker 명령어 섹션
3. **operations/docker/configuration.md** → 상세 설정

#### 갱신 템플릿
```markdown
# 컨테이너 구조 섹션 업데이트
```yaml
services:
  [실제 docker-compose.yml 내용 반영]
````

````

### 🔒 보안 기능 추가 시

#### 갱신 대상
1. **CORE_REFERENCE.md** → 보안 가이드 섹션
2. **00_COMPLETE_GUIDE.md** → 보안 가이드 섹션

#### 갱신 템플릿
```markdown
### [새 보안 기능]
```typescript
// [실제 구현 코드]
````

### 보안 체크리스트 (해당 항목 체크)

- [x] [새로 추가된 보안 기능]

````

## 🎯 갱신 시 주의사항

### ✅ DO (해야 할 것)
1. **실제 코드 기준**: 구현된 코드를 정확히 반영
2. **구체적 내용**: 실제 파일명, 클래스명, API 경로 사용
3. **일관된 형식**: 기존 문서의 스타일과 구조 유지
4. **상태 표시**: 구현 완료된 기능은 ✅ 표시
5. **예시 포함**: 실제 사용 가능한 코드 예시 제공

### ❌ DON'T (하지 말 것)
1. **추상적 설명**: "뭔가 기능", "어떤 API" 같은 모호한 표현
2. **미래 계획**: 구현되지 않은 기능을 마치 완성된 것처럼 기술
3. **중복 정보**: 이미 다른 섹션에 있는 내용 반복
4. **불일치**: 실제 코드와 다른 내용 작성
5. **과도한 세부사항**: AI가 이해하는데 불필요한 장황한 설명

## 🔍 업데이트 검증 체크리스트

### 코드-문서 일치성 확인
- [ ] API 엔드포인트가 실제 Controller와 일치하는가?
- [ ] Entity 구조가 실제 파일과 일치하는가?
- [ ] 포트 번호가 모든 문서에서 동일한가?
- [ ] 서비스명이 일관되게 사용되고 있는가?
- [ ] Docker 설정이 실제 compose 파일과 일치하는가?

### 문서 내 일관성 확인
- [ ] 같은 내용이 여러 문서에 중복되지 않는가?
- [ ] 참조 링크가 올바르게 연결되어 있는가?
- [ ] 새 기능이 관련된 모든 섹션에 반영되었는가?
- [ ] 코드 예시가 문법적으로 올바른가?

## 📝 서비스별 README.md 작성 가이드

### 🎯 AI 친화적 서비스 문서 작성 원칙

#### ✅ 필수 포함 사항 (AI가 빠르게 파악해야 할 정보)

1. **서비스 개요** (간결하게)
   - 포트, 역할, 위치만 테이블로
   - 핵심 특징 3-4개만 나열

2. **구성 요소** (명확하게)
   - 실제 API 엔드포인트 목록
   - 주요 Entity 스키마 (실제 코드)
   - 지원 기능 리스트

3. **API 명세** (실용적으로)
   - HTTP 메서드 + 경로 + 설명 (한 줄씩)
   - Request/Response 타입 (간결한 interface)
   - 실제 사용 가능한 curl 예시 1-2개

4. **데이터 모델** (핵심만)
   - Entity명과 테이블명
   - 주요 필드 목록 (타입 정보 제외)
   - 관계 정보 간단히 (1:N, N:1 등)

#### ❌ 제거 대상 (불필요한 장황함)

1. **과도한 설명**
   - 상세한 비즈니스 로직 설명
   - 과도한 코드 예시 (전체 Entity 클래스 등)
   - 너무 자세한 보안 설명

2. **중복 정보**
   - 00_COMPLETE_GUIDE.md와 겹치는 내용
   - 다른 문서에서 관리되는 정보

3. **미래 계획**
   - 아직 구현되지 않은 기능
   - 확장 계획이나 로드맵

### 📋 표준 템플릿 구조

```markdown
# 🎯 [Service Name] - [한 줄 설명]

## 📊 서비스 정보

| 속성 | 값 |
|------|-----|
| **포트** | [포트번호] |
| **역할** | [핵심 기능 요약] |
| **위치** | `apps/[서비스명]/` |

## 🎯 핵심 기능

- **[기능1]**: [간단 설명]
- **[기능2]**: [간단 설명]
- **[기능3]**: [간단 설명]

## 🌐 API 엔드포인트

```bash
# [기능 그룹]
[METHOD] /[path]                    # [설명]
[METHOD] /[path]                    # [설명]

# [다른 기능 그룹]
[METHOD] /[path]                    # [설명]
```

## 📊 데이터 모델

```typescript
// [Entity명] ([테이블명])
- [주요 필드들 나열]
- [관계 정보 간단히]
```

## 🔧 개발 명령어

```bash
# 개발 실행
pnpm run start:dev:[서비스명]

# 테스트
pnpm test apps/[서비스명]

# 헬스체크
curl http://localhost:3000/[서비스명]/health
```

---
```

### 🎯 실제 적용 예시

#### 기존 (Board Service README) - 503줄
- 너무 상세한 API 명세 (Request/Response DTO 전체)
- 과도한 코드 예시들
- 확장 방법, 성능 최적화 등 장황한 설명

#### 개선 후 (권장) - 약 100줄
```markdown
# 🎯 Board Service - 게시판 관리

## 📊 서비스 정보

| 속성 | 값 |
|------|-----|
| **포트** | 3001 |
| **역할** | 게시글/댓글 CRUD, 비밀번호 인증 |
| **위치** | `apps/board/` |

## 🎯 핵심 기능

- **게시글 관리**: CRUD, 페이징, 검색, 비밀번호 인증
- **댓글 시스템**: 계층형 댓글/대댓글 (무제한 depth)
- **자동화**: `@CheckResponseWithType` 응답 검증/변환

## 🌐 API 엔드포인트

```bash
# 게시글 API
POST /boards                        # 게시글 작성
GET /boards                         # 게시글 목록 (페이징, 검색)
PUT /boards/:id                     # 게시글 수정 (비밀번호 필요)
DELETE /boards/:id                  # 게시글 삭제 (비밀번호 필요)

# 댓글 API
POST /boards/:id/comments           # 댓글 작성
GET /boards/:id/comments            # 댓글 목록 (계층형)
```

## 📊 데이터 모델

```typescript
// 게시글 Entity
@Entity('tb_board')
export class TbBoardEntity {
  @PrimaryGeneratedColumn()
  boardId: number;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  content: string;

  @Column({ length: 50 })
  author: string;

  @Column({ length: 255 })
  password: string; // bcrypt 해싱

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TbBoardCommentEntity, comment => comment.board)
  comments: TbBoardCommentEntity[];
}

// 댓글 Entity
@Entity('tb_board_comment')
export class TbBoardCommentEntity {
  @PrimaryGeneratedColumn()
  commentId: number;

  @Column('text')
  content: string;

  @Column({ length: 50 })
  author: string;

  @Column({ nullable: true })
  parentId: number; // 대댓글용

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => TbBoardEntity, board => board.comments)
  @JoinColumn({ name: 'boardId' })
  board: TbBoardEntity;

  @Column()
  boardId: number;
}
```

## 🔧 개발 명령어

```bash
# 개발 실행
pnpm run start:dev:board

# 테스트
pnpm test apps/board

# 헬스체크
curl http://localhost:3000/boards/health
```

---
```

### 📝 서비스 README.md 업데이트 시 체크리스트

#### ✅ 포함해야 할 것
- [ ] 서비스 기본 정보 (포트, 역할, 위치)
- [ ] 실제 구현된 API 엔드포인트 목록
- [ ] Entity 관계 정보 (필드명 + 관계만 간단히)
- [ ] 기본 개발 명령어 (실행, 테스트, 헬스체크)

#### ❌ 제거해야 할 것
- [ ] 과도한 API 상세 명세 (DTO 전체 코드)
- [ ] 전체 Entity 클래스 코드 (데코레이터, 타입 등)
- [ ] 확장 방법, 성능 최적화 등 장황한 가이드
- [ ] 구현되지 않은 미래 기능들

#### 🎯 AI 최적화 포인트
- [ ] 한 눈에 파악 가능한 구조
- [ ] 실제 코드 우선 (추상적 설명 최소화)
- [ ] 중복 정보 제거 (다른 문서 참조)
- [ ] 100줄 내외로 압축

### 🔄 업데이트 프로세스

1. **기존 README 분석**: 현재 길이와 불필요한 내용 파악
2. **템플릿 적용**: 위의 표준 구조로 재구성
3. **실제 코드 확인**: API, Entity가 실제 코드와 정확히 일치하는지 검증
4. **AI 테스트**: AI가 서비스를 빠르게 이해할 수 있는지 확인

## 💡 실제 갱신 예시

### 예시 1: "좋아요 기능" 추가 후 SSOT 갱신

#### 1단계: 영향도 분석
- Board Service에 좋아요 API 추가됨
- tb_board_like 테이블 신규 생성
- POST /boards/:id/like 엔드포인트 추가

#### 2단계: 문서 갱신

**00_COMPLETE_GUIDE.md 갱신**:
```markdown
### 주요 엔드포인트 (추가)
```bash
# 좋아요 API
POST /boards/:id/like               # 게시글 좋아요
DELETE /boards/:id/like             # 좋아요 취소
GET /boards/:id/likes               # 좋아요 수 조회
````

### 주요 엔티티 (추가)

```typescript
@Entity('tb_board_like')
export class TbBoardLikeEntity {
  @PrimaryGeneratedColumn()
  likeId: number;
  @Column()
  boardId: number;
  @Column()
  userId: number;
  @CreateDateColumn()
  createdAt: Date;
}
```

**operations/database/schema.md 갱신**:

```markdown
# 테이블 목록에 추가

| `tb_board_like` | `TbBoardLikeEntity` | 게시글 좋아요 | N:1 → tb_board, tb_user |

# 관계 설명에 추가

### tb_board_like → tb_board (N:1)

- 좋아요는 특정 게시글에 속함
- `tb_board_like.board_id` → `tb_board.board_id`
- CASCADE 삭제: 게시글 삭제시 좋아요 모두 삭제

### tb_board_like → tb_user (N:1)

- 좋아요는 특정 사용자가 누름
- `tb_board_like.user_id` → `tb_user.user_id`
- CASCADE 삭제: 사용자 삭제시 좋아요 모두 삭제
```

````

#### 3단계: 검증
- [ ] API 경로가 실제 Controller와 일치 ✅
- [ ] Entity가 실제 파일과 일치 ✅
- [ ] services/board/board-service.md도 업데이트 ✅
- [ ] operations/database/schema.md 테이블 관계 추가 ✅

### 예시 2: "Payment 서비스" 추가 후 SSOT 갱신

#### 1단계: 영향도 분석
- 새 Payment 서비스 추가 (독립 CI/CD 필요)
- tb_payment, tb_payment_log 테이블 신규 생성
- 외부 결제 API 연동 (Stripe, Toss)

#### 2단계: CI/CD 설정

**독립 CI/CD 워크플로우 생성**:
```yaml
# .github/workflows/payment-ci-cd.yml
name: 💳 Payment Service CI/CD
env:
  IMAGE_NAME: toy-project-payment
build-args: |
  TARGET_APPS=payment
````

**docker-compose.payment.yml 생성**:

```yaml
services:
  payment:
    build:
      dockerfile: Dockerfile.payment
    container_name: toy-project-payment
    ports: ['${PAYMENT_SERVICE_PORT:-3007}:3007']
```

**main-services-ci-cd.yml 제외 목록 업데이트**:

```bash
# 기존: ! -name "notification" ! -name "scheduler"
# 수정: ! -name "notification" ! -name "scheduler" ! -name "payment"
```

#### 3단계: 문서 갱신

**operations/CI-CD/configuration.md 갱신**:

```markdown
| **결제 서비스** | payment-ci-cd | docker-compose.payment.yml | Payment | 독립 빌드 |
```

**00_COMPLETE_GUIDE.md 갱신**:

```markdown
| **Payment** | 3007 | 결제 처리, 외부 API 연동 | ✅ |
```

#### 4단계: 검증

- [ ] GitHub Actions 워크플로우 정상 실행 ✅
- [ ] Docker 이미지 빌드 및 푸시 성공 ✅
- [ ] Main Services CI/CD에서 payment 제외 확인 ✅
- [ ] operations/CI-CD/configuration.md 배포 테이블 업데이트 ✅
- [ ] ORM Generator에서 payment 테이블 자동 생성 확인 ✅

### 🔧 CI/CD 변경사항 체크리스트

#### 새 앱 추가시 필수 확인

- [ ] **GitHub Actions**: 해당 앱이 올바른 워크플로우에 포함되는가?
- [ ] **Docker 설정**: docker-compose.yml 또는 독립 파일에 서비스 추가됨?
- [ ] **포트 설정**: 새 포트가 다른 서비스와 충돌하지 않는가?
- [ ] **환경 변수**: `[APP_NAME]_SERVICE_PORT` 패턴 준수했는가?
- [ ] **제외 목록**: 독립 CI/CD 생성시 main-services-ci-cd.yml에서 제외됨?

#### GitHub Actions 워크플로우 수정시 필수 확인

- [ ] **트리거 브랜치**: `[dev, qa, production]` 동일한가?
- [ ] **레지스트리**: `REGISTRY: ghcr.io` 일관성 유지?
- [ ] **권한**: `contents: read, packages: write` 설정됨?
- [ ] **Docker 파일**: 올바른 Dockerfile 경로 지정됨?
- [ ] **빌드 인수**: `TARGET_APPS` 정확히 설정됨?

#### ORM Generator 워크플로우 수정시 필수 확인

- [ ] **대기 시간**: Main Services CI/CD 완료 후 5분 대기 설정?
- [ ] **스킵 로직**: `[skip ci]` 태그 무한 루프 방지 동작?
- [ ] **환경 매핑**: 브랜치별 DB 연결 정보 올바름?
- [ ] **자동 커밋**: 변경사항 감지시 자동 커밋 & 푸시 동작?

## 🚀 자동화 팁

### AI 갱신 프롬프트 템플릿

```

새 기능 구현이 완료되었습니다:

- [구현된 기능 설명]
- [변경된 파일들]
- [새로 추가된 API/Entity/설정]

위 갱신 가이드에 따라 관련 SSOT 문서들을 업데이트해주세요:

1. 영향도 분석부터 시작
2. 갱신 템플릿 참고하여 문서 수정
3. 검증 체크리스트로 확인

```

## 🔒 AI SSOT 준수 강제 규칙

### 🎯 필수 준수 사항

**모든 AI는 SSOT 업데이트 시 반드시 이 UPDATE_GUIDE를 따라야 합니다.**

1. **서비스 README.md 작성/수정 시**:

   - ✅ 반드시 "📝 서비스별 README.md 작성 가이드" 섹션 참조
   - ✅ 표준 템플릿 구조 준수 (서비스 정보 → 핵심 기능 → API → 데이터 모델 → 개발 명령어)
   - ✅ 100줄 내외로 압축하여 AI 친화적으로 작성
   - ❌ 과도한 API 상세 명세나 확장 가이드 포함 금지

2. **코드 변경 후 SSOT 갱신 시**:

   - ✅ 반드시 "📋 변경 유형별 갱신 가이드" 참조
   - ✅ 영향도 분석 → 갱신 → 검증 순서 준수
   - ✅ 실제 코드 기준으로 95% 일치율 유지
   - ❌ 구현되지 않은 기능을 문서에 포함 금지

3. **문서 일관성 유지**:
   - ✅ 같은 정보는 한 곳에만 관리 (중복 제거)
   - ✅ 참조 링크 정확성 확인
   - ✅ 용어 통일 (서비스명, 포트, API 패턴 등)

### 🚫 위반 시 조치

이 가이드를 따르지 않은 SSOT 업데이트는 **무효**로 간주됩니다:

- 실제 코드와 문서 불일치 발견 시 → 즉시 수정 필요
- 템플릿 구조를 따르지 않은 경우 → 표준 형식으로 재작성
- 과도한 중복 정보나 불필요한 내용 포함 시 → 간결화 필요

### 📝 준수 확인 방법

AI가 SSOT를 업데이트할 때 다음을 자동 체크해야 함:

```bash
# 체크리스트
1. [ ] 01_UPDATE_GUIDE의 해당 섹션을 참조했는가?
2. [ ] 표준 템플릿 구조를 따랐는가?
3. [ ] 실제 코드와 95% 이상 일치하는가?
4. [ ] AI가 빠르게 파악할 수 있도록 간결하게 작성되었는가?
5. [ ] 중복 정보를 제거했는가?
```

---

**🎯 목표**: 이 가이드를 따르면 언제나 일관되고 정확한 SSOT를 유지할 수 있습니다!

**⚠️ 중요**: 모든 AI는 이 01_UPDATE_GUIDE를 SSOT 업데이트의 절대 기준으로 삼아야 합니다.
