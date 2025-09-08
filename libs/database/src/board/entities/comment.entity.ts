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
import { BoardEntity } from './board.entity';

@Entity('tb_comment')
export class CommentEntity {
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

  @ManyToOne(() => BoardEntity, (board) => board.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'board_id' })
  board: BoardEntity;

  @ManyToOne(() => CommentEntity, (comment) => comment.children, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: CommentEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.parent)
  children: CommentEntity[];
}
