import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { TbTest2Entity } from '../entities/tb-test2.entity';


@Injectable()
export class TbTest2Repository {
  constructor(
    @InjectRepository(TbTest2Entity)
    private readonly repository: Repository<TbTest2Entity>,
  ) {}


}
