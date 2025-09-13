import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { TbBoardEntity } from './tb-board.entity';

@Entity('tb_comment')
export class TbCommentEntity {
  @PrimaryGeneratedColumn()
  commentId: number;

  @Column()
  @Index('idx_board_id')
  boardId: number;

  @Column({ nullable: true })
  @Index('idx_parent_id')
  parentId: number | null;

  @Column({ type: 'varchar', length: 2000 })
  content: string;

  @Column({ type: 'varchar', length: 50 })
  author: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => TbBoardEntity, (board) => board.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'board_id' })
  board: TbBoardEntity;

  @ManyToOne(() => TbCommentEntity, (comment) => comment.children, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: TbCommentEntity;

  @OneToMany(() => TbCommentEntity, (comment) => comment.parent)
  children: TbCommentEntity[];
}
