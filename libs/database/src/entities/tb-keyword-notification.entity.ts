import {
  Column, Entity,
} from 'typeorm';

/**
 * @deprecated This table has been deleted from the database.
 * This entity is kept for backward compatibility but should not be used.
 * 이 테이블은 데이터베이스에서 삭제되었습니다.
 * 기존 코드 호환성을 위해 유지되지만 사용하지 마세요.
 * 
 * Deletion detected on: 2025-09-13
 */
@Entity('tb_keyword_notification')
export class TbKeywordNotificationEntity {
  @Column({ length: 50 })
  author: string;

  @Column({ length: 100 })
  keyword: string;
}
