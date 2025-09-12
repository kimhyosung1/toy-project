import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { TbNotification } from '../entities/tb-notification.entity';

/**
 * TbNotification 테이블 Repository
 * 
 * 🤖 자동 생성된 Repository 클래스
 * - 기본 CRUD 작업 지원
 * - 타입 안전성 보장
 * - 커스텀 쿼리 메서드 포함
 * 
 * @generated 2025-09-12T23:07:12.698Z
 */
@Injectable()
export class TbNotificationRepository {
  constructor(
    @InjectRepository(TbNotification)
    private readonly repository: Repository<TbNotification>,
  ) {}

  /**
   * 새 TbNotification 생성
   */
  async create(data: Partial<TbNotification>, entityManager?: EntityManager): Promise<TbNotification> {
    const manager = entityManager || this.repository.manager;
    const entity = manager.create(TbNotification, data);
    return manager.save(entity);
  }

  /**
   * ID로 TbNotification 조회
   */
  async findById(id: number): Promise<TbNotification | null> {
    return this.repository.findOne({ where: { id: id } as FindOptionsWhere<TbNotification> });
  }

  /**
   * 모든 TbNotification 조회 (페이징 지원)
   */
  async findAll(options?: FindManyOptions<TbNotification>): Promise<TbNotification[]> {
    return this.repository.find(options);
  }

  /**
   * 페이징과 함께 TbNotification 조회
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    options?: FindManyOptions<TbNotification>
  ): Promise<{ data: TbNotification[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.repository.findAndCount({
      ...options,
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  /**
   * TbNotification 업데이트
   */
  async update(
    id: number,
    data: Partial<TbNotification>,
    entityManager?: EntityManager
  ): Promise<TbNotification | null> {
    const manager = entityManager || this.repository.manager;
    
    await manager.update(TbNotification, { id: id } as FindOptionsWhere<TbNotification>, data);
    
    return this.findById(id);
  }

  /**
   * TbNotification 삭제
   */
  async delete(id: number, entityManager?: EntityManager): Promise<boolean> {
    const manager = entityManager || this.repository.manager;
    const result = await manager.delete(TbNotification, { id: id } as FindOptionsWhere<TbNotification>);
    
    return (result.affected || 0) > 0;
  }

  /**
   * TbNotification 개수 조회
   */
  async count(where?: FindOptionsWhere<TbNotification>): Promise<number> {
    return this.repository.count({ where });
  }

  /**
   * TbNotification 존재 여부 확인
   */
  async exists(id: number): Promise<boolean> {
    const count = await this.repository.count({ 
      where: { id: id } as FindOptionsWhere<TbNotification> 
    });
    return count > 0;
  }

  /**
   * title로 TbNotification 검색
   */
  async searchByTitle(
    searchTerm: string,
    options?: FindManyOptions<TbNotification>
  ): Promise<TbNotification[]> {
    return this.repository
      .createQueryBuilder('entity')
      .where('entity.title LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .getMany();
  }

  /**
   * 날짜 범위로 TbNotification 조회
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    options?: FindManyOptions<TbNotification>
  ): Promise<TbNotification[]> {
    return this.repository
      .createQueryBuilder('entity')
      .where('entity.createdat BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();
  }
}
