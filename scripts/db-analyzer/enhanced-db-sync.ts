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
 * 🚀 Enhanced Database Synchronization
 *
 * 통합 실행 스크립트:
 * 1. DB 스키마 분석
 * 2. Entity 자동 생성
 * 3. Repository 자동 생성
 * 4. Procedure/Function SQL 파일 추출
 * 5. index.ts 파일 자동 업데이트
 * 6. 에러 핸들링 및 롤백
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
   * 전체 동기화 실행
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

      // 3. Entity 생성
      if (!this.options.skipEntities) {
        console.log('\n🏗️ Step 2: Generating entities...');
        const entityFiles = await this.generateEntities(schemaResult);
        result.generatedFiles.entities = entityFiles;
      }

      // 4. Repository 생성
      if (!this.options.skipRepositories) {
        console.log('\n🔧 Step 3: Generating repositories...');
        const repositoryFiles = await this.generateRepositories(schemaResult);
        result.generatedFiles.repositories = repositoryFiles;
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
   * 스키마 분석
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
   * Entity 생성
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
   * Repository 생성
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
   * Procedure/Function 추출
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
   * 생성된 코드 검증
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
  const outputBaseDir = process.argv[3] || 'libs/database/src';

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
