import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { TbTest1Entity } from '../entities/tb-test1.entity';


@Injectable()
export class TbTest1Repository {
  constructor(
    @InjectRepository(TbTest1Entity)
    private readonly repository: Repository<TbTest1Entity>,
  ) {}


}
