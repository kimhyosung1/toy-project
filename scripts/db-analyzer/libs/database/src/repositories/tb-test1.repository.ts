import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { TbTest1 } from '../entities/tb-test1.entity';

/**
 * TbTest1 테이블 Repository
 * 
 * 🤖 자동 생성된 Repository 클래스
 * - 기본 CRUD 작업 지원
 * - 타입 안전성 보장
 * - 커스텀 쿼리 메서드 포함
 * 
 * @generated 2025-09-12T23:07:12.699Z
 */
@Injectable()
export class TbTest1Repository {
  constructor(
    @InjectRepository(TbTest1)
    private readonly repository: Repository<TbTest1>,
  ) {}

  /**
   * 새 TbTest1 생성
   */
  async create(data: Partial<TbTest1>, entityManager?: EntityManager): Promise<TbTest1> {
    const manager = entityManager || this.repository.manager;
    const entity = manager.create(TbTest1, data);
    return manager.save(entity);
  }

  /**
   * ID로 TbTest1 조회
   */
  async findById(id: number): Promise<TbTest1 | null> {
    return this.repository.findOne({ where: { test1Id: id } as FindOptionsWhere<TbTest1> });
  }

  /**
   * 모든 TbTest1 조회 (페이징 지원)
   */
  async findAll(options?: FindManyOptions<TbTest1>): Promise<TbTest1[]> {
    return this.repository.find(options);
  }

  /**
   * 페이징과 함께 TbTest1 조회
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    options?: FindManyOptions<TbTest1>
  ): Promise<{ data: TbTest1[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.repository.findAndCount({
      ...options,
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  /**
   * TbTest1 업데이트
   */
  async update(
    id: number,
    data: Partial<TbTest1>,
    entityManager?: EntityManager
  ): Promise<TbTest1 | null> {
    const manager = entityManager || this.repository.manager;
    
    await manager.update(TbTest1, { test1Id: id } as FindOptionsWhere<TbTest1>, data);
    
    return this.findById(id);
  }

  /**
   * TbTest1 삭제
   */
  async delete(id: number, entityManager?: EntityManager): Promise<boolean> {
    const manager = entityManager || this.repository.manager;
    const result = await manager.delete(TbTest1, { test1Id: id } as FindOptionsWhere<TbTest1>);
    
    return (result.affected || 0) > 0;
  }

  /**
   * TbTest1 개수 조회
   */
  async count(where?: FindOptionsWhere<TbTest1>): Promise<number> {
    return this.repository.count({ where });
  }

  /**
   * TbTest1 존재 여부 확인
   */
  async exists(id: number): Promise<boolean> {
    const count = await this.repository.count({ 
      where: { test1Id: id } as FindOptionsWhere<TbTest1> 
    });
    return count > 0;
  }

  /**
   * 날짜 범위로 TbTest1 조회
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    options?: FindManyOptions<TbTest1>
  ): Promise<TbTest1[]> {
    return this.repository
      .createQueryBuilder('entity')
      .where('entity.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();
  }
}
