#!/usr/bin/env ts-node

import * as fs from 'fs/promises';
import * as path from 'path';
import { SchemaAnalysisResult, TableInfo } from './enhanced-schema-analyzer';

/**
 * 🔧 Enhanced Repository Generator - 기본 CRUD 메서드 포함 Repository 자동 생성
 *
 * 📋 핵심 기능:
 * - Repository 클래스 자동 생성 (NestJS + TypeORM 패턴)
 * - 기본 CRUD 메서드 포함 (create, findById, update, delete 등)
 * - 커스텀 쿼리 메서드 생성 (검색, 페이징, 정렬)
 * - 타입 안전성 보장 (Generic Repository<Entity> 패턴)
 * - 백업 및 롤백 기능 (안전한 코드 생성)
 *
 * 🔄 생성 원리:
 * - 기존 Repository 있으면 건너뛰기 (수동 코드 보존)
 * - 새 테이블에 대해서만 Repository 생성
 * - Entity 기반 타입 안전성 보장
 * - 환경별 설정 지원
 */

interface RepositoryGenerationOptions {
  outputDir: string;
  backup: boolean;
  overwrite: boolean;
  includeComments: boolean;
  generateBasicMethods: boolean;
  generateCustomMethods: boolean;
}

interface RepositoryMethodInfo {
  name: string;
  returnType: string;
  parameters: string;
  implementation: string;
  comment?: string;
}

class EnhancedRepositoryGenerator {
  private options: RepositoryGenerationOptions;
  private schemaResult: SchemaAnalysisResult;
  private generatedFiles: string[] = [];
  private backupDir?: string;

  constructor(
    schemaResult: SchemaAnalysisResult,
    options: RepositoryGenerationOptions,
  ) {
    this.schemaResult = schemaResult;
    this.options = options;
  }

  /**
   * Repository 생성 실행 - 전체 Repository 파일 생성 프로세스
   *
   * 🔄 실행 순서:
   * 1. 백업 생성: 기존 Repository 파일들 백업
   * 2. 출력 디렉토리 준비: repositories/ 디렉토리 설정
   * 3. Repository 파일 생성: 각 테이블별 Repository 생성
   * 4. index.ts 업데이트: 모든 Repository export 및 ALL_REPOSITORIES 배열
   *
   * ⚠️ 에러 시 롤백: 백업에서 자동 복원
   */
  async generateRepositories(): Promise<void> {
    try {
      console.log('🔧 Starting enhanced repository generation...');

      // 백업 생성
      if (this.options.backup) {
        await this.createBackup();
      }

      // 출력 디렉토리 준비
      await this.prepareOutputDirectory();

      // Repository 파일들 생성
      for (const table of this.schemaResult.tables) {
        await this.generateRepositoryFile(table);
      }

      // index.ts 파일 업데이트
      await this.updateIndexFile();

      console.log(
        `✅ Successfully generated ${this.generatedFiles.length} repository files`,
      );
      console.log('📋 Generated files:');
      this.generatedFiles.forEach((file) => console.log(`   - ${file}`));
    } catch (error) {
      console.error('❌ Repository generation failed:', error);

      // 롤백 실행
      if (this.options.backup && this.backupDir) {
        await this.rollback();
      }

      throw error;
    }
  }

  /**
   * 백업 생성
   */
  private async createBackup(): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.backupDir = path.join(
      this.options.outputDir,
      `../.backup-repositories-${timestamp}`,
    );

