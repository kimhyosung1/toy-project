import {
  Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('tb_test3')
export class TbTest3Entity {
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @PrimaryGeneratedColumn({ name: 'test3_id' })
  test3Id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
