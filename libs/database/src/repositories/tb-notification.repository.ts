import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { TbNotificationEntity } from '../entities/tb-notification.entity';


@Injectable()
export class TbNotificationRepository {
  constructor(
    @InjectRepository(TbNotificationEntity)
    private readonly repository: Repository<TbNotificationEntity>,
  ) {}


}
