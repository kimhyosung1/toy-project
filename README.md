## 📦 설치 및 실행 방법

### 사전 요구사항

- Node.js (v20 이상)
- pnpm
- MySQL
- Redis

### 설치

1. 저장소 클론

```bash
git clone https://github.com/kimhyosung1/toy-project.git
```

cd toy-project

2. 의존성 설치

```bash
pnpm install
```

3. 환경 변수 설정

```bash
# .env 파일 생성
touch .env
```

4. .env 파일 수정 (아래 내용 참고)

```
GATEWAY_SERVICE_PORT=3000

TEST2_SERVICE_HOST=127.0.0.1
TEST2_SERVICE_PORT=3010

BOARD_SERVICE_HOST=127.0.0.1
BOARD_SERVICE_PORT=3020

NOTIFICATION_SERVICE_HOST=127.0.0.1
NOTIFICATION_SERVICE_PORT=3030

DB_HOST=localhost
DB_PASSWORD=''
DB_USERNAME=root
DB_PORT=3306
DB_DATABASE=public
DB_SCHEMA=public
DB_SYNC=false

REDIS_HOST=localhost
REDIS_PORT=6379
```

5. 데이터베이스 테이블 생성은 위의 '테이블 구조' SQL 스크립트를 사용하여 생성합니다.

### 실행

각 서비스를 개별적으로 실행합니다:

```bash
# 게이트웨이 서비스 실행
pnpm run start:dev:gateway

# 게시판 서비스 실행
pnpm run start:dev:board

# 알림 서비스 실행
pnpm run start:dev:notification
```

### 테스트

```bash
# 유닛 테스트
npm test
```

```bash
# e2e 테스트
npm run test:e2e
```

## 📝 API 문서

- Swagger UI: `http://localhost:3000/api-docs`

## 익명 게시판 및 키워드 알림 API

익명 게시판과 키워드 알림 기능을 구현한 NestJS 기반 MSA(Microservice Architecture) 프로젝트입니다.

## 📋 요구사항 명세

### 게시판 기능

- 게시판은 제목, 내용, 작성자 이름, 비밀번호, 작성일시, 수정일시로 구성되어 있습니다.
- 로그인 기능 없이 작성자도 입력 파라미터로 받습니다.
- 게시판은 제목, 작성자로 검색이 가능합니다.
- 게시글 작성, 수정, 삭제가 가능합니다.
- 게시글 작성시에는 비밀번호를 입력 받고, 수정/삭제 시 입력한 비밀번호가 맞는 경우만 가능합니다.
- 게시글에는 댓글을 작성할 수 있습니다.
- 댓글은 내용, 작성자, 작성일시로 구성되어 있습니다.
- 댓글의 댓글까지 작성이 가능합니다.
- 게시물, 댓글 목록 API는 페이징 기능이 있어야 합니다.

### 키워드 알림 기능

- 키워드 알림 테이블은 작성자 이름, 키워드 컬럼을 포함하고 있어야 하고 편의상 작성자는 동명이인이 없다고 가정합니다.
- 작성자가 등록한 키워드가 포함된 게시글이나 코멘트 등록 시 알림을 보내줍니다.
- 키워드 등록/삭제 부분은 구현하지 않습니다.
- 알림 보내는 함수 호출하는 것으로만 하고 실제 알림 보내는 기능은 구현하지 않습니다.

## ✅ 기능 구현 목록

- [x] 게시글 목록 조회 API (페이징, 검색 기능)
- [x] 게시글 작성 API
- [x] 게시글 수정 API (비밀번호 검증)
- [x] 게시글 삭제 API (비밀번호 검증)
- [x] 댓글 목록 조회 API (페이징 기능)
- [x] 댓글 작성 API
- [x] 대댓글 작성 기능
- [x] 게시글/댓글 작성시 키워드 알림 기능

## 🚀 기술 스택

- **Backend**: NestJS, TypeScript
- **Database**: MySQL (with TypeORM)
- **캐싱**: Redis
- **API 문서화**: Swagger
- **비밀번호 암호화**: bcrypt
- **유효성 검증**: class-validator, class-transformer
- **환경 변수 관리**: @nestjs/config, dotenv
- **MSA 통신**: TCP 프로토콜 기반 마이크로서비스
- **의존성 관리**: pnpm

## 🏗 프로젝트 구조

```
toy-project/
├── apps/
│   ├── board/
│   │   └── src/
│   │       ├── controllers/
│   │       ├── dtos/
│   │       ├── services/
│   │       └── main.ts
│   ├── gateway/
│   │   └── src/
│   │       ├── controllers/
│   │       ├── dtos/
│   │       ├── services/
│   │       └── main.ts
│   └── notification/
│       └── src/
│           ├── controllers/
│           ├── dtos/
│           ├── services/
│           └── main.ts
├── libs/
│   ├── common/
│   │   ├── constants/
│   │   ├── decorators/
│   │   ├── filters/
│   ├── core/
│   │   ├── config/
│   │   ├── interfaces/
│   │   └── types/
│   ├── database/
│   │   ├── entities/
│   │   └── repositories/
│   └── proxy/
│       ├── board/
│       └── notification/
```

## 💾 데이터베이스 스키마

### 테이블 구조

```sql
-- 게시글 테이블
CREATE TABLE IF NOT EXISTS tb_board (
  board_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_title (title)
);

-- 댓글 테이블
CREATE TABLE IF NOT EXISTS tb_comment (
  comment_id INT AUTO_INCREMENT PRIMARY KEY,
  board_id INT NOT NULL,
  parent_id INT DEFAULT NULL,
  content VARCHAR(2000) NOT NULL,
  author VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (board_id) REFERENCES tb_board(board_id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES tb_comment(comment_id) ON DELETE CASCADE,
  INDEX idx_board_id (board_id),
  INDEX idx_parent_id (parent_id)
);

-- 키워드 알림 테이블
CREATE TABLE IF NOT EXISTS tb_keyword_notification (
  key_notification_id INT AUTO_INCREMENT PRIMARY KEY,
  author VARCHAR(50) NOT NULL,
  keyword VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_author_keyword (author, keyword),
  INDEX idx_author (author),
  INDEX idx_keyword (keyword)
);
```
