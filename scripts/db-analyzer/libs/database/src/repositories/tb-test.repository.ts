import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { TbTest } from '../entities/tb-test.entity';

/**
 * TbTest 테이블 Repository
 * 
 * 🤖 자동 생성된 Repository 클래스
 * - 기본 CRUD 작업 지원
 * - 타입 안전성 보장
 * - 커스텀 쿼리 메서드 포함
 * 
 * @generated 2025-09-12T23:07:12.699Z
 */
@Injectable()
export class TbTestRepository {
  constructor(
    @InjectRepository(TbTest)
    private readonly repository: Repository<TbTest>,
  ) {}

  /**
   * 새 TbTest 생성
   */
  async create(data: Partial<TbTest>, entityManager?: EntityManager): Promise<TbTest> {
    const manager = entityManager || this.repository.manager;
    const entity = manager.create(TbTest, data);
    return manager.save(entity);
  }

  /**
   * ID로 TbTest 조회
   */
  async findById(id: number): Promise<TbTest | null> {
    return this.repository.findOne({ where: { id: id } as FindOptionsWhere<TbTest> });
  }

  /**
   * 모든 TbTest 조회 (페이징 지원)
   */
  async findAll(options?: FindManyOptions<TbTest>): Promise<TbTest[]> {
    return this.repository.find(options);
  }

  /**
   * 페이징과 함께 TbTest 조회
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    options?: FindManyOptions<TbTest>
  ): Promise<{ data: TbTest[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.repository.findAndCount({
      ...options,
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  /**
   * TbTest 업데이트
   */
  async update(
    id: number,
    data: Partial<TbTest>,
    entityManager?: EntityManager
  ): Promise<TbTest | null> {
    const manager = entityManager || this.repository.manager;
    
    await manager.update(TbTest, { id: id } as FindOptionsWhere<TbTest>, data);
    
    return this.findById(id);
  }

  /**
   * TbTest 삭제
   */
  async delete(id: number, entityManager?: EntityManager): Promise<boolean> {
    const manager = entityManager || this.repository.manager;
    const result = await manager.delete(TbTest, { id: id } as FindOptionsWhere<TbTest>);
    
    return (result.affected || 0) > 0;
  }

  /**
   * TbTest 개수 조회
   */
  async count(where?: FindOptionsWhere<TbTest>): Promise<number> {
    return this.repository.count({ where });
  }

  /**
   * TbTest 존재 여부 확인
   */
  async exists(id: number): Promise<boolean> {
    const count = await this.repository.count({ 
      where: { id: id } as FindOptionsWhere<TbTest> 
    });
    return count > 0;
  }

  /**
   * name로 TbTest 검색
   */
  async searchByName(
    searchTerm: string,
    options?: FindManyOptions<TbTest>
  ): Promise<TbTest[]> {
    return this.repository
      .createQueryBuilder('entity')
      .where('entity.name LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .getMany();
  }
}
