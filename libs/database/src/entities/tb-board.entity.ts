import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { TbCommentEntity } from './tb-comment.entity';

@Entity('tb_board')
export class TbBoardEntity {
  @PrimaryGeneratedColumn({ name: 'board_id' })
  boardId: number;

  @Column({ type: 'varchar', length: 255 })
  @Index('idx_title')
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 50 })
  author: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => TbCommentEntity, (comment) => comment.board)
  comments: TbCommentEntity[];
}
