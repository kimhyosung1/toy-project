import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { TbTest3Entity } from '../entities/tb-test3.entity';


@Injectable()
export class TbTest3Repository {
  constructor(
    @InjectRepository(TbTest3Entity)
    private readonly repository: Repository<TbTest3Entity>,
  ) {}


}
