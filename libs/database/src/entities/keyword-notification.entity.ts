import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity('tb_keyword_notification')
@Unique('unique_author_keyword', ['author', 'keyword'])
export class KeywordNotificationEntity {
  @PrimaryGeneratedColumn()
  keyNotificationId: number;

  @Column({ type: 'varchar', length: 50 })
  @Index('idx_author')
  author: string;

  @Column({ type: 'varchar', length: 100 })
  @Index('idx_keyword')
  keyword: string;

  @CreateDateColumn()
  createdAt: Date;
}
