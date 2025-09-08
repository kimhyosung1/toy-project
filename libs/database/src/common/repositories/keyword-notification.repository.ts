import { Injectable, Logger } from '@nestjs/common';
import { KeywordNotificationEntity } from '../entities/keyword-notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class KeywordNotificationRepository {
  private readonly logger = new Logger(KeywordNotificationRepository.name);

  constructor(
    @InjectRepository(KeywordNotificationEntity)
    private readonly repository: Repository<KeywordNotificationEntity>,
  ) {}

  async findAll(): Promise<KeywordNotificationEntity[]> {
    return this.repository.find();
  }

  async findAllKeywords(): Promise<KeywordNotificationEntity[]> {
    return this.repository.find();
  }

  async findMatchingKeywords(
    title: string,
    content: string,
    entityManager?: EntityManager,
  ): Promise<KeywordNotificationEntity[]> {
    try {
      const repo = entityManager
        ? entityManager.getRepository(KeywordNotificationEntity)
        : this.repository;

      /* comment:
       키워드가 제목/내용에 포함되는지 like 검색 -> "안녕" 관련 키워드 8만개 생성 후 테스트시 170ms 소요
       데이터 많아질시 속도 저하 발생 가능 다른 방법 고려 필요
      */
      const query = `
      SELECT 
        keyNotificationId,
        author as author,
        keyword as keyword,
        createdAt
      FROM tb_keyword_notification 
      WHERE 
        ? LIKE CONCAT('%', keyword, '%') OR  -- 제목에 키워드가 포함됨
        ? LIKE CONCAT('%', keyword, '%')      -- 내용에 키워드가 포함됨
    `;
      const result = await repo.query(query, [title, content]);

      const KeywordNotificationEntities = result.map((item) => {
        return {
          keyNotificationId: item.keyNotificationId,
          author: item.author,
          keyword: item.keyword,
          createdAt: item.createdAt,
        };
      });

      this.logger.debug(`매칭된 키워드 수: ${result.length}`);

      return KeywordNotificationEntities;
    } catch (error) {
      this.logger.error('키워드 매칭 검색 중 오류 발생', error);
      return [];
    }
  }
}
