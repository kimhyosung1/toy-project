import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { TbUserEntity } from '../entities/tb-user.entity';


@Injectable()
export class TbUserRepository {
  constructor(
    @InjectRepository(TbUserEntity)
    private readonly repository: Repository<TbUserEntity>,
  ) {}


}
