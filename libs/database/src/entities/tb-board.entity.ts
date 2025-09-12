import {
  Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { TbCommentEntity } from './tb-comment.entity';

@Entity('tb_board')
export class TbBoardEntity {
  @PrimaryGeneratedColumn({ name: 'board_id' })
  boardId: number;

  /**
   * 제목임
   */
  @Column({ length: 255, comment: '제목임' })
  @Index('idx_title')
  title: string;

  /**
   * 내용임
   */
  @Column({ type: 'text', comment: '내용임' })
  content: string;

  /**
   * 작성자임
   */
  @Column({ length: 50, comment: '작성자임' })
  author: string;

  /**
   * 비밀번호
   */
  @Column({ length: 255, comment: '비밀번호' })
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
  @OneToMany(() => TbCommentEntity, (comment) => comment.board)
  comments: TbCommentEntity[];
}
