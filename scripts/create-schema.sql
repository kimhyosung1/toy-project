-- 데이터베이스 선택 (이미 생성되어 있다고 가정)
USE anonymous_board;

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

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS tb_user (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE COMMENT '이메일 (JWT 로그인용)',
  password VARCHAR(255) NOT NULL COMMENT '비밀번호 (bcrypt 해싱)',
  role VARCHAR(20) DEFAULT 'user' COMMENT '사용자 역할 (user, admin)',
  is_active BOOLEAN DEFAULT TRUE COMMENT '계정 활성화 상태',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- 댓글 테이블
CREATE TABLE IF NOT EXISTS tb_comment (
  comment_id INT AUTO_INCREMENT PRIMARY KEY,
  board_id INT NOT NULL,
  parent_id INT DEFAULT NULL,
  user_id INT DEFAULT NULL,
  content VARCHAR(2000) NOT NULL,
  author VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (board_id) REFERENCES tb_board(board_id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES tb_comment(comment_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES tb_user(user_id) ON DELETE CASCADE,
  INDEX idx_board_id (board_id),
  INDEX idx_parent_id (parent_id),
  INDEX idx_user_id (user_id)
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

-- 알림 테이블
CREATE TABLE IF NOT EXISTS tb_notification (
  id INT AUTO_INCREMENT PRIMARY KEY,
  is_read TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  source_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NULL,
  user_id VARCHAR(100) NOT NULL,
  keywords TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  source_type ENUM('BOARD', 'COMMENT', 'SYSTEM') DEFAULT 'SYSTEM',
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
);

-- 테스트 테이블1
CREATE TABLE IF NOT EXISTS tb_test1 (
  test1_id INT AUTO_INCREMENT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 초기 데이터 삽입 (테스트용 키워드 알림 데이터)
INSERT INTO tb_keyword_notification (author, keyword) VALUES
('홍길동', '테스트'),
('홍길동', '안녕'),
('김철수', '프로젝트'),
('이영희', '게시판'),
('이영희', '코딩'); 