import {
  Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('tb_test3')
export class TbTest3Entity {
  @UpdateDateColumn()
  updatedAt: Date;

  @PrimaryGeneratedColumn()
  test3Id: number;

  @CreateDateColumn()
  createdAt: Date;
}
