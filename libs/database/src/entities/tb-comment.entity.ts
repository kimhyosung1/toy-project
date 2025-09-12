import {
  Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import { TbUserEntity } from './tb-user.entity';
import { TbBoardEntity } from './tb-board.entity';

@Entity('tb_comment')
export class TbCommentEntity {
  @PrimaryGeneratedColumn({ name: 'comment_id' })
  commentId: number;

  @Column({ name: 'board_id' })
  @Index('idx_board_id')
  boardId: number;

  @Column({ name: 'parent_id', nullable: true })
  @Index('idx_parent_id')
  parentId?: number;

  @Column({ length: 2000 })
  content: string;

  @Column({ length: 50 })
  author: string;

  @Column({ name: 'user_id', nullable: true })
  @Index('idx_user_id')
  userId?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @ManyToOne(() => TbUserEntity, (user) => user.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: TbUserEntity;

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
