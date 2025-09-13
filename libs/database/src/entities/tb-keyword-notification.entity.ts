import {
  Column, Entity,
} from 'typeorm';

@Entity('tb_keyword_notification')
export class TbKeywordNotificationEntity {
  @Column({ length: 50 })
  author: string;

  @Column({ length: 100 })
  keyword: string;
}
