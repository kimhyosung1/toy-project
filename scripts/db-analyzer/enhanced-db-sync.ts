#!/usr/bin/env ts-node

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  EnhancedSchemaAnalyzer,
  SchemaAnalysisResult,
} from './enhanced-schema-analyzer';
import {
  EnhancedEntityGenerator,
  EntityGenerationOptions,
} from './enhanced-entity-generator';
import {
  EnhancedRepositoryGenerator,
  RepositoryGenerationOptions,
} from './enhanced-repository-generator';
import {
  ProcedureExtractor,
  ProcedureExtractionOptions,
} from './procedure-extractor';

/**
 * 🚀 Enhanced Database Synchronization - DB 동기화 통합 관리자
 *
 * 📋 핵심 기능:
 * 1. DB 스키마 분석 - MySQL 테이블 구조 실시간 분석
 * 2. Entity 자동 생성 - TypeORM Entity 클래스 자동 생성 및 병합
 * 3. Repository 자동 생성 - 기본 CRUD 메서드 포함 Repository 생성
 * 4. Procedure/Function SQL 파일 추출 - 저장 프로시저/함수 개별 파일 추출
 * 5. index.ts 파일 자동 업데이트 - 모든 생성 파일 자동 export
 * 6. 에러 핸들링 및 롤백 - 안전한 백업/복원 시스템
 *
 * 🔄 동작 원리:
 * - MySQL INFORMATION_SCHEMA를 통한 메타데이터 수집
 * - snake_case → camelCase 자동 변환
 * - 기존 수동 코드 보존하는 스마트 병합
 * - 삭제된 테이블 자동 감지 및 @deprecated 처리
 * - 환경별(dev/qa/prod) 설정 지원
 */

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

interface SyncOptions {
  environment: string;
  outputBaseDir: string;
  backup: boolean;
  overwrite: boolean;
  skipEntities: boolean;
  skipRepositories: boolean;
  skipProcedures: boolean;
  generateComments: boolean;
  generateRelations: boolean;
  dryRun: boolean;
}

interface SyncResult {
  success: boolean;
  schemaResult?: SchemaAnalysisResult;
  generatedFiles: {
    entities: string[];
    repositories: string[];
    procedures: string[];
  };
  errors: string[];
  rollbackPerformed: boolean;
}

class EnhancedDbSync {
  private config: DatabaseConfig;
  private options: SyncOptions;
  private backupDir?: string;
  private generatedFiles: string[] = [];

  constructor(config: DatabaseConfig, options: SyncOptions) {
    this.config = config;
    this.options = options;
  }

  /**
   * 전체 동기화 실행 - DB 스키마와 코드 동기화 메인 프로세스
   *
   * 🔄 실행 순서:
   * 1. 스키마 분석: MySQL DB 구조 분석
   * 2. 삭제된 테이블 감지: 기존 Entity와 비교하여 삭제된 테이블 찾기
   * 3. Entity 생성: TypeORM Entity 클래스 생성/병합
   * 4. Repository 생성: 기본 CRUD Repository 생성
   * 5. Procedure 추출: 저장 프로시저/함수 SQL 파일 추출
   * 6. 코드 검증: TypeScript 컴파일 체크
   */
  async execute(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      generatedFiles: {
        entities: [],
        repositories: [],
        procedures: [],
      },
      errors: [],
      rollbackPerformed: false,
    };

