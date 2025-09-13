import {
  Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('tb_test1')
export class TbTest1Entity {
  @PrimaryGeneratedColumn({ name: 'test1_id' })
  test1Id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => TbTest1Entity, (test) => test.test1Id)
  children: TbTest1Entity[];
}
