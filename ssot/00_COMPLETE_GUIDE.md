# 🎯 Complete Guide - 완전한 프로젝트 가이드

**NestJS 마이크로서비스 스켈레톤 - 통합 개발 가이드**

## 🚀 빠른 시작

### 1. 환경 설정

```bash
# 의존성 설치
pnpm install

# Docker 환경 시작
./docker.sh dev up -d

# 개발 서버 실행.
pnpm run start:dev:gateway
pnpm run start:dev:board
```

### 2. AI와 효율적으로 협업하기

```bash
# 구체적인 키워드 사용
ssot gateway "포트 변경 방법"
ssot board "게시글 좋아요 기능 추가"
ssot database "새 테이블 추가"
```

## 🏗️ 시스템 아키텍처

### 서비스 구조

| 서비스           | 포트 | 역할                         | 상태 |
| ---------------- | ---- | ---------------------------- | ---- |
| **Gateway**      | 3000 | API Gateway, HTTP→TCP 프록시 | ✅   |
| **Board**        | 3001 | 게시판 CRUD, 댓글 시스템     | ✅   |
| **Notification** | 3002 | Slack/Sentry 알림, 큐 처리   | ✅   |
| **Scheduler**    | 3004 | CRON 스케줄링, 배치 작업     | ✅   |
| **Account**      | 3005 | JWT 인증, 회원가입/로그인    | ✅   |
| **File**         | 3006 | 파일 업로드/다운로드         | ✅   |

### 통신 패턴

```typescript
// HTTP → TCP 프록시 패턴
@Post('boards')
async createBoard(@Body() dto: CreateBoardRequest) {
  return this.boardClient.send(
    CustomMessagePatterns.CreateBoard,
    dto
  ).toPromise();
}
```

### 핵심 기술

- **NestJS v11** + **TypeScript v5.1.3**
- **SWC 컴파일러** (15.6% 성능 향상)
- **pnpm 패키지 관리** (2-3배 빠른 설치)
- **MySQL + TypeORM**
- **Redis + Bull Queue**

### 설계 원칙

- **자동화 우선**: `@CheckResponseWithType` 데코레이터 기반 자동 응답 변환
- **타입 안전성**: 런타임 타입 검증 및 변환
- **마이크로서비스**: 단일 책임 원칙 기반 서비스 분리

### 필수 요구사항

- **Node.js**: v22 (LTS)
- **pnpm**: v8+
- **Docker**: v20+
- **Docker Compose**: v2+
- **MySQL**: 8.0+

## 📊 데이터베이스

### 주요 엔티티

```typescript
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

  @OneToMany(() => TbBoardCommentEntity, (comment) => comment.board)
  comments: TbBoardCommentEntity[];
}
```

### DB 관리 도구

```bash
# Enhanced DB Sync 실행
./scripts/run-enhanced-db-sync.sh dev

# 스키마 생성
mysql -u root -p toy_project < scripts/create-schema.sql
```

## 🌐 API 명세

### 주요 엔드포인트

```bash
# 게시판 API
POST /boards                    # 게시글 작성
GET /boards?page=1&limit=10     # 게시글 목록
PUT /boards/:id                 # 게시글 수정
DELETE /boards/:id              # 게시글 삭제

# 댓글 API
POST /boards/:id/comments       # 댓글 작성
GET /boards/:id/comments        # 댓글 목록

# 계정 관리 API
POST /account/signup            # 회원가입
POST /account/signin            # 로그인 (JWT 토큰 발급)
GET /account/profile            # 사용자 정보 조회 (인증 필요)
POST /account/validate-token    # JWT 토큰 검증 (내부 서비스용)

# 알림 API
POST /notifications/slack       # Slack 메시지
POST /notifications/error       # 에러 알림

# 시스템 API
GET /health-check               # 헬스체크
GET /api-docs                   # Swagger 문서
```

### 요청/응답 예시

