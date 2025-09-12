import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { TbComment } from '../entities/tb-comment.entity';

/**
 * TbComment 테이블 Repository
 * 
 * 🤖 자동 생성된 Repository 클래스
 * - 기본 CRUD 작업 지원
 * - 타입 안전성 보장
 * - 커스텀 쿼리 메서드 포함
 * 
 * @generated 2025-09-12T23:07:12.697Z
 */
@Injectable()
export class TbCommentRepository {
  constructor(
    @InjectRepository(TbComment)
    private readonly repository: Repository<TbComment>,
  ) {}

  /**
   * 새 TbComment 생성
   */
  async create(data: Partial<TbComment>, entityManager?: EntityManager): Promise<TbComment> {
    const manager = entityManager || this.repository.manager;
    const entity = manager.create(TbComment, data);
    return manager.save(entity);
  }

  /**
   * ID로 TbComment 조회
   */
  async findById(id: number): Promise<TbComment | null> {
    return this.repository.findOne({ where: { commentid: id } as FindOptionsWhere<TbComment> });
  }

  /**
   * 모든 TbComment 조회 (페이징 지원)
   */
  async findAll(options?: FindManyOptions<TbComment>): Promise<TbComment[]> {
    return this.repository.find(options);
  }

  /**
   * 페이징과 함께 TbComment 조회
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    options?: FindManyOptions<TbComment>
  ): Promise<{ data: TbComment[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.repository.findAndCount({
      ...options,
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  /**
   * TbComment 업데이트
   */
  async update(
    id: number,
    data: Partial<TbComment>,
    entityManager?: EntityManager
  ): Promise<TbComment | null> {
    const manager = entityManager || this.repository.manager;
    
    await manager.update(TbComment, { commentid: id } as FindOptionsWhere<TbComment>, data);
    
    return this.findById(id);
  }

  /**
   * TbComment 삭제
   */
  async delete(id: number, entityManager?: EntityManager): Promise<boolean> {
    const manager = entityManager || this.repository.manager;
    const result = await manager.delete(TbComment, { commentid: id } as FindOptionsWhere<TbComment>);
    
    return (result.affected || 0) > 0;
  }

  /**
   * TbComment 개수 조회
   */
  async count(where?: FindOptionsWhere<TbComment>): Promise<number> {
    return this.repository.count({ where });
  }

  /**
   * TbComment 존재 여부 확인
   */
  async exists(id: number): Promise<boolean> {
    const count = await this.repository.count({ 
      where: { commentid: id } as FindOptionsWhere<TbComment> 
    });
    return count > 0;
  }

  /**
   * content로 TbComment 검색
   */
  async searchByContent(
    searchTerm: string,
    options?: FindManyOptions<TbComment>
  ): Promise<TbComment[]> {
    return this.repository
      .createQueryBuilder('entity')
      .where('entity.content LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .getMany();
  }

  /**
   * 날짜 범위로 TbComment 조회
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    options?: FindManyOptions<TbComment>
  ): Promise<TbComment[]> {
    return this.repository
      .createQueryBuilder('entity')
      .where('entity.createdat BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();
  }

  /**
   * tb_board ID로 TbComment 조회
   */
  async findByTbBoardId(
    tbBoardId: number,
    options?: FindManyOptions<TbComment>
  ): Promise<TbComment[]> {
    return this.repository.find({
      ...options,
      where: {
        ...options?.where,
        boardId: tbBoardId,
      } as FindOptionsWhere<TbComment>,
    });
  }

  /**
   * tb_comment ID로 TbComment 조회
   */
  async findByTbCommentId(
    tbCommentId: number,
    options?: FindManyOptions<TbComment>
  ): Promise<TbComment[]> {
    return this.repository.find({
      ...options,
      where: {
        ...options?.where,
        parentId: tbCommentId,
      } as FindOptionsWhere<TbComment>,
    });
  }
}
