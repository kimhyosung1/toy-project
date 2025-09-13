import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tb_keyword_notification')
export class TbKeywordNotificationEntity {
  @PrimaryGeneratedColumn({ name: 'key_notification_id' })
  keyNotificationId: number;

  @Column({ length: 50 })
  author: string;

  @Column({ length: 100 })
  keyword: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
