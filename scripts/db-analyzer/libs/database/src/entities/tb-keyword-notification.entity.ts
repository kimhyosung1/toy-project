import {
  Column, Entity, Index, PrimaryGeneratedColumn,
} from 'typeorm';

@Index('unique_author_keyword', ['author'], { unique: true })
@Index('unique_author_keyword', ['keyword'], { unique: true })
@Entity('tb_keyword_notification')
export class TbKeywordNotification {
  @Column({ length: 50 })
  author: string;

  @Column({ length: 100 })
  keyword: string;

  @PrimaryGeneratedColumn()
  keynotificationid: number;

  @Column({ default: 'CURRENT_TIMESTAMP(6)', name: 'createdAt' })
  createdat: Date;
}
