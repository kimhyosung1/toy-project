-- 데이터베이스 선택 (이미 생성되어 있다고 가정)
USE anonymous_board;

-- 게시글 테이블
CREATE TABLE IF NOT EXISTS tb_board (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_title (title),
  INDEX idx_author (author),
  INDEX idx_created_at (created_at)
);

-- 댓글 테이블
CREATE TABLE IF NOT EXISTS tb_comment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  board_id INT NOT NULL,
  parent_id INT DEFAULT NULL,
  content TEXT NOT NULL,
  author VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (board_id) REFERENCES tb_board(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES tb_comment(id) ON DELETE CASCADE,
  INDEX idx_board_id (board_id),
  INDEX idx_parent_id (parent_id)
);

-- 키워드 알림 테이블
CREATE TABLE IF NOT EXISTS tb_keyword_notification (
  id INT AUTO_INCREMENT PRIMARY KEY,
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
  recipient VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  source_type VARCHAR(20) NOT NULL COMMENT 'board: 게시글, comment: 댓글',
  source_id INT NOT NULL,
  keyword VARCHAR(100) NOT NULL,
  INDEX idx_recipient (recipient),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
);

-- 초기 데이터 삽입 (테스트용 키워드 알림 데이터)
INSERT INTO tb_keyword_notification (author, keyword) VALUES
('홍길동', '테스트'),
('홍길동', '안녕'),
('김철수', '프로젝트'),
('이영희', '게시판'),
('이영희', '코딩'); 