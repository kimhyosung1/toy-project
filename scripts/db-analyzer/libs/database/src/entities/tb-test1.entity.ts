import {
  Column, Entity, Index, PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tb_test1')
export class TbTest1 {
  @PrimaryGeneratedColumn()
  test1Id: number;

  @Column({ default: 'CURRENT_TIMESTAMP(6)', name: 'created_at' })
  createdAt: Date;

  @Column({ default: 'CURRENT_TIMESTAMP(6)', name: 'updated_at' })
  updatedAt: Date;
}
