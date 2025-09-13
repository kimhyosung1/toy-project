import {
  Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { TbCommentEntity } from './tb-comment.entity';

@Entity('tb_user')
export class TbUserEntity {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ length: 255 })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;
  @OneToMany(() => TbCommentEntity, (comment) => comment.user)
  comments: TbCommentEntity[];
}
