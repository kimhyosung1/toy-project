import { Injectable } from '@nestjs/common';
import {
  DataSource,
  EntityManager,
  QueryRunner,
  Repository,
  EntityTarget,
} from 'typeorm';
import { BoardEntity, CommentEntity, TestEntity } from './entities';

/**
 * 데이터베이스 트랜잭션 및 Repository 접근을 위한 서비스
 *
 * 🚀 새로운 기능:
 * - 동적 Repository 접근: getRepository() 메서드 사용
 * - 자주 사용하는 Repository들은 편의를 위해 직접 접근 가능
 * - 새 엔티티 추가 시 코드 수정 불필요!
 */
@Injectable()
export class DatabaseService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * 동적으로 Repository 가져오기 (새 엔티티 추가 시 코드 수정 불필요!)
   *
   * @example
   * const userRepo = this.getRepository(UserEntity);
   * const users = await userRepo.find();
   */
  getRepository<Entity>(entityClass: EntityTarget<Entity>): Repository<Entity> {
    return this.dataSource.getRepository(entityClass);
  }

  // Proxy를 이용한 자동 Repository 접근 🚀
  // 이제 databaseService.boardRepository, databaseService.userRepository 등이 자동으로 동작!
  private repositoryCache = new Map<string, Repository<any>>();

  /**
   * Proxy를 통한 자동 Repository 접근
   *
   * 사용법:
   * - this.databaseService.boardRepository (자동 생성!)
   * - this.databaseService.userRepository (자동 생성!)
   * - this.databaseService.anyEntityRepository (자동 생성!)
   */
  static createProxy(databaseService: DatabaseService): DatabaseService {
    return new Proxy(databaseService, {
      get(target, prop: string) {
        // 기존 메서드/속성이면 그대로 반환
        if (prop in target || typeof prop === 'symbol') {
          return target[prop as keyof DatabaseService];
        }

        // Repository 패턴 체크 (xxxRepository 형태)
        if (prop.endsWith('Repository')) {
          return target.getRepositoryByName(prop);
        }

        return target[prop as keyof DatabaseService];
      },
    });
  }

  /**
   * 이름으로 Repository 가져오기 (내부 메서드)
   */
  private getRepositoryByName(repositoryName: string): Repository<any> {
    // 캐시 확인
    if (this.repositoryCache.has(repositoryName)) {
      return this.repositoryCache.get(repositoryName)!;
    }

    // 엔티티 이름 추출 (boardRepository -> board -> BoardEntity)
    const entityName = repositoryName.replace('Repository', '');
    const entityClassName =
      entityName.charAt(0).toUpperCase() + entityName.slice(1) + 'Entity';

    try {
      // 동적으로 엔티티 클래스 찾기
      const entityClass = this.findEntityClass(entityClassName);
      if (entityClass) {
        const repository = this.getRepository(entityClass);
        this.repositoryCache.set(repositoryName, repository);
        return repository;
      }
    } catch (error) {
      console.warn(`Repository ${repositoryName} not found:`, error.message);
    }

    // 못 찾으면 undefined 반환
    return undefined as any;
  }

  /**
   * 엔티티 클래스 동적 찾기 (완전 자동화!)
   * DataSource에서 등록된 모든 엔티티를 가져와서 이름으로 매칭
   */
  private findEntityClass(entityClassName: string): any {
    // DataSource에서 등록된 모든 엔티티 메타데이터 가져오기
    const entityMetadatas = this.dataSource.entityMetadatas;

    // 엔티티 이름으로 찾기
    for (const metadata of entityMetadatas) {
      if (
        metadata.target &&
        (metadata.target as any).name === entityClassName
      ) {
        return metadata.target;
      }
    }

    return null;
  }

  /**
   트랜잭션을 실행하는 함수
   트랜잭션 내에서 실행할 콜백 함수
   콜백 함수의 반환값
   */
  async runTransaction<T>(
    callback: (entityManager: EntityManager) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await callback(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   트랜잭션 QueryRunner를 생성하고 시작하는 함수
   트랜잭션이 시작된 QueryRunner
   */
  async startTransaction(): Promise<QueryRunner> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    return queryRunner;
  }

  /**
   트랜잭션을 커밋하고 QueryRunner를 해제하는 함수
   트랜잭션을 처리중인 QueryRunner
   */
  async commitTransaction(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.commitTransaction();
    await queryRunner.release();
  }

  /**
   트랜잭션을 롤백하고 QueryRunner를 해제하는 함수
   @param queryRunner 트랜잭션을 처리중인 QueryRunner
   */
  async rollbackTransaction(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  }

  /**
   * Raw SQL 쿼리 실행
   */
  async query(sql: string, parameters?: any[]): Promise<any> {
    return this.dataSource.query(sql, parameters);
  }
}
