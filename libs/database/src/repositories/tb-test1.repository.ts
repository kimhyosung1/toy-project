import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { TbTest1Entity } from '../entities/tb-test1.entity';


/**
 * @deprecated This repository is for a deleted table.
 * This repository is kept for backward compatibility but should not be used.
 * 이 리포지토리는 삭제된 테이블용입니다.
 * 기존 코드 호환성을 위해 유지되지만 사용하지 마세요.
 * 
 * Deletion detected on: 2025-09-13
 */
@Injectable()
export class TbTest1Repository {
  constructor(
    @InjectRepository(TbTest1Entity)
    private readonly repository: Repository<TbTest1Entity>,
  ) {}


}