```typescript
// 게시글 작성 요청
interface CreateBoardRequest {
  title: string; // 1-100자
  content: string; // 1-5000자
  author: string; // 1-50자
  password: string; // 4-20자, 영숫자+특수문자
}

// 게시글 작성 응답
interface CreateBoardResponse {
  boardId: number;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  // password는 자동 제외
}

// 회원가입 요청
interface SignUpRequest {
  name: string; // 2-50자
  email: string; // 유효한 이메일 형식
  password: string; // 8자 이상
}

// 로그인 응답
interface SignInResponse {
  user: {
    userId: number;
    name: string;
    email: string;
    role: string;
  };
  token: {
    accessToken: string;
    tokenType: 'Bearer';
    expiresIn: number; // 3600 (1시간)
  };
}
```

## 🐳 Docker 환경

### 환경별 실행

```bash
# 개발 환경
./docker.sh dev up -d

# QA 환경
./docker.sh qa up -d --profile full

# 운영 환경
./docker.sh prod up -d
```

### 컨테이너 구조

```yaml
services:
  gateway:
    build: .
    ports: ['3000:3000']
    command: ['node', 'dist/apps/gateway/main']

  board:
    build: .
    ports: ['3001:3001']
    command: ['node', 'dist/apps/board/main']
    depends_on: [mysql]

  mysql:
    image: mysql:8.0
    ports: ['3306:3306']
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: toy_project
```

## 🔒 보안 가이드

### 핵심 보안 원칙

- **방어적 프로그래밍**: 다층 보안 구조
- **최소 권한 원칙**: 필요한 권한만 부여
- **입력 검증**: 모든 입력 데이터 검증
- **암호화**: 민감 데이터 암호화

### 비밀번호 보안

```typescript
// bcrypt 해싱 (Round 10)
const hashedPassword = await bcrypt.hash(password, 10);

// 비밀번호 검증
const isValid = await bcrypt.compare(plainPassword, hashedPassword);

// 응답에서 자동 제외
@Column()
@Exclude()
password: string;
```

### 입력 검증

```typescript
export class CreateBoardRequest {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  title: string;

  @IsString()
  @Length(4, 20)
  @Matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/)
  password: string;
}
```

### CORS 설정

```typescript
app.enableCors({
  origin:
    process.env.NODE_ENV === 'production' ? ['https://yourdomain.com'] : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### 보안 체크리스트

#### 개발 단계

- [x] 모든 입력 검증 구현
- [x] 비밀번호 해시화 적용
- [x] SQL Injection 방지 (TypeORM)
- [x] XSS 방지 구현
- [x] 민감 데이터 응답 제외

#### 배포 단계

- [ ] HTTPS 적용
- [x] 환경 변수 보안 설정
- [x] CORS 정책 제한
- [x] 에러 메시지 필터링
- [ ] 보안 헤더 설정

## 🚀 개발 가이드

### 새 서비스 추가

1. **앱 생성**: `nest generate app [서비스명]`
2. **포트 할당**: 3000번대 순차 배정
3. **Docker 설정**: docker-compose.yml 업데이트
4. **Gateway 연동**: 프록시 설정 추가

### 새 API 추가

1. **Controller**: 엔드포인트 정의
2. **Service**: 비즈니스 로직 구현
3. **DTO**: Request/Response 클래스
4. **Validation**: class-validator 적용

### 테스트 작성

```bash
# 단위 테스트
pnpm test apps/board

# E2E 테스트
pnpm run test:e2e

# 커버리지 확인
pnpm run test:cov
```

## 🔧 운영 가이드

### 모니터링

```bash
# 헬스체크
curl http://localhost:3000/health-check

# 로그 확인
./docker.sh dev logs -f gateway

# 메트릭 확인
curl http://localhost:3000/metrics
```

### 성능 최적화

- **데이터베이스 인덱스**: 검색 성능 향상
- **Redis 캐싱**: 자주 조회되는 데이터
- **페이징**: 대용량 데이터 효율 처리
- **압축**: GZIP 응답 압축

### 백업 & 복구

```bash
# DB 백업
mysqldump -u root -p toy_project > backup.sql

