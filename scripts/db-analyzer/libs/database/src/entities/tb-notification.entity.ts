import {
  Column, Entity, Index, PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tb_notification')
export class TbNotification {
  @Column({ default: '0', name: 'isRead' })
  isread: number;

  @Column({ default: 'CURRENT_TIMESTAMP(6)', name: 'createdAt' })
  createdat: Date;

  @Column({ name: 'sourceId' })
  sourceid: number;

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ length: 100, name: 'userId' })
  userid: string;

  @Column({ type: 'text' })
  keywords: string;

  @Column({ default: 'CURRENT_TIMESTAMP(6)', name: 'updatedAt' })
  updatedat: Date;

  @Column({ default: 'SYSTEM', enum: ['BOARD', 'COMMENT', 'SYSTEM'], name: 'sourceType' })
  sourcetype: 'BOARD' | 'COMMENT' | 'SYSTEM';
}