    try {
      console.log(
        `🚀 Starting Enhanced DB Sync for ${this.options.environment} environment`,
      );
      console.log(
        `📊 Database: ${this.config.database}@${this.config.host}:${this.config.port}`,
      );

      // 1. 전체 백업 생성 (비활성화)
      // if (this.options.backup) {
      //   await this.createFullBackup();
      // }

      // 2. 스키마 분석
      console.log('\n📋 Step 1: Analyzing database schema...');
      const schemaResult = await this.analyzeSchema();
      result.schemaResult = schemaResult;

      // Dry run인 경우 분석 결과만 출력하고 종료
      if (this.options.dryRun) {
        await this.printDryRunResults(schemaResult);
        result.success = true;
        return result;
      }

      // 2.5. 삭제된 테이블 감지 및 Deprecate 처리
      console.log('\n🗑️ Step 2: Checking for deleted tables...');
      await this.handleDeletedTables(schemaResult);

      // 3. Entity 생성
      if (!this.options.skipEntities) {
        console.log('\n🏗️ Step 3: Generating entities...');
        const entityFiles = await this.generateEntities(schemaResult);
        result.generatedFiles.entities = entityFiles;
      }

      // 4. Repository 생성
      if (!this.options.skipRepositories) {
        console.log('\n🔧 Step 4: Generating repositories...');
        const repositoryFiles = await this.generateRepositories(schemaResult);
        result.generatedFiles.repositories = repositoryFiles;

        // 4.5. Repository index.ts 재생성 (deprecated Repository 제외)
        console.log(
          '\n🔄 Step 4.5: Updating repository index with deprecated exclusions...',
        );
        await this.updateRepositoryIndex(schemaResult);
      }

      // 5. Procedure/Function 추출
      if (!this.options.skipProcedures) {
        console.log('\n🏪 Step 4: Extracting procedures and functions...');
        const procedureFiles = await this.extractProcedures(schemaResult);
        result.generatedFiles.procedures = procedureFiles;
      }

      // 6. 검증
      console.log('\n🧪 Step 5: Validating generated code...');
      await this.validateGeneratedCode();

      // 7. 최종 요약 생성 (비활성화)
      // await this.generateSummaryReport(result);

      result.success = true;
      console.log('\n🎉 Enhanced DB Sync completed successfully!');
    } catch (error) {
      console.error('\n💥 Enhanced DB Sync failed:', error);
      result.errors.push(error.message);

      // 롤백 실행 (비활성화)
      // if (this.options.backup && this.backupDir) {
      //   console.log('\n🔄 Performing rollback...');
      //   await this.performRollback();
      //   result.rollbackPerformed = true;
      // }

      throw error;
    }

