import { Injectable } from '@nestjs/common';
import {
  DataSource,
  EntityManager,
  QueryRunner,
  Repository,
  EntityTarget,
} from 'typeorm';
import { BoardEntity, CommentEntity, TestEntity } from './entities';
import { plainToClass, ClassConstructor } from 'class-transformer';
import { validate } from 'class-validator';

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
  private entityClassCache = new Map<string, any>();

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
          try {
            return target.getRepositoryByName(prop);
          } catch (error) {
            // Proxy에서는 에러를 던지지 말고 undefined 반환
            console.error(`❌ ${error.message}`);
            return undefined;
          }
        }

        return target[prop as keyof DatabaseService];
      },
    });
  }

  /**
   * 이름으로 Repository 가져오기 (내부 메서드)
   */
  private getRepositoryByName(repositoryName: string): Repository<any> | null {
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
      console.error(
        `❌ Repository ${repositoryName} not found:`,
        error.message,
      );
      throw new Error(
        `Repository '${repositoryName}' not found. Available entities: ${this.getAvailableEntities().join(', ')}`,
      );
    }

    // 엔티티를 찾지 못한 경우 명확한 에러
    throw new Error(
      `Entity '${entityClassName}' not found. Available entities: ${this.getAvailableEntities().join(', ')}`,
    );
  }

  /**
   * 엔티티 클래스 동적 찾기 (캐시 적용으로 성능 개선)
   * DataSource에서 등록된 모든 엔티티를 가져와서 이름으로 매칭
   */
  private findEntityClass(entityClassName: string): any {
    // 캐시 확인
    if (this.entityClassCache.has(entityClassName)) {
      return this.entityClassCache.get(entityClassName);
    }

    // DataSource에서 등록된 모든 엔티티 메타데이터 가져오기
    const entityMetadatas = this.dataSource.entityMetadatas;

    // 엔티티 이름으로 찾기
    for (const metadata of entityMetadatas) {
      if (
        metadata.target &&
        (metadata.target as any).name === entityClassName
      ) {
        // 캐시에 저장
        this.entityClassCache.set(entityClassName, metadata.target);
        return metadata.target;
      }
    }

    // 캐시에 null도 저장 (반복 검색 방지)
    this.entityClassCache.set(entityClassName, null);
    return null;
  }

  /**
   * 사용 가능한 엔티티 목록 조회 (디버깅용)
   */
  private getAvailableEntities(): string[] {
    return this.dataSource.entityMetadatas
      .map((metadata) => (metadata.target as any)?.name)
      .filter((name) => name)
      .sort();
  }

  /**
   * 캐시 정리 (메모리 관리)
   */
  clearRepositoryCache(): void {
    this.repositoryCache.clear();
    this.entityClassCache.clear();
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
   * Raw SQL 쿼리 실행 (내부 사용 및 레거시 호환성)
   * 새로운 코드에서는 queryOneResult() 또는 queryManyResults() 사용을 권장합니다.
   */
  async query(sql: string, parameters?: any[]): Promise<any> {
    return this.dataSource.query(sql, parameters);
  }

  // =========================
  // 🔄 Raw SQL 쿼리 결과 변환 유틸리티
  // =========================

  /**
   * 객체인지 확인하는 유틸리티 함수
   */
  private isObject(value: any): boolean {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * 배열인지 확인하는 유틸리티 함수
   */
  private isArray(value: any): boolean {
    return Array.isArray(value);
  }

  /**
   * snake_case를 camelCase로 변환하는 함수
   */
  private toCamel(str: string): string {
    return str.replace(/([-_][a-z])/gi, ($1) => {
      return $1.toUpperCase().replace('-', '').replace('_', '');
    });
  }

  /**
   * 객체의 모든 키를 snake_case에서 camelCase로 변환
   */
  private columnToCamel(data: any[] | any): any {
    if (this.isObject(data)) {
      // Date 객체는 변환하지 않음
      if (data instanceof Date) {
        return data;
      }

      const converted = {};
      Object.keys(data).forEach((key) => {
        converted[this.toCamel(key)] = this.columnToCamel(data[key]);
      });
      return converted;
    } else if (this.isArray(data)) {
      return data.map((item) => this.columnToCamel(item));
    }

    return data;
  }

  /**
   * 반환 타입 검증 및 변환
   */
  private async validateReturnType<T extends object>(
    data: any,
    classConstructor: ClassConstructor<T>,
  ): Promise<T> {
    try {
      const instance = plainToClass(classConstructor, data);
      const errors = await validate(instance as object);

      if (errors.length > 0) {
        const errorMessages = errors
          .map((error) => Object.values(error.constraints || {}).join(', '))
          .join('; ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }

      return instance;
    } catch (error) {
      throw new Error(`Failed to validate return type: ${error.message}`);
    }
  }

  // =========================
  // 🚀 개선된 Raw SQL 쿼리 메서드들
  // =========================

  /**
   * Raw SQL 쿼리 실행 후 단일 결과 반환 (camelCase 변환)
   * @param query SQL 쿼리
   * @param parameters 쿼리 파라미터
   * @param classConstructor 반환 타입 클래스 (선택사항)
   * @returns 변환된 단일 객체 또는 null
   */
  protected async queryOne<T extends object>(
    query: string,
    parameters?: any[],
    classConstructor?: ClassConstructor<T>,
  ): Promise<T | null> {
    const results = await this.query(query, parameters);
    const result = (results || [])[0];

    if (!result) {
      return null;
    }

    const convertedResult = this.columnToCamel(result);

    if (!classConstructor) {
      return convertedResult;
    }

    return this.validateReturnType(convertedResult, classConstructor);
  }

  /**
   * Raw SQL 쿼리 실행 후 다중 결과 반환 (camelCase 변환)
   * @param query SQL 쿼리
   * @param parameters 쿼리 파라미터
   * @param classConstructor 반환 타입 클래스 (선택사항)
   * @returns 변환된 객체 배열
   */
  protected async queryMany<T extends object>(
    query: string,
    parameters?: any[],
    classConstructor?: ClassConstructor<T>,
  ): Promise<T[]> {
    const queryResult = this.columnToCamel(await this.query(query, parameters));

    if (!classConstructor) {
      return queryResult;
    }

    return Promise.all(
      queryResult.map((item) =>
        this.validateReturnType(item, classConstructor),
      ),
    );
  }

  // =========================
  // 🎯 Public API for Raw SQL with camelCase conversion
  // =========================

  /**
   * Raw SQL 쿼리 실행 후 단일 결과 반환 (Public API)
   * @param query SQL 쿼리
   * @param parameters 쿼리 파라미터
   * @param classConstructor 반환 타입 클래스 (선택사항)
   * @returns 변환된 단일 객체 또는 null
   */
  async queryOneResult<T extends object>(
    query: string,
    parameters?: any[],
    classConstructor?: ClassConstructor<T>,
  ): Promise<T | null> {
    return this.queryOne(query, parameters, classConstructor);
  }

  /**
   * Raw SQL 쿼리 실행 후 다중 결과 반환 (Public API)
   * @param query SQL 쿼리
   * @param parameters 쿼리 파라미터
   * @param classConstructor 반환 타입 클래스 (선택사항)
   * @returns 변환된 객체 배열
   */
  async queryManyResults<T extends object>(
    query: string,
    parameters?: any[],
    classConstructor?: ClassConstructor<T>,
  ): Promise<T[]> {
    return this.queryMany(query, parameters, classConstructor);
  }
}
