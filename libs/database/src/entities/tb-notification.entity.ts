import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tb_notification')
export class TbNotificationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'is_read', default: 0 })
  isRead: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'source_id' })
  sourceId: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ name: 'user_id', length: 100 })
  userId: string;

  @Column({ type: 'text' })
  keywords: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({
    name: 'source_type',
    default: 'SYSTEM',
    enum: ['BOARD', 'COMMENT', 'SYSTEM'],
  })
  sourceType: 'BOARD' | 'COMMENT' | 'SYSTEM';
}
