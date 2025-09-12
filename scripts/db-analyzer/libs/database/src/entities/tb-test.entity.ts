import {
  Column, Entity, Index, PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tb_test')
export class TbTest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: true })
  name?: string;
}
