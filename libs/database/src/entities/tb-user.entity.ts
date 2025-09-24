import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TbCommentEntity } from './tb-comment.entity';

@Entity('tb_user')
export class TbUserEntity {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ length: 255 })
  name: string;

  /**
   * 이메일 (JWT 로그인용)
   */
  @Column({ length: 255, unique: true, comment: '이메일 (JWT 로그인용)' })
  @Index('idx_email')
  email: string;

  /**
   * 비밀번호 (bcrypt 해싱)
   */
  @Column({ length: 255, comment: '비밀번호 (bcrypt 해싱)' })
  password: string;

  /**
   * 사용자 역할 (user, admin)
   */
  @Column({ length: 20, default: 'user', comment: '사용자 역할 (user, admin)' })
  role: string;

  /**
   * 계정 활성화 상태
   */
  @Column({ default: true, comment: '계정 활성화 상태' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => TbCommentEntity, (comment) => comment.user)
  comments: TbCommentEntity[];
}
