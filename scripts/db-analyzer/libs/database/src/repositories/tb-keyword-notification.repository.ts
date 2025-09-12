import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { TbKeywordNotification } from '../entities/tb-keyword-notification.entity';

/**
 * TbKeywordNotification 테이블 Repository
 * 
 * 🤖 자동 생성된 Repository 클래스
 * - 기본 CRUD 작업 지원
 * - 타입 안전성 보장
 * - 커스텀 쿼리 메서드 포함
 * 
 * @generated 2025-09-12T23:07:12.698Z
 */
@Injectable()
export class TbKeywordNotificationRepository {
  constructor(
    @InjectRepository(TbKeywordNotification)
    private readonly repository: Repository<TbKeywordNotification>,
  ) {}

  /**
   * 새 TbKeywordNotification 생성
   */
  async create(data: Partial<TbKeywordNotification>, entityManager?: EntityManager): Promise<TbKeywordNotification> {
    const manager = entityManager || this.repository.manager;
    const entity = manager.create(TbKeywordNotification, data);
    return manager.save(entity);
  }

  /**
   * ID로 TbKeywordNotification 조회
   */
  async findById(id: number): Promise<TbKeywordNotification | null> {
    return this.repository.findOne({ where: { keynotificationid: id } as FindOptionsWhere<TbKeywordNotification> });
  }

  /**
   * 모든 TbKeywordNotification 조회 (페이징 지원)
   */
  async findAll(options?: FindManyOptions<TbKeywordNotification>): Promise<TbKeywordNotification[]> {
    return this.repository.find(options);
  }

  /**
   * 페이징과 함께 TbKeywordNotification 조회
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    options?: FindManyOptions<TbKeywordNotification>
  ): Promise<{ data: TbKeywordNotification[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.repository.findAndCount({
      ...options,
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  /**
   * TbKeywordNotification 업데이트
   */
  async update(
    id: number,
    data: Partial<TbKeywordNotification>,
    entityManager?: EntityManager
  ): Promise<TbKeywordNotification | null> {
    const manager = entityManager || this.repository.manager;
    
    await manager.update(TbKeywordNotification, { keynotificationid: id } as FindOptionsWhere<TbKeywordNotification>, data);
    
    return this.findById(id);
  }

  /**
   * TbKeywordNotification 삭제
   */
  async delete(id: number, entityManager?: EntityManager): Promise<boolean> {
    const manager = entityManager || this.repository.manager;
    const result = await manager.delete(TbKeywordNotification, { keynotificationid: id } as FindOptionsWhere<TbKeywordNotification>);
    
    return (result.affected || 0) > 0;
  }

  /**
   * TbKeywordNotification 개수 조회
   */
  async count(where?: FindOptionsWhere<TbKeywordNotification>): Promise<number> {
    return this.repository.count({ where });
  }

  /**
   * TbKeywordNotification 존재 여부 확인
   */
  async exists(id: number): Promise<boolean> {
    const count = await this.repository.count({ 
      where: { keynotificationid: id } as FindOptionsWhere<TbKeywordNotification> 
    });
    return count > 0;
  }

  /**
   * author로 TbKeywordNotification 검색
   */
  async searchByAuthor(
    searchTerm: string,
    options?: FindManyOptions<TbKeywordNotification>
  ): Promise<TbKeywordNotification[]> {
    return this.repository
      .createQueryBuilder('entity')
      .where('entity.author LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .getMany();
  }

  /**
   * 날짜 범위로 TbKeywordNotification 조회
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    options?: FindManyOptions<TbKeywordNotification>
  ): Promise<TbKeywordNotification[]> {
    return this.repository
      .createQueryBuilder('entity')
      .where('entity.createdat BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();
  }
}
