import {
  Column, Entity, Index, PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tb_notification')
export class TbNotificationEntity {
  @Column({ name: 'source_id' })
  sourceId: number;

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ name: 'user_id', length: 100 })
  userId: string;

  @Column({ type: 'text' })
  keywords: string;

  @Column({ name: 'is_read', default: 0 })
  isRead: number;
}