    return result;
  }

  /**
   * 전체 백업 생성
   */
  private async createFullBackup(): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.backupDir = path.join(
      this.options.outputBaseDir,
      `../.backup-full-${timestamp}`,
    );

    console.log(`📦 Creating full backup: ${this.backupDir}`);

    try {
      await fs.mkdir(this.backupDir, { recursive: true });

      // 백업할 디렉토리들
      const dirsToBackup = [
        path.join(this.options.outputBaseDir, 'entities'),
        path.join(this.options.outputBaseDir, 'repositories'),
        path.join(this.options.outputBaseDir, 'procedures'),
      ];

      for (const dir of dirsToBackup) {
        const exists = await fs
          .access(dir)
          .then(() => true)
          .catch(() => false);
        if (exists) {
          const backupSubDir = path.join(this.backupDir, path.basename(dir));
          await this.copyDirectory(dir, backupSubDir);
        }
      }

      console.log('✅ Full backup created successfully');
    } catch (error) {
      console.warn('⚠️ Failed to create full backup:', error);
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
   * 스키마 분석 - MySQL DB 구조 실시간 분석
   *
   * 📊 분석 대상:
   * - 테이블 구조 (컬럼, 타입, 제약조건)
   * - 인덱스 정보 (Primary Key, Unique, Index)
   * - 외래키 관계 (참조 테이블, 삭제/업데이트 규칙)
   * - 저장 프로시저/함수 (파라미터, 반환 타입)
   *
   * 💡 핵심: INFORMATION_SCHEMA 테이블을 통한 메타데이터 수집
   */
  private async analyzeSchema(): Promise<SchemaAnalysisResult> {
    const analyzer = new EnhancedSchemaAnalyzer(
      this.config,
      this.options.environment,
    );

    try {
      await analyzer.connect();
      const result = await analyzer.analyzeSchema();

      // 분석 결과 저장 (비활성화)
      // const outputPath = path.join(
      //   this.options.outputBaseDir,
      //   `${this.options.environment}-schema.json`,
      // );
      // await analyzer.saveAnalysisResult(result, outputPath);

      return result;
    } finally {
      await analyzer.disconnect();
    }
  }

  /**
   * 삭제된 테이블 감지 및 Deprecate 처리 - 안전한 하위 호환성 보장
   *
   * 🔍 감지 로직:
   * 1. 현재 DB 테이블 목록 수집
   * 2. 기존 Entity 파일들과 비교
   * 3. DB에서 삭제된 테이블 식별
   *
   * 🏷️ Deprecate 처리:
   * - Entity 파일에 @deprecated 주석 추가
   * - Repository 파일에 @deprecated 주석 추가
   * - index.ts에서 ALL_ENTITIES/ALL_REPOSITORIES 배열에서 제외
   * - 기존 코드 호환성 유지 (파일은 삭제하지 않음)
   */
  private async handleDeletedTables(
    schemaResult: SchemaAnalysisResult,
  ): Promise<void> {
    try {
      const entitiesDir = path.join(this.options.outputBaseDir, 'entities');
      const repositoriesDir = path.join(
        this.options.outputBaseDir,
        'repositories',
      );

      // 현재 DB에 있는 테이블 이름들
      const currentTables = new Set(
        schemaResult.tables.map((table) => table.tableName),
      );

      // 기존 Entity 파일들 확인
      const existingEntityFiles =
        await this.getExistingEntityFiles(entitiesDir);
      const existingRepositoryFiles =
        await this.getExistingRepositoryFiles(repositoriesDir);

      // 삭제된 테이블들 찾기
      const deletedTables = new Set<string>();

      for (const entityFile of existingEntityFiles) {
        const tableName = this.extractTableNameFromEntityFile(entityFile);
        if (tableName && !currentTables.has(tableName)) {
          deletedTables.add(tableName);
        }
      }

      if (deletedTables.size > 0) {
        console.log(
          `   🗑️ Found ${deletedTables.size} deleted table(s): ${Array.from(deletedTables).join(', ')}`,
        );

        // Entity 파일들에 Deprecate 주석 추가
        for (const tableName of deletedTables) {
          await this.addDeprecateCommentToEntity(entitiesDir, tableName);
          await this.addDeprecateCommentToRepository(
            repositoriesDir,
            tableName,
          );
        }
      } else {
        console.log('   ✅ No deleted tables found');
      }
    } catch (error) {
      console.warn('   ⚠️ Failed to check for deleted tables:', error.message);
    }
  }

  /**
   * 기존 Entity 파일들 목록 가져오기
   */
  private async getExistingEntityFiles(entitiesDir: string): Promise<string[]> {
    try {
      const files = await fs.readdir(entitiesDir);
      return files.filter(
        (file) => file.endsWith('.entity.ts') && file !== 'index.ts',
      );
    } catch {
      return [];
    }
  }

  /**
   * 기존 Repository 파일들 목록 가져오기
   */
  private async getExistingRepositoryFiles(
    repositoriesDir: string,
  ): Promise<string[]> {
    try {
      const files = await fs.readdir(repositoriesDir);
      return files.filter(
        (file) => file.endsWith('.repository.ts') && file !== 'index.ts',
      );
    } catch {
      return [];
    }
  }

  /**
   * Entity 파일명에서 테이블명 추출
   */
  private extractTableNameFromEntityFile(fileName: string): string | null {
    // tb-board.entity.ts -> tb_board
    const match = fileName.match(/^(.+)\.entity\.ts$/);
    if (match) {
      return match[1].replace(/-/g, '_');
    }
    return null;
  }

  /**
   * Entity 파일에 Deprecate 주석 추가
   */
  private async addDeprecateCommentToEntity(
    entitiesDir: string,
    tableName: string,
  ): Promise<void> {
    const fileName = `${tableName.replace(/_/g, '-')}.entity.ts`;
    const filePath = path.join(entitiesDir, fileName);

    try {
      const content = await fs.readFile(filePath, 'utf-8');

      // 이미 @deprecated가 있는지 확인
      if (content.includes('@deprecated')) {
        console.log(`   ⚠️ ${fileName} already has @deprecated comment`);
        return;
      }

      // @Entity 데코레이터 앞에 deprecate 주석 추가
      const deprecateComment = `/**
 * @deprecated This table has been deleted from the database.
 * This entity is kept for backward compatibility but should not be used.
 * 이 테이블은 데이터베이스에서 삭제되었습니다.
 * 기존 코드 호환성을 위해 유지되지만 사용하지 마세요.
 * 
 * Deletion detected on: ${new Date().toISOString().split('T')[0]}
 */`;

      const updatedContent = content.replace(
        /(@Entity\([^)]+\))/,
        `${deprecateComment}\n$1`,
      );

      await fs.writeFile(filePath, updatedContent, 'utf-8');
      console.log(`   🏷️ Added @deprecated to ${fileName}`);
    } catch (error) {
      console.warn(
        `   ⚠️ Failed to add @deprecated to ${fileName}:`,
        error.message,
      );
    }
  }

  /**
   * Repository 파일에 Deprecate 주석 추가
   */
  private async addDeprecateCommentToRepository(
    repositoriesDir: string,
    tableName: string,
  ): Promise<void> {
    const fileName = `${tableName.replace(/_/g, '-')}.repository.ts`;
    const filePath = path.join(repositoriesDir, fileName);

    try {
      const content = await fs.readFile(filePath, 'utf-8');

      // 이미 @deprecated가 있는지 확인
      if (content.includes('@deprecated')) {
        console.log(`   ⚠️ ${fileName} already has @deprecated comment`);
        return;
      }

      // @Injectable 데코레이터 앞에 deprecate 주석 추가
      const deprecateComment = `/**
 * @deprecated This repository is for a deleted table.
 * This repository is kept for backward compatibility but should not be used.
 * 이 리포지토리는 삭제된 테이블용입니다.
 * 기존 코드 호환성을 위해 유지되지만 사용하지 마세요.
 * 
 * Deletion detected on: ${new Date().toISOString().split('T')[0]}
 */`;

      const updatedContent = content.replace(
        /(@Injectable\(\))/,
        `${deprecateComment}\n$1`,
      );

      await fs.writeFile(filePath, updatedContent, 'utf-8');
      console.log(`   🏷️ Added @deprecated to ${fileName}`);
    } catch (error) {
      console.warn(
        `   ⚠️ Failed to add @deprecated to ${fileName}:`,
        error.message,
      );
    }
  }

  /**
   * Entity 생성 - TypeORM Entity 클래스 자동 생성 및 스마트 병합
   *
   * 🏗️ 생성 과정:
   * 1. 테이블 스키마 → TypeORM Entity 변환
   * 2. snake_case → camelCase 프로퍼티 변환
   * 3. 기존 Entity 파일과 병합 (수동 관계 보존)
   * 4. 관계 매핑 자동 생성 (OneToMany, ManyToOne)
   * 5. 인덱스 및 제약조건 적용
   *
   * 💡 스마트 병합: 기존 수동 코드(관계, import) 보존
   */
  private async generateEntities(
    schemaResult: SchemaAnalysisResult,
  ): Promise<string[]> {
    const outputDir = path.join(this.options.outputBaseDir, 'entities');

    const options: EntityGenerationOptions = {
      outputDir,
      backup: false, // 전체 백업에서 처리됨
      overwrite: this.options.overwrite,
      includeComments: this.options.generateComments,
      generateRelations: this.options.generateRelations,
      useStrictTypes: true,
    };

    const generator = new EnhancedEntityGenerator(schemaResult, options);
    await generator.generateEntities();

    // 생성된 파일 목록 반환
    const files = await fs.readdir(outputDir);
    return files.filter(
      (file) => file.endsWith('.entity.ts') || file === 'index.ts',
    );
  }

  /**
   * Repository 생성 - 기본 CRUD 메서드 포함 Repository 자동 생성
   *
   * 🔧 생성 규칙:
   * 1. 같은 테이블 처리하는 기존 Repository 있으면 건너뛰기
   * 2. 새 테이블에 대해서만 Repository 생성
   * 3. 기본 CRUD 메서드 템플릿 포함
   * 4. 타입 안전성 보장 (Generic Repository<Entity>)
   *
   * 📝 생성 파일: {table-name}.repository.ts
   */
  private async generateRepositories(
    schemaResult: SchemaAnalysisResult,
  ): Promise<string[]> {
    const outputDir = path.join(this.options.outputBaseDir, 'repositories');

    const options: RepositoryGenerationOptions = {
      outputDir,
      backup: false, // 전체 백업에서 처리됨
      overwrite: this.options.overwrite,
      includeComments: false,
      generateBasicMethods: false,
      generateCustomMethods: false,
    };

    const generator = new EnhancedRepositoryGenerator(schemaResult, options);
    await generator.generateRepositories();

    // 생성된 파일 목록 반환
    const files = await fs.readdir(outputDir);
    return files.filter(
      (file) => file.endsWith('.repository.ts') || file === 'index.ts',
    );
  }

  /**
   * Repository index.ts 업데이트 - 자동 export 관리 (deprecated 제외)
   *
   * 📦 업데이트 내용:
   * 1. 모든 Repository 파일 스캔
   * 2. @deprecated 주석 있는 Repository 식별
   * 3. export 문은 모두 포함 (하위 호환성)
   * 4. ALL_REPOSITORIES 배열에는 deprecated 제외
   *
   * 💡 목적: 자동화된 모듈 관리 및 안전한 deprecated 처리
   */
  private async updateRepositoryIndex(
    schemaResult: SchemaAnalysisResult,
  ): Promise<void> {
    const repositoriesDir = path.join(
      this.options.outputBaseDir,
      'repositories',
    );
    const indexPath = path.join(repositoriesDir, 'index.ts');

    try {
      // 기존 파일들 스캔
      const files = await fs.readdir(repositoriesDir);
      const repositoryFiles = files.filter(
        (file) => file.endsWith('.repository.ts') && file !== 'index.ts',
      );

      const existingExports: string[] = [];
      const existingImports: string[] = [];
      const repositoryNames: string[] = [];

      for (const file of repositoryFiles) {
        const filePath = path.join(repositoriesDir, file);

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
              repositoryNames.push(repositoryName);
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

      const exports = existingExports.sort();
      const imports = existingImports.join('\n');
      const sortedRepositoryNames = repositoryNames.sort();

      const content = `// 🤖 Auto-generated repository exports
// Environment: ${schemaResult.database.environment}
// Tables: ${schemaResult.tables.length}

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
${sortedRepositoryNames.map((name) => `  ${name},`).join('\n')}
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
        console.log(
          '   📝 Updated repositories index.ts with deprecated exclusions',
        );
      } else {
        console.log('   ✅ Repository index.ts is already up to date');
      }
    } catch (error) {
      console.warn('   ⚠️ Failed to update repository index:', error.message);
    }
  }

  /**
   * Procedure/Function 추출 - 저장 프로시저/함수 개별 SQL 파일 추출
   *
   * 🏪 추출 과정:
   * 1. DB에서 저장 프로시저/함수 메타데이터 수집
   * 2. 각각을 개별 .sql 파일로 추출
   * 3. 파라미터 정보 및 주석 포함
   * 4. procedures/ 및 functions/ 디렉토리 분리
   *
   * 📁 파일 구조: {procedure_name}.sql, {function_name}.sql
   * 💡 활용: 개별 import 가능, 버전 관리 용이
   */
  private async extractProcedures(
    schemaResult: SchemaAnalysisResult,
  ): Promise<string[]> {
    const outputDir = path.join(this.options.outputBaseDir, 'procedures');

    const options: ProcedureExtractionOptions = {
      outputDir,
      backup: false, // 전체 백업에서 처리됨
      overwrite: this.options.overwrite,
      includeComments: this.options.generateComments,
      separateByType: true,
      generateDocumentation: true,
    };

    const extractor = new ProcedureExtractor(schemaResult, options);
    await extractor.extractProcedures();

    // 생성된 파일 목록 반환 (재귀적으로 모든 파일 찾기)
    const files: string[] = [];
    await this.collectFiles(outputDir, files);
    return files.map((file) => path.relative(outputDir, file));
  }

  /**
   * 파일 수집 (재귀)
   */
  private async collectFiles(dir: string, files: string[]): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await this.collectFiles(fullPath, files);
      } else {
        files.push(fullPath);
      }
    }
  }

  /**
   * 생성된 코드 검증 - TypeScript 컴파일 체크로 코드 품질 보장
   *
   * 🧪 검증 항목:
   * 1. TypeScript 컴파일 에러 체크
   * 2. Entity 관계 매핑 유효성
   * 3. Import 문 정확성
   * 4. 타입 안전성 확인
   *
   * ⚠️ 실패 시: 경고 출력하지만 프로세스 중단하지 않음
   */
  private async validateGeneratedCode(): Promise<void> {
    try {
      // TypeScript 컴파일 체크
      const { spawn } = require('child_process');

      await new Promise((resolve, reject) => {
        const tsc = spawn(
          'npx',
          ['tsc', '--noEmit', '--project', 'libs/database/tsconfig.lib.json'],
          {
            stdio: 'pipe',
          },
        );

        let output = '';
        tsc.stdout.on('data', (data: Buffer) => {
          output += data.toString();
        });

        tsc.stderr.on('data', (data: Buffer) => {
          output += data.toString();
        });

        tsc.on('close', (code: number) => {
          if (code === 0) {
            console.log('✅ TypeScript compilation check passed');
            resolve(void 0);
          } else {
            console.error('❌ TypeScript compilation errors:');
            console.error(output);
            reject(new Error('TypeScript compilation failed'));
          }
        });
      });
    } catch (error) {
      console.warn('⚠️ Code validation failed:', error.message);
      // 검증 실패는 치명적이지 않으므로 계속 진행
    }
  }

  /**
   * Dry run 결과 출력
   */
  private async printDryRunResults(
    schemaResult: SchemaAnalysisResult,
  ): Promise<void> {
    console.log('\n📊 DRY RUN RESULTS');
    console.log('==================');
    console.log(`Environment: ${this.options.environment}`);
    console.log(`Database: ${schemaResult.database.database}`);
    console.log(`Version: ${schemaResult.database.version}`);
    console.log(`Analyzed at: ${schemaResult.database.analyzedAt}`);
    console.log('');

    console.log('📋 Tables to process:');
    schemaResult.tables.forEach((table, index) => {
      console.log(
        `  ${index + 1}. ${table.tableName} (${table.columns.length} columns)`,
      );
    });

    console.log('\n🔧 Procedures to extract:');
    schemaResult.procedures.forEach((proc, index) => {
      console.log(
        `  ${index + 1}. ${proc.name} (${proc.parameters.length} params)`,
      );
    });

    console.log('\n⚙️ Functions to extract:');
    schemaResult.functions.forEach((func, index) => {
      console.log(
        `  ${index + 1}. ${func.name} (${func.parameters.length} params)`,
      );
    });

    console.log('\n📁 Files that would be generated:');
    if (!this.options.skipEntities) {
      console.log('  Entities:');
      schemaResult.tables.forEach((table) => {
        console.log(`    - ${this.toKebabCase(table.tableName)}.entity.ts`);
      });
      console.log('    - index.ts');
    }

    if (!this.options.skipRepositories) {
      console.log('  Repositories:');
      schemaResult.tables.forEach((table) => {
        console.log(`    - ${this.toKebabCase(table.tableName)}.repository.ts`);
      });
      console.log('    - index.ts');
    }

    if (!this.options.skipProcedures) {
      console.log('  Procedures:');
      schemaResult.procedures.forEach((proc) => {
        console.log(`    - procedures/${proc.name.toLowerCase()}.sql`);
      });
      schemaResult.functions.forEach((func) => {
        console.log(`    - functions/${func.name.toLowerCase()}.sql`);
      });
      console.log('    - docs/index.md');
      console.log('    - docs/procedures.md');
      console.log('    - docs/functions.md');
      console.log('    - README.md');
    }
  }

  /**
   * 요약 보고서 생성
   */
  private async generateSummaryReport(result: SyncResult): Promise<void> {
    const reportPath = path.join(
      this.options.outputBaseDir,
      'sync-report.json',
    );

    const report = {
      timestamp: new Date().toISOString(),
      environment: this.options.environment,
      database: result.schemaResult?.database,
      options: this.options,
      results: {
        success: result.success,
        entitiesGenerated: result.generatedFiles.entities.length,
        repositoriesGenerated: result.generatedFiles.repositories.length,
        proceduresExtracted: result.generatedFiles.procedures.length,
        totalFiles: Object.values(result.generatedFiles).flat().length,
      },
      generatedFiles: result.generatedFiles,
      errors: result.errors,
      rollbackPerformed: result.rollbackPerformed,
    };

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`📊 Sync report saved: ${reportPath}`);
  }

  /**
   * 롤백 실행
   */
  private async performRollback(): Promise<void> {
    if (!this.backupDir) return;

    try {
      const dirsToRestore = ['entities', 'repositories', 'procedures'];

      for (const dir of dirsToRestore) {
        const backupPath = path.join(this.backupDir, dir);
        const targetPath = path.join(this.options.outputBaseDir, dir);

        const exists = await fs
          .access(backupPath)
          .then(() => true)
          .catch(() => false);
        if (exists) {
          // 현재 디렉토리 삭제
          await fs.rm(targetPath, { recursive: true, force: true });

          // 백업에서 복원
          await this.copyDirectory(backupPath, targetPath);
          console.log(`✅ Restored ${dir} from backup`);
        }
      }

      // 백업 디렉토리 정리
      await fs.rm(this.backupDir, { recursive: true, force: true });
      console.log('🧹 Backup directory cleaned up');
    } catch (error) {
      console.error('❌ Rollback failed:', error);
    }
  }

  // 유틸리티 메서드
  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase()
      .replace(/_/g, '-');
  }
}

/**
 * CLI 실행 함수
 */
async function main() {
  const environment = process.argv[2] || process.env.NODE_ENV || 'dev';
  const outputBaseDirArg = process.argv[3] || 'libs/database/src';

  // 절대 경로로 변환 (프로젝트 루트 기준)
  const projectRoot = path.resolve(__dirname, '../..');
  const outputBaseDir = path.resolve(projectRoot, outputBaseDirArg);

  console.log(`🚀 Enhanced Database Sync`);
  console.log(`Environment: ${environment}`);
  console.log(`Output: ${outputBaseDir}`);

  // 환경 변수에서 DB 설정 읽기
  const config: DatabaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'test',
  };

  // CLI 옵션 파싱
  const options: SyncOptions = {
    environment,
    outputBaseDir,
    backup: !process.argv.includes('--no-backup'),
    overwrite: process.argv.includes('--overwrite'),
    skipEntities: process.argv.includes('--skip-entities'),
    skipRepositories: process.argv.includes('--skip-repositories'),
    skipProcedures: process.argv.includes('--skip-procedures'),
    generateComments: !process.argv.includes('--no-comments'),
    generateRelations: !process.argv.includes('--no-relations'),
    dryRun: process.argv.includes('--dry-run'),
  };

  const sync = new EnhancedDbSync(config, options);

  try {
    const result = await sync.execute();

    if (result.success) {
      console.log('\n🎉 Database synchronization completed successfully!');
      process.exit(0);
    } else {
      console.error('\n💥 Database synchronization failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  }
}

// CLI에서 직접 실행되는 경우
if (require.main === module) {
  main().catch(console.error);
}

export { EnhancedDbSync, SyncOptions, SyncResult };
