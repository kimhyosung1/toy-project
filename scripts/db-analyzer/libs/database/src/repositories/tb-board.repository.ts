import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { TbBoard } from '../entities/tb-board.entity';

/**
 * TbBoard 테이블 Repository
 * 
 * 🤖 자동 생성된 Repository 클래스
 * - 기본 CRUD 작업 지원
 * - 타입 안전성 보장
 * - 커스텀 쿼리 메서드 포함
 * 
 * @generated 2025-09-12T23:07:12.695Z
 */
@Injectable()
export class TbBoardRepository {
  constructor(
    @InjectRepository(TbBoard)
    private readonly repository: Repository<TbBoard>,
  ) {}

  /**
   * 새 TbBoard 생성
   */
  async create(data: Partial<TbBoard>, entityManager?: EntityManager): Promise<TbBoard> {
    const manager = entityManager || this.repository.manager;
    const entity = manager.create(TbBoard, data);
    return manager.save(entity);
  }

  /**
   * ID로 TbBoard 조회
   */
  async findById(id: number): Promise<TbBoard | null> {
    return this.repository.findOne({ where: { boardid: id } as FindOptionsWhere<TbBoard> });
  }

  /**
   * 모든 TbBoard 조회 (페이징 지원)
   */
  async findAll(options?: FindManyOptions<TbBoard>): Promise<TbBoard[]> {
    return this.repository.find(options);
  }

  /**
   * 페이징과 함께 TbBoard 조회
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    options?: FindManyOptions<TbBoard>
  ): Promise<{ data: TbBoard[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.repository.findAndCount({
      ...options,
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  /**
   * TbBoard 업데이트
   */
  async update(
    id: number,
    data: Partial<TbBoard>,
    entityManager?: EntityManager
  ): Promise<TbBoard | null> {
    const manager = entityManager || this.repository.manager;
    
    await manager.update(TbBoard, { boardid: id } as FindOptionsWhere<TbBoard>, data);
    
    return this.findById(id);
  }

  /**
   * TbBoard 삭제
   */
  async delete(id: number, entityManager?: EntityManager): Promise<boolean> {
    const manager = entityManager || this.repository.manager;
    const result = await manager.delete(TbBoard, { boardid: id } as FindOptionsWhere<TbBoard>);
    
    return (result.affected || 0) > 0;
  }

  /**
   * TbBoard 개수 조회
   */
  async count(where?: FindOptionsWhere<TbBoard>): Promise<number> {
    return this.repository.count({ where });
  }

  /**
   * TbBoard 존재 여부 확인
   */
  async exists(id: number): Promise<boolean> {
    const count = await this.repository.count({ 
      where: { boardid: id } as FindOptionsWhere<TbBoard> 
    });
    return count > 0;
  }

  /**
   * title로 TbBoard 검색
   */
  async searchByTitle(
    searchTerm: string,
    options?: FindManyOptions<TbBoard>
  ): Promise<TbBoard[]> {
    return this.repository
      .createQueryBuilder('entity')
      .where('entity.title LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .getMany();
  }

  /**
   * 날짜 범위로 TbBoard 조회
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    options?: FindManyOptions<TbBoard>
  ): Promise<TbBoard[]> {
    return this.repository
      .createQueryBuilder('entity')
      .where('entity.createdat BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();
  }
}