    try {
      const repositoriesDir = this.options.outputDir;
      const exists = await fs
        .access(repositoriesDir)
        .then(() => true)
        .catch(() => false);

      if (exists) {
        await fs.mkdir(this.backupDir, { recursive: true });
        await this.copyDirectory(repositoriesDir, this.backupDir);
        console.log(`📦 Repository backup created: ${this.backupDir}`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to create repository backup:', error);
    }
  }

  /**
   * 디렉토리 복사
   */
  private async copyDirectory(src: string, dest: string): Promise<void> {
    const entries = await fs.readdir(src, { withFileTypes: true });

    await fs.mkdir(dest, { recursive: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * 출력 디렉토리 준비
   */
  private async prepareOutputDirectory(): Promise<void> {
    await fs.mkdir(this.options.outputDir, { recursive: true });

    // 기존 파일 정리 (overwrite 옵션이 true인 경우)
    if (this.options.overwrite) {
      const files = await fs.readdir(this.options.outputDir);
      const repositoryFiles = files.filter(
        (file) => file.endsWith('.repository.ts') && file !== 'index.ts',
      );

      for (const file of repositoryFiles) {
        await fs.unlink(path.join(this.options.outputDir, file));
        console.log(`🗑️ Removed existing repository file: ${file}`);
      }
    }
  }

  /**
   * 개별 Repository 파일 생성 - 기존 Repository 중복 방지 로직 포함
   *
   * 🔍 중복 방지 로직:
   * 1. 같은 테이블을 처리하는 기존 Repository 검색
   * 2. Entity import 경로를 통한 테이블 매핑 확인
   * 3. 기존 Repository 있으면 생성 건너뛰기
   * 4. 새 테이블에 대해서만 Repository 생성
   *
   * 💡 목적: 수동 작성된 Repository 보존 및 중복 방지
   */
  private async generateRepositoryFile(table: TableInfo): Promise<void> {
    const repositoryName = this.toPascalCase(table.tableName) + 'Repository';
    const fileName = `${this.toKebabCase(table.tableName)}.repository.ts`;
    const filePath = path.join(this.options.outputDir, fileName);

    // 같은 테이블을 다루는 기존 Repository 파일이 있는지 확인
    const existingRepository = await this.findExistingRepositoryForTable(
      table.tableName,
    );
    if (existingRepository) {
      console.log(
        `   ⚠️ Skipping ${repositoryName} -> ${fileName} (existing repository found: ${existingRepository})`,
      );
      return;
    }

    console.log(`   🔧 Generating ${repositoryName} -> ${fileName}`);

    const repositoryContent = this.generateRepositoryContent(table);

    await fs.writeFile(filePath, repositoryContent, 'utf-8');
    this.generatedFiles.push(fileName);
  }

  /**
   * 같은 테이블을 다루는 기존 Repository 파일 찾기 - 지능형 중복 감지
   *
   * 🔍 감지 방법:
   * 1. Repository 파일에서 Entity import 경로 추출
   * 2. Entity 파일에서 @Entity 데코레이터의 테이블명 확인
   * 3. 파일명 기반 테이블명 추정 (board.repository.ts → tb_board)
   * 4. 직접 Repository 파일에서 @Entity 데코레이터 확인
   *
   * 💡 다단계 검증으로 정확한 중복 감지
   */
  private async findExistingRepositoryForTable(
    tableName: string,
  ): Promise<string | null> {
    try {
      const files = await fs.readdir(this.options.outputDir);
      const repositoryFiles = files.filter((file) =>
        file.endsWith('.repository.ts'),
      );

      for (const file of repositoryFiles) {
        const filePath = path.join(this.options.outputDir, file);
        try {
          const content = await fs.readFile(filePath, 'utf-8');

          // Repository 파일에서 import하는 Entity 파일 찾기
          const importMatch = content.match(
            /from ['"`]\.\.\/entities\/([^'"`]+)\.entity['"`]/,
          );
          if (importMatch) {
            const entityFileName = importMatch[1];
            const entityFilePath = path.join(
              this.options.outputDir,
              '../entities',
              `${entityFileName}.entity.ts`,
            );

            try {
              // Entity 파일 읽어서 @Entity 데코레이터 확인
              const entityContent = await fs.readFile(entityFilePath, 'utf-8');
              const entityMatch = entityContent.match(
                /@Entity\(['"`]([^'"`]+)['"`]\)/,
              );
              if (entityMatch && entityMatch[1] === tableName) {
                return file;
              }
            } catch (entityError) {
              // Entity 파일이 없으면 파일명으로 추정
              const inferredTableName = entityFileName.replace(/-/g, '_');
              if (inferredTableName === tableName) {
                return file;
              }
            }
          }

          // Repository 파일명에서 테이블명 추정 (예: board.repository.ts -> tb_board)
          const repoFileName = file.replace('.repository.ts', '');
          const possibleTableNames = [
            repoFileName, // board
            `tb_${repoFileName}`, // tb_board
            repoFileName.replace(/-/g, '_'), // board -> board (이미 snake_case인 경우)
            `tb_${repoFileName.replace(/-/g, '_')}`, // board -> tb_board
          ];

          if (possibleTableNames.includes(tableName)) {
            return file;
          }

          // 직접 Repository 파일에서 @Entity 데코레이터 확인 (inline entity 정의인 경우)
          const directEntityMatch = content.match(
            /@Entity\(['"`]([^'"`]+)['"`]\)/,
          );
          if (directEntityMatch && directEntityMatch[1] === tableName) {
            return file;
          }
        } catch (error) {
          // 파일 읽기 실패시 건너뛰기
          continue;
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Repository 클래스 내용 생성 - 완전한 NestJS Repository 클래스 코드 생성
   *
   * 🏗️ 생성 구성요소:
   * 1. Import 문: NestJS, TypeORM, Entity import
   * 2. 클래스 코멘트: 자동 생성 정보 포함
   * 3. @Injectable 데코레이터: NestJS DI 지원
   * 4. Constructor: @InjectRepository 를 통한 DI
   * 5. 메서드들: CRUD 및 커스텀 메서드
   *
   * 💡 타입 안전성: Generic Repository<Entity> 패턴 사용
   */
  private generateRepositoryContent(table: TableInfo): string {
    const entityName = this.toPascalCase(table.tableName) + 'Entity';
    const repositoryName = this.toPascalCase(table.tableName) + 'Repository';
    const imports = this.generateImports(table);
    const classComment = this.generateClassComment(table);
    const constructor = this.generateConstructor(table);
    const methods = this.generateMethods(table);

    return `${imports}

${classComment}
@Injectable()
export class ${repositoryName} {
${constructor}

${methods}
}
`;
  }

  /**
   * Import 문 생성
   */
  private generateImports(table: TableInfo): string {
    const entityName = this.toPascalCase(table.tableName) + 'Entity';
    const entityFileName = this.toKebabCase(table.tableName);

    return `import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { ${entityName} } from '../entities/${entityFileName}.entity';`;
  }

  /**
   * 클래스 코멘트 생성
   */
  private generateClassComment(table: TableInfo): string {
    if (!this.options.includeComments) return '';

    const entityName = this.toPascalCase(table.tableName);
    const comment = table.tableComment || `${entityName} 테이블 Repository`;

    return `/**
 * ${comment}
 * 
 * 🤖 자동 생성된 Repository 클래스
 * - 기본 CRUD 작업 지원
 * - 타입 안전성 보장
 * - 커스텀 쿼리 메서드 포함
 * 
 * @generated ${new Date().toISOString()}
 */`;
  }

  /**
   * Constructor 생성
   */
  private generateConstructor(table: TableInfo): string {
    const entityName = this.toPascalCase(table.tableName) + 'Entity';

    return `  constructor(
    @InjectRepository(${entityName})
    private readonly repository: Repository<${entityName}>,
  ) {}`;
  }

  /**
   * 메서드들 생성
   */
  private generateMethods(table: TableInfo): string {
    const methods: string[] = [];

    // 기본 CRUD 메서드
    if (this.options.generateBasicMethods) {
      methods.push(...this.generateBasicMethods(table));
    }

    // 커스텀 메서드
    if (this.options.generateCustomMethods) {
      methods.push(...this.generateCustomMethods(table));
    }

    return methods.join('\n\n');
  }

  /**
   * 기본 CRUD 메서드 생성 - 표준 데이터베이스 작업 메서드 생성
   *
   * 🛠️ 생성 메서드:
   * 1. create: 새 레코드 생성 (EntityManager 지원)
   * 2. findById: Primary Key로 레코드 조회
   * 3. findAll: 전체 레코드 조회 (옵션 지원)
   * 4. findWithPagination: 페이징 지원 조회
   * 5. update: 레코드 업데이트 (EntityManager 지원)
   * 6. delete: 레코드 삭제 (EntityManager 지원)
   * 7. count: 레코드 개수 조회
   * 8. exists: 레코드 존재 여부 확인
   *
   * 💡 EntityManager 지원: 트랜잭션 내에서 사용 가능
   */
  private generateBasicMethods(table: TableInfo): string[] {
    const entityName = this.toPascalCase(table.tableName);
    const primaryKey = table.columns.find((col) => col.isPrimaryKey);
    const pkType = primaryKey
      ? this.getTypeScriptType(primaryKey.dataType)
      : 'number';

    const methods: string[] = [];

    // Create 메서드
    methods.push(`  /**
   * 새 ${entityName} 생성
   */
  async create(data: Partial<${entityName}>, entityManager?: EntityManager): Promise<${entityName}> {
    const manager = entityManager || this.repository.manager;
    const entity = manager.create(${entityName}, data);
    return manager.save(entity);
  }`);

    // FindById 메서드
    if (primaryKey) {
      methods.push(`  /**
   * ID로 ${entityName} 조회
   */
  async findById(id: ${pkType}): Promise<${entityName} | null> {
    return this.repository.findOne({ where: { ${this.toCamelCase(primaryKey.columnName)}: id } as FindOptionsWhere<${entityName}> });
  }`);
    }

    // FindAll 메서드
    methods.push(`  /**
   * 모든 ${entityName} 조회 (페이징 지원)
   */
  async findAll(options?: FindManyOptions<${entityName}>): Promise<${entityName}[]> {
    return this.repository.find(options);
  }`);

    // FindWithPagination 메서드
    methods.push(`  /**
   * 페이징과 함께 ${entityName} 조회
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    options?: FindManyOptions<${entityName}>
  ): Promise<{ data: ${entityName}[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.repository.findAndCount({
      ...options,
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }`);

    // Update 메서드
    if (primaryKey) {
      methods.push(`  /**
   * ${entityName} 업데이트
   */
  async update(
    id: ${pkType},
    data: Partial<${entityName}>,
    entityManager?: EntityManager
  ): Promise<${entityName} | null> {
    const manager = entityManager || this.repository.manager;
    
    await manager.update(${entityName}, { ${this.toCamelCase(primaryKey.columnName)}: id } as FindOptionsWhere<${entityName}>, data);
    
    return this.findById(id);
  }`);
    }

    // Delete 메서드
    if (primaryKey) {
      methods.push(`  /**
   * ${entityName} 삭제
   */
  async delete(id: ${pkType}, entityManager?: EntityManager): Promise<boolean> {
    const manager = entityManager || this.repository.manager;
    const result = await manager.delete(${entityName}, { ${this.toCamelCase(primaryKey.columnName)}: id } as FindOptionsWhere<${entityName}>);
    
    return (result.affected || 0) > 0;
  }`);
    }

    // Count 메서드
    methods.push(`  /**
   * ${entityName} 개수 조회
   */
  async count(where?: FindOptionsWhere<${entityName}>): Promise<number> {
    return this.repository.count({ where });
  }`);

    // Exists 메서드
    if (primaryKey) {
      methods.push(`  /**
   * ${entityName} 존재 여부 확인
   */
  async exists(id: ${pkType}): Promise<boolean> {
    const count = await this.repository.count({ 
      where: { ${this.toCamelCase(primaryKey.columnName)}: id } as FindOptionsWhere<${entityName}> 
    });
    return count > 0;
  }`);
    }

    return methods;
  }

  /**
   * 커스텀 메서드 생성 - 비즈니스 로직에 특화된 메서드 생성
   *
   * 🔍 생성 메서드 종류:
   * 1. 텍스트 검색: searchBy{Column} - LIKE 검색 지원
   * 2. 날짜 범위 검색: findByDateRange - BETWEEN 조건
   * 3. 외래키 기반 조회: findBy{ReferencedTable}Id
   * 4. Soft Delete: softDelete, findActive (삭제 날짜 컬럼 있을 때)
   *
   * 💡 자동 감지:
   * - 검색 가능 컬럼: varchar, text 등 텍스트 타입
   * - 날짜 컬럼: date, datetime, timestamp 타입
   * - 외래키 관계: foreignKeys 정보 기반
   */
  private generateCustomMethods(table: TableInfo): string[] {
    const methods: string[] = [];
    const entityName = this.toPascalCase(table.tableName);

    // 검색 가능한 텍스트 컬럼 찾기
    const searchableColumns = table.columns.filter((col) =>
      [
        'varchar',
        'char',
        'text',
        'tinytext',
        'mediumtext',
        'longtext',
      ].includes(col.dataType.toLowerCase()),
    );

    if (searchableColumns.length > 0) {
      const searchColumn = searchableColumns[0]; // 첫 번째 텍스트 컬럼 사용
      const propertyName = this.toCamelCase(searchColumn.columnName);

      methods.push(`  /**
   * ${searchColumn.columnName}로 ${entityName} 검색
   */
  async searchBy${this.toPascalCase(searchColumn.columnName)}(
    searchTerm: string,
    options?: FindManyOptions<${entityName}>
  ): Promise<${entityName}[]> {
    return this.repository
      .createQueryBuilder('entity')
      .where('entity.${propertyName} LIKE :searchTerm', { searchTerm: \`%\${searchTerm}%\` })
      .getMany();
  }`);
    }

    // 날짜 범위 검색 메서드 (created_at, updated_at 등이 있는 경우)
    const dateColumns = table.columns.filter((col) =>
      ['date', 'datetime', 'timestamp'].includes(col.dataType.toLowerCase()),
    );

    if (dateColumns.length > 0) {
      const dateColumn =
        dateColumns.find((col) =>
          col.columnName.toLowerCase().includes('created'),
        ) || dateColumns[0];

      const propertyName = this.toCamelCase(dateColumn.columnName);

      methods.push(`  /**
   * 날짜 범위로 ${entityName} 조회
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    options?: FindManyOptions<${entityName}>
  ): Promise<${entityName}[]> {
    return this.repository
      .createQueryBuilder('entity')
      .where('entity.${propertyName} BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();
  }`);
    }

    // 외래키 기반 조회 메서드
    table.foreignKeys.forEach((fk) => {
      const propertyName = this.toCamelCase(fk.columnName);
      const referencedEntity = this.toPascalCase(fk.referencedTableName);
      const referencedColumn = fk.referencedColumnName;
      const referencedType =
        this.getTypeScriptTypeFromColumnName(referencedColumn);

      methods.push(`  /**
   * ${fk.referencedTableName} ID로 ${entityName} 조회
   */
  async findBy${this.toPascalCase(fk.referencedTableName)}Id(
    ${this.toCamelCase(fk.referencedTableName)}Id: ${referencedType},
    options?: FindManyOptions<${entityName}>
  ): Promise<${entityName}[]> {
    return this.repository.find({
      ...options,
      where: {
        ...options?.where,
        ${propertyName}: ${this.toCamelCase(fk.referencedTableName)}Id,
      } as FindOptionsWhere<${entityName}>,
    });
  }`);
    });

    // Soft Delete 지원 (deleted_at 컬럼이 있는 경우)
    const deletedAtColumn = table.columns.find(
      (col) =>
        col.columnName.toLowerCase().includes('deleted') &&
        ['date', 'datetime', 'timestamp'].includes(col.dataType.toLowerCase()),
    );

    if (deletedAtColumn) {
      const propertyName = this.toCamelCase(deletedAtColumn.columnName);

      methods.push(`  /**
   * ${entityName} 소프트 삭제
   */
  async softDelete(id: number, entityManager?: EntityManager): Promise<boolean> {
    const manager = entityManager || this.repository.manager;
    const result = await manager.update(${entityName}, { id } as FindOptionsWhere<${entityName}>, {
      ${propertyName}: new Date(),
    });
    
    return (result.affected || 0) > 0;
  }`);

      methods.push(`  /**
   * 삭제되지 않은 ${entityName} 조회
   */
  async findActive(options?: FindManyOptions<${entityName}>): Promise<${entityName}[]> {
    return this.repository.find({
      ...options,
      where: {
        ...options?.where,
        ${propertyName}: null,
      } as FindOptionsWhere<${entityName}>,
    });
  }`);
    }

    return methods;
  }

  /**
   * index.ts 파일 업데이트 - 모든 Repository 자동 export 및 ALL_REPOSITORIES 배열 생성
   *
   * 📦 생성 내용:
   * 1. 개별 Repository export: export * from './table-name.repository'
   * 2. Repository import: ALL_REPOSITORIES 배열용 import 문
   * 3. ALL_REPOSITORIES 배열: NestJS 모듈에서 사용할 모든 Repository 배열
   * 4. @deprecated Repository 처리: export는 하지만 배열에서 제외
   * 5. 메타데이터: 환경, 테이블 수 등 정보
   *
   * 💡 자동화 목적: 새 Repository 추가 시 수동 import 불필요
   */
  private async updateIndexFile(): Promise<void> {
    const indexPath = path.join(this.options.outputDir, 'index.ts');

    // 실제로 존재하는 모든 Repository 파일들 스캔
    const existingRepositories = [];
    const existingExports = [];
    const existingImports = [];

    try {
      const files = await fs.readdir(this.options.outputDir);
      const repositoryFiles = files.filter(
        (file) => file.endsWith('.repository.ts') && file !== 'index.ts',
      );

      for (const file of repositoryFiles) {
        const filePath = path.join(this.options.outputDir, file);

        try {
          // 파일 내용을 읽어서 Repository 클래스명 추출
          const content = await fs.readFile(filePath, 'utf-8');
          const classMatch = content.match(/export class (\w+Repository)/);

          if (classMatch) {
            const repositoryName = classMatch[1];
            const exportName = file.replace('.repository.ts', '');

            // 모든 Repository는 export하지만, deprecated가 아닌 것만 ALL_REPOSITORIES에 포함
            existingExports.push(`export * from './${exportName}.repository';`);

            const isDeprecated = content.includes('@deprecated');
            if (!isDeprecated) {
              existingRepositories.push(repositoryName);
              existingImports.push(
                `import { ${repositoryName} } from './${exportName}.repository';`,
              );
            }
          }
        } catch (error) {
          console.warn(`⚠️ Failed to process ${file}:`, error.message);
          continue;
        }
      }
    } catch (error) {
      console.error('❌ Failed to scan repository directory:', error);
    }

    const exports = existingExports.sort();
    const repositoryNames = existingRepositories.sort();
    const imports = existingImports.join('\n');

    const content = `// 🤖 Auto-generated repository exports
// Environment: ${this.schemaResult.database.environment}
// Tables: ${this.schemaResult.tables.length}

${exports.join('\n')}

// 🚀 자동화를 위한 Repository 배열 export
${imports}

/**
 * 모든 Repository 배열 - 자동 생성됨
 * 새 Repository가 DB에 추가되면 자동으로 여기에 포함됩니다.
 * 
 * Note: Deprecated repositories (deleted tables) are exported but not included in ALL_REPOSITORIES
 */
export const ALL_REPOSITORIES = [
${repositoryNames.map((name) => `  ${name},`).join('\n')}
];
`;

    // 기존 파일과 내용이 다른 경우에만 업데이트
    let shouldUpdate = true;
    try {
      const existingContent = await fs.readFile(indexPath, 'utf-8');
      shouldUpdate = existingContent !== content;
    } catch {
      // 파일이 없으면 생성
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      await fs.writeFile(indexPath, content, 'utf-8');
      console.log('📝 Updated repositories index.ts file');
    } else {
      console.log('✅ Repositories index.ts is already up to date');
    }
  }

  /**
   * 롤백 실행
   */
  private async rollback(): Promise<void> {
    if (!this.backupDir) return;

    try {
      console.log('🔄 Rolling back repository changes...');

      // 생성된 파일들 삭제
      for (const file of this.generatedFiles) {
        const filePath = path.join(this.options.outputDir, file);
        await fs.unlink(filePath).catch(() => {}); // 에러 무시
      }

      // 백업에서 복원
      await this.copyDirectory(this.backupDir, this.options.outputDir);

      // 백업 디렉토리 삭제
      await fs.rm(this.backupDir, { recursive: true, force: true });

      console.log('✅ Repository rollback completed');
    } catch (error) {
      console.error('❌ Repository rollback failed:', error);
    }
  }

  // 유틸리티 메서드들
  private toPascalCase(str: string): string {
    return str
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  private toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase()
      .replace(/_/g, '-');
  }

  private getTypeScriptType(dataType: string): string {
    switch (dataType.toLowerCase()) {
      case 'int':
      case 'integer':
      case 'tinyint':
      case 'smallint':
      case 'mediumint':
      case 'bigint':
      case 'decimal':
      case 'numeric':
      case 'float':
      case 'double':
        return 'number';

      case 'varchar':
      case 'char':
      case 'text':
      case 'tinytext':
      case 'mediumtext':
      case 'longtext':
      case 'json':
      case 'enum':
        return 'string';

      case 'boolean':
      case 'bool':
        return 'boolean';

      case 'date':
      case 'datetime':
      case 'timestamp':
      case 'time':
        return 'Date';

      default:
        return 'any';
    }
  }

  private getTypeScriptTypeFromColumnName(columnName: string): string {
    // 일반적인 ID 컬럼은 number로 가정
    if (columnName.toLowerCase().includes('id')) {
      return 'number';
    }
    return 'string';
  }
}

/**
 * CLI 실행 함수
 */
async function main() {
  const schemaFile = process.argv[2];
  const outputDir = process.argv[3] || 'libs/database/src/repositories';

  if (!schemaFile) {
    console.error(
      '❌ Usage: ts-node enhanced-repository-generator.ts <schema-file> [output-dir]',
    );
    process.exit(1);
  }

  try {
    console.log(`🚀 Loading schema from: ${schemaFile}`);

    const schemaContent = await fs.readFile(schemaFile, 'utf-8');
    const schemaResult: SchemaAnalysisResult = JSON.parse(schemaContent);

    const options: RepositoryGenerationOptions = {
      outputDir,
      backup: true,
      overwrite: true,
      includeComments: false,
      generateBasicMethods: false,
      generateCustomMethods: false,
    };

    const generator = new EnhancedRepositoryGenerator(schemaResult, options);
    await generator.generateRepositories();

    console.log('🎉 Repository generation completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Repository generation failed:', error);
    process.exit(1);
  }
}

// CLI에서 직접 실행되는 경우
if (require.main === module) {
  main().catch(console.error);
}

export { EnhancedRepositoryGenerator, RepositoryGenerationOptions };
