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
  @PrimaryGeneratedColumn()
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TbCommentEntity, (comment) => comment.board)
  comments: TbCommentEntity[];
}
