import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { TbKeywordNotificationEntity } from '../entities/tb-keyword-notification.entity';


@Injectable()
export class TbKeywordNotificationRepository {
  constructor(
    @InjectRepository(TbKeywordNotificationEntity)
    private readonly repository: Repository<TbKeywordNotificationEntity>,
  ) {}


}
