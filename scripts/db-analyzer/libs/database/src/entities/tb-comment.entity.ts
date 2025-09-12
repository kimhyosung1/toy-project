import {
  Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tb_comment')
export class TbComment {
  @Column({ nullable: true, name: 'board_id' })
  boardId?: number;

  @Column({ nullable: true, name: 'parent_id' })
  parentId?: number;

  @Column({ length: 2000 })
  content: string;

  @Column({ length: 50 })
  author: string;

  @PrimaryGeneratedColumn()
  commentid: number;

  @Column({ name: 'boardId' })
  boardid: number;

  @Column({ nullable: true, name: 'parentId' })
  parentid?: number;

  @Column({ default: 'CURRENT_TIMESTAMP(6)', name: 'createdAt' })
  createdat: Date;
  /**
   * tb_board 관계
   */
  @ManyToOne(() => TbBoard)
  @JoinColumn({ name: 'board_id' })
  tbBoard?: TbBoard;

  /**
   * tb_comment 관계
   */
  @ManyToOne(() => TbComment)
  @JoinColumn({ name: 'parent_id' })
  tbComment?: TbComment;
}
