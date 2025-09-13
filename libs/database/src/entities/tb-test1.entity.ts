import {
  Column, Entity, UpdateDateColumn,
} from 'typeorm';

@Entity('tb_test1')
export class TbTest1Entity {
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
