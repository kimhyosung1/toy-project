import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tb_test')
export class TestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  name: string;
}
