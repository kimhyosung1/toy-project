import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';

//  데이터베이스 트랜잭션 처리를 위한 서비스
@Injectable()
export class DatabaseService {
  constructor(private readonly dataSource: DataSource) {}

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
}
