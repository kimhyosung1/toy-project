import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { TbNotificationEntity } from '../entities/tb-notification.entity';


/**
 * @deprecated This repository is for a deleted table.
 * This repository is kept for backward compatibility but should not be used.
 * 이 리포지토리는 삭제된 테이블용입니다.
 * 기존 코드 호환성을 위해 유지되지만 사용하지 마세요.
 * 
 * Deletion detected on: 2025-09-13
 */
@Injectable()
export class TbNotificationRepository {
  constructor(
    @InjectRepository(TbNotificationEntity)
    private readonly repository: Repository<TbNotificationEntity>,
  ) {}


}