# DB 복구
mysql -u root -p toy_project < backup.sql
```

## 🤖 AI 협업 가이드

### 효율적인 질문 방법

```bash
# ✅ 좋은 예
ssot gateway "새 API 엔드포인트 추가하고 싶어"
ssot board "댓글 수정 기능 구현해줘"
ssot database "User 테이블에 이메일 컬럼 추가"

# ❌ 피해야 할 예
ssot "뭔가 안돼요"
ssot "전체 시스템 수정해줘"
```

### 개발 워크플로우

1. **작업 계획**: AI에게 단계별 계획 요청
2. **단계별 구현**: 하나씩 순차적으로 진행
3. **테스트**: 각 단계별 검증
4. **문서 업데이트**: 변경사항 반영

### 서비스별 키워드

| 서비스       | 키워드                        | 주요 작업            |
| ------------ | ----------------------------- | -------------------- |
| Gateway      | `gateway`, `라우팅`, `프록시` | API 라우팅, 미들웨어 |
| Board        | `board`, `게시글`, `댓글`     | CRUD, 비즈니스 로직  |
| Notification | `notification`, `알림`        | 외부 연동, 큐 처리   |
| Database     | `database`, `entity`          | 스키마, 마이그레이션 |

## 🎯 문제 해결

### 자주 발생하는 문제

1. **포트 충돌**: 다른 포트로 변경 또는 기존 프로세스 종료
2. **DB 연결 실패**: MySQL 서비스 상태 확인
3. **Docker 빌드 실패**: 캐시 초기화 후 재빌드
4. **의존성 오류**: node_modules 삭제 후 재설치

### 디버깅 명령어

```bash
# 포트 사용 확인
lsof -ti:3000

# Docker 컨테이너 상태
docker ps -a

# 로그 실시간 확인
docker logs -f container_name

# 메모리 사용량 확인
docker stats
```

## 📚 주요 명령어

### 개발

```bash
# 개발 서버
pnpm run start:dev:[서비스명]

# 빌드
pnpm run build:all:swc

# 테스트
pnpm test [경로]

# 린트
pnpm run lint
```

### Docker

```bash
# 환경 시작
./docker.sh [dev|qa|prod] up -d

# 로그 확인
./docker.sh [환경] logs -f [서비스]

# 서비스 재시작
./docker.sh [환경] restart [서비스]

# 환경 정리
./docker.sh [환경] down -v
```

## 🎯 개발 팁

### 코드 생성 패턴

```typescript
// DTO 생성 표준 패턴
export class NewFeatureRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Date)
  @IsDate()
  createdAt: Date;
}

// Entity 보안 패턴
@Entity('tb_example')
export class TbExample {
  @Column()
  @Exclude() // 응답에서 제외
  password: string;

  @Column()
  @Expose() // 응답에 포함
  publicData: string;
}
```

### 문제 해결

```bash
# 포트 충돌
lsof -i :3000                           # 포트 사용 확인
kill -9 $(lsof -ti:3000)                # 프로세스 종료

# Docker 이슈
docker system prune -f                  # 정리
./docker.sh dev down && ./docker.sh dev up -d  # 재시작

# 의존성 이슈
rm -rf node_modules pnpm-lock.yaml
pnpm install                            # 재설치
```

### 성능 확인

```bash
# 빌드 시간 측정
time pnpm run build:all:swc

# 메모리 사용량
docker stats

# 로그 확인
tail -f logs/application-$(date +%Y-%m-%d).log
```

### 유용한 Alias

```bash
# ~/.bashrc 또는 ~/.zshrc에 추가
alias ddev="./docker.sh dev"
alias dev-gateway="pnpm run start:dev:gateway"
alias dev-board="pnpm run start:dev:board"
alias build-swc="pnpm run build:all:swc"
```

---

**💡 팁**: 이 가이드는 프로젝트의 모든 핵심 정보를 포함합니다. 더 자세한 내용이 필요한 경우 AI에게 구체적인 키워드와 함께 질문하세요!
