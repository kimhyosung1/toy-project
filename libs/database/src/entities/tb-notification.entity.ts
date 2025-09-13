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
  @Column({ default: '0' })
  isRead: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  sourceId: number;

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ length: 100 })
  userId: string;

  @Column({ type: 'text' })
  keywords: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'enum',
    enum: ['BOARD', 'COMMENT', 'SYSTEM'],
    default: 'SYSTEM',
  })
  sourceType: 'BOARD' | 'COMMENT' | 'SYSTEM';
}
