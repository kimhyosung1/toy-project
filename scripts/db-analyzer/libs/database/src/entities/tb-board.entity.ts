import {
  Column, Entity, Index, PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tb_board')
export class TbBoard {
  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ length: 50 })
  author: string;

  @Column({ length: 255 })
  password: string;

  @PrimaryGeneratedColumn()
  boardid: number;

  @Column({ default: 'CURRENT_TIMESTAMP(6)', name: 'createdAt' })
  createdat: Date;

  @Column({ default: 'CURRENT_TIMESTAMP(6)', name: 'updatedAt' })
  updatedat: Date;
}
