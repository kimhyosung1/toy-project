#!/usr/bin/env ts-node

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  SchemaAnalysisResult,
  TableInfo,
  ColumnInfo,
} from './enhanced-schema-analyzer';

/**
 * 🏗️ Enhanced Entity Generator - TypeORM Entity 자동 생성 및 스마트 병합 시스템
 *
 * 📋 핵심 기능:
 * - TypeORM Entity 클래스 자동 생성 (MySQL 스키마 → TypeScript)
 * - 관계 매핑 자동 설정 (OneToMany, ManyToOne, 외래키 기반)
 * - 인덱스 및 제약조건 적용 (@Index, @Unique)
 * - 타입 안전성 보장 (TypeScript 엄격 타입 사용)
 * - 백업 및 롤백 기능 (안전한 코드 생성)
 *
 * 🔄 스마트 병합 원리:
 * - 기존 Entity 파일의 수동 관계 보존
 * - snake_case(DB) → camelCase(TypeScript) 자동 변환
 * - 기존 import 문 및 TypeORM 데코레이터 보존
 * - 중복 제거 및 충돌 방지
 */

interface EntityGenerationOptions {
  outputDir: string;
  backup: boolean;
  overwrite: boolean;
  includeComments: boolean;
  generateRelations: boolean;
  useStrictTypes: boolean;
}

interface RelationInfo {
  propertyName: string;
  targetEntity: string;
  relationType: 'OneToOne' | 'OneToMany' | 'ManyToOne' | 'ManyToMany';
  joinColumn?: string;
  inverseProperty?: string;
}

class EnhancedEntityGenerator {
  private options: EntityGenerationOptions;
  private schemaResult: SchemaAnalysisResult;
  private generatedFiles: string[] = [];
  private backupDir?: string;

  constructor(
    schemaResult: SchemaAnalysisResult,
    options: EntityGenerationOptions,
  ) {
    this.schemaResult = schemaResult;
    this.options = options;
  }

  /**
   * Entity 생성 실행 - 전체 Entity 파일 생성 및 병합 프로세스
   *
   * 🔄 실행 순서:
   * 1. 백업 생성: 기존 Entity 파일들 백업
   * 2. 출력 디렉토리 준비: entities/ 디렉토리 설정
   * 3. Entity 파일 생성: 각 테이블별 Entity 파일 생성/병합
   * 4. index.ts 업데이트: 모든 Entity export 및 ALL_ENTITIES 배열
   *
   * ⚠️ 에러 시 롤백: 백업에서 자동 복원
   */
  async generateEntities(): Promise<void> {
    try {
      console.log('🏗️ Starting enhanced entity generation...');

      // 백업 생성
      if (this.options.backup) {
        await this.createBackup();
      }

      // 출력 디렉토리 준비
      await this.prepareOutputDirectory();

      // Entity 파일들 생성
      for (const table of this.schemaResult.tables) {
        await this.generateEntityFile(table);
      }

      // index.ts 파일 업데이트
      await this.updateIndexFile();

      console.log(
        `✅ Successfully generated ${this.generatedFiles.length} entity files`,
      );
      console.log('📋 Generated files:');
      this.generatedFiles.forEach((file) => console.log(`   - ${file}`));
    } catch (error) {
      console.error('❌ Entity generation failed:', error);

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
      `../.backup-${timestamp}`,
    );

    try {
      // 기존 entities 디렉토리가 있으면 백업
      const entitiesDir = this.options.outputDir;
      const exists = await fs
        .access(entitiesDir)
        .then(() => true)
        .catch(() => false);

      if (exists) {
        await fs.mkdir(this.backupDir, { recursive: true });
        await this.copyDirectory(entitiesDir, this.backupDir);
        console.log(`📦 Backup created: ${this.backupDir}`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to create backup:', error);
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

    // 기존 파일 정리 (overwrite 옵션이 true인 경우만)
    if (this.options.overwrite) {
      const files = await fs.readdir(this.options.outputDir);
      const entityFiles = files.filter(
        (file) => file.endsWith('.entity.ts') && file !== 'index.ts',
      );

      for (const file of entityFiles) {
        await fs.unlink(path.join(this.options.outputDir, file));
        console.log(`🗑️ Removed existing file: ${file}`);
      }
    } else {
      console.log(
        '🔄 Merge mode: Preserving manual changes in existing entities',
      );
    }
  }

  /**
   * 개별 Entity 파일 생성 - 기존 파일과 스마트 병합
   *
   * 🔄 병합 로직:
   * 1. 기존 파일 존재 여부 확인
   * 2. overwrite 옵션에 따른 처리 방식 결정
   * 3. 기존 파일 있으면 수동 코드 보존하며 병합
   * 4. 새 파일이면 완전히 새로 생성
   *
   * 💡 병합 대상: 수동 관계, import 문, TypeORM 데코레이터
   */
  private async generateEntityFile(table: TableInfo): Promise<void> {
    const entityName = this.toPascalCase(table.tableName);
    const fileName = `${this.toKebabCase(table.tableName)}.entity.ts`;
    const filePath = path.join(this.options.outputDir, fileName);

    console.log(`   📝 Generating ${entityName} -> ${fileName}`);

    // 기존 파일이 있는지 확인
    const existingContent = await this.getExistingEntityContent(filePath);

    let entityContent: string;
    if (existingContent && !this.options.overwrite) {
      // 기존 파일과 병합
      entityContent = await this.mergeEntityContent(table, existingContent);
      console.log(`   🔄 Merged with existing ${fileName}`);
    } else {
      // 새로 생성
      entityContent = this.generateEntityContent(table);
    }

    await fs.writeFile(filePath, entityContent, 'utf-8');
    this.generatedFiles.push(fileName);
  }

  /**
   * 기존 Entity 파일 내용 읽기
   */
  private async getExistingEntityContent(
    filePath: string,
  ): Promise<string | null> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch {
      return null;
    }
  }

  /**
   * 기존 Entity와 새 스키마 정보 병합 - 수동 코드 보존 로직
   *
   * 🔍 병합 과정:
   * 1. 수동 관계 추출: @OneToMany, @ManyToMany 등 수동 추가된 관계
   * 2. 수동 import 추출: Entity import 및 TypeORM import
   * 3. 새 Entity 내용 생성: DB 스키마 기반 새 Entity 생성
   * 4. 수동 콘텐츠 병합: 중복 제거하며 수동 코드 병합
   *
   * 💡 핵심: DB 스키마 변경에도 수동 코드 유지
   */
  private async mergeEntityContent(
    table: TableInfo,
    existingContent: string,
  ): Promise<string> {
    // 기존 파일에서 수동으로 추가된 관계 프로퍼티 추출
    const manualRelations = this.extractManualRelations(existingContent, table);
    const manualImports = this.extractManualImports(existingContent);
    const manualTypeOrmImports =
      this.extractManualTypeOrmImports(existingContent);

    // 새 Entity 내용 생성
    const newEntityContent = this.generateEntityContent(table);

    // 수동 관계와 Import 병합
    return this.mergeManualContent(
      newEntityContent,
      manualRelations,
      manualImports,
      manualTypeOrmImports,
    );
  }

  /**
   * 수동으로 추가된 관계 프로퍼티 추출 - DB 스키마에 없는 비즈니스 관계 보존
   *
   * 🔍 추출 대상:
   * 1. @OneToMany 관계: DB 외래키에 없는 역방향 관계
   * 2. @ManyToMany 관계: 중간 테이블 없는 다대다 관계
   * 3. 비즈니스 로직 관계: 개발자가 수동 추가한 관계
   *
   * 💡 판별 기준: DB 컬럼에 없는 프로퍼티는 수동 관계로 간주
   */
  private extractManualRelations(content: string, table: TableInfo): string[] {
    const relations: string[] = [];

    // OneToMany 관계 찾기 (DB 컬럼에 없는 관계형 프로퍼티)
    const oneToManyRegex = /@OneToMany\([^)]+\)[^;]*;/gs;
    let match;

    while ((match = oneToManyRegex.exec(content)) !== null) {
      const fullMatch = match[0];

      // 프로퍼티 이름 추출
      const propertyMatch = fullMatch.match(
        /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*[^;]+;/,
      );
      if (propertyMatch) {
        const propertyName = propertyMatch[1];

        // DB 컬럼에 해당하지 않는 관계형 프로퍼티만 수동 관계로 간주
        const isDbColumn = table.columns.some(
          (col) => this.toCamelCase(col.columnName) === propertyName,
        );

        if (!isDbColumn) {
          relations.push(fullMatch.trim());
          console.log(`   🔗 Preserving manual relation: ${propertyName}`);
        }
      }
    }

    // ManyToMany 관계도 찾기
    const manyToManyRegex = /@ManyToMany\([^)]+\)[^;]*;/gs;
    while ((match = manyToManyRegex.exec(content)) !== null) {
      const fullMatch = match[0];
      const propertyMatch = fullMatch.match(
        /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*[^;]+;/,
      );
      if (propertyMatch) {
        const propertyName = propertyMatch[1];
        const isDbColumn = table.columns.some(
          (col) => this.toCamelCase(col.columnName) === propertyName,
        );

        if (!isDbColumn) {
          relations.push(fullMatch.trim());
          console.log(`   🔗 Preserving manual relation: ${propertyName}`);
        }
      }
    }

    return relations;
  }

  /**
   * 수동으로 추가된 Import 추출 (TypeORM import와 Entity import 모두)
   */
  private extractManualImports(content: string): string[] {
    const imports: string[] = [];

    // Entity import 찾기 (자동 생성되지 않은 것들)
    const entityImportRegex =
      /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"][^'"]*\.entity['"]\s*;/g;
    let match;

    while ((match = entityImportRegex.exec(content)) !== null) {
      imports.push(match[0].trim());
    }

    return imports;
  }

  /**
   * 수동으로 추가된 TypeORM 데코레이터 감지 및 Import 업데이트
   */
  private extractManualTypeOrmImports(content: string): Set<string> {
    const manualImports = new Set<string>();

    // 수동으로 추가된 관계에서 사용된 TypeORM 데코레이터 찾기
    const decoratorPatterns = [
      /@OneToMany\s*\(/g,
      /@ManyToMany\s*\(/g,
      /@JoinTable\s*\(/g,
      /@JoinColumn\s*\(/g,
    ];

    const decoratorMap = {
      '@OneToMany': 'OneToMany',
      '@ManyToMany': 'ManyToMany',
      '@JoinTable': 'JoinTable',
      '@JoinColumn': 'JoinColumn',
    };

    decoratorPatterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        const decoratorName = Object.keys(decoratorMap)[index];
        manualImports.add(decoratorMap[decoratorName]);
      }
    });

    return manualImports;
  }

  /**
   * 수동 콘텐츠를 새 Entity에 병합 (중복 제거)
   */
  private mergeManualContent(
    newContent: string,
    manualRelations: string[],
    manualImports: string[],
    manualTypeOrmImports?: Set<string>,
  ): string {
    let mergedContent = newContent;

    // 수동 관계 추가 (중복 제거)
    if (manualRelations.length > 0) {
      const uniqueRelations = manualRelations.filter((relation) => {
        // 새 콘텐츠에 이미 같은 관계가 있는지 확인
        const propertyMatch = relation.match(
          /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*[^;]+;/,
        );
        if (propertyMatch) {
          const propertyName = propertyMatch[1];
          return !mergedContent.includes(`${propertyName}:`);
        }
        return true;
      });

      if (uniqueRelations.length > 0) {
        const classEndIndex = mergedContent.lastIndexOf('}');
        const relationsContent = '\n  ' + uniqueRelations.join('\n\n  ') + '\n';
        mergedContent =
          mergedContent.slice(0, classEndIndex) +
          relationsContent +
          mergedContent.slice(classEndIndex);
      }
    }

    // 수동 TypeORM Import 추가 (기존 TypeORM import에 병합)
    if (manualTypeOrmImports && manualTypeOrmImports.size > 0) {
      const typeormImportRegex =
        /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]typeorm['"];/;
      const match = mergedContent.match(typeormImportRegex);

      if (match) {
        const existingImports = match[1]
          .split(',')
          .map((imp) => imp.trim())
          .filter((imp) => imp.length > 0); // 빈 문자열 제거
        const newImports = Array.from(manualTypeOrmImports).filter(
          (imp) => !existingImports.includes(imp),
        );

        if (newImports.length > 0) {
          const allImports = [...existingImports, ...newImports]
            .filter((imp) => imp.length > 0) // 빈 문자열 제거
            .sort()
            .join(', ');
          const newImportStatement = `import {\n  ${allImports},\n} from 'typeorm';`;
          mergedContent = mergedContent.replace(
            typeormImportRegex,
            newImportStatement,
          );

          console.log(`   📦 Added TypeORM imports: ${newImports.join(', ')}`);
        }
      }
    }

    // 수동 Entity Import 추가 (중복 제거)
    if (manualImports.length > 0) {
      const uniqueImports = manualImports.filter((importStmt) => {
        return !mergedContent.includes(importStmt);
      });

      if (uniqueImports.length > 0) {
        const importEndIndex = mergedContent.indexOf('\n\n@Entity');
        if (importEndIndex > 0) {
          const additionalImports = '\n' + uniqueImports.join('\n');
          mergedContent =
            mergedContent.slice(0, importEndIndex) +
            additionalImports +
            mergedContent.slice(importEndIndex);
        }
      }
    }

    return mergedContent;
  }

  /**
   * Entity 클래스 내용 생성 - 완전한 TypeORM Entity 클래스 코드 생성
   *
   * 🏗️ 생성 구성요소:
   * 1. Import 문: TypeORM 데코레이터 및 관련 Entity import
   * 2. 클래스 데코레이터: @Entity, @Index 등
   * 3. 클래스 선언: {TableName}Entity 클래스
   * 4. 프로퍼티들: DB 컬럼 → TypeScript 프로퍼티
   * 5. 관계 매핑: 외래키 기반 관계 생성
   *
   * 💡 자동 변환: snake_case → camelCase, MySQL 타입 → TypeScript 타입
   */
  private generateEntityContent(table: TableInfo): string {
    const entityName = this.toPascalCase(table.tableName) + 'Entity';
    const imports = this.generateImports(table);
    const classDecorator = this.generateClassDecorator(table);
    const properties = this.generateProperties(table);
    const relations = this.generateRelations(table);

    return `${imports}

${classDecorator}
export class ${entityName} {
${properties}${relations}
}
`;
  }

  /**
   * Import 문 생성 - TypeORM 데코레이터 및 관련 Entity import 자동 생성
   *
   * 📦 Import 종류:
   * 1. TypeORM 데코레이터: Entity, Column, PrimaryGeneratedColumn 등
   * 2. 날짜 데코레이터: CreateDateColumn, UpdateDateColumn
   * 3. 관계 데코레이터: OneToMany, ManyToOne, JoinColumn
   * 4. 인덱스 데코레이터: Index (인덱스 있을 때)
   * 5. 관련 Entity: 외래키 관계에 따른 다른 Entity import
   *
   * 💡 자동 최적화: 필요한 데코레이터만 선택적 import
   */
  private generateImports(table: TableInfo): string {
    const imports = new Set<string>(['Entity', 'Column']);

    // Primary Key 컬럼이 있으면 PrimaryGeneratedColumn 또는 PrimaryColumn 추가
    const hasPrimaryKey = table.columns.some((col) => col.isPrimaryKey);
    if (hasPrimaryKey) {
      const hasAutoIncrement = table.columns.some(
        (col) => col.isPrimaryKey && col.isAutoIncrement,
      );
      imports.add(
        hasAutoIncrement ? 'PrimaryGeneratedColumn' : 'PrimaryColumn',
      );
    }

    // 날짜 컬럼이 있으면 CreateDateColumn, UpdateDateColumn 추가
    const hasCreatedAt = table.columns.some(
      (col) =>
        col.columnName.toLowerCase().includes('created') &&
        (col.dataType.includes('timestamp') ||
          col.dataType.includes('datetime')),
    );
    const hasUpdatedAt = table.columns.some(
      (col) =>
        col.columnName.toLowerCase().includes('updated') &&
        (col.dataType.includes('timestamp') ||
          col.dataType.includes('datetime')),
    );

    if (hasCreatedAt) imports.add('CreateDateColumn');
    if (hasUpdatedAt) imports.add('UpdateDateColumn');

    // 인덱스가 있으면 Index 추가
    if (table.indexes.length > 0) {
      imports.add('Index');
    }

    // 외래키가 있으면 관계 데코레이터 추가
    if (this.options.generateRelations && table.foreignKeys.length > 0) {
      imports.add('ManyToOne');
      imports.add('JoinColumn');
    }

    // OneToMany 관계가 필요한지 확인 (다른 테이블에서 이 테이블을 참조하는 경우)
    if (this.options.generateRelations) {
      const hasOneToManyRelation = this.schemaResult.tables.some((otherTable) =>
        otherTable.foreignKeys.some(
          (fk) => fk.referencedTableName === table.tableName,
        ),
      );
      if (hasOneToManyRelation) {
        imports.add('OneToMany');
      }
    }

    const importList = Array.from(imports).sort().join(', ');
    let importStatements = `import {\n  ${importList},\n} from 'typeorm';`;

    // 관계 Entity들의 import 추가
    if (this.options.generateRelations) {
      const relatedEntityImports = new Set<string>();

      // ManyToOne 관계 (외래키 기반)
      if (table.foreignKeys.length > 0) {
        table.foreignKeys.forEach((fk) => {
          const entityName =
            this.toPascalCase(fk.referencedTableName) + 'Entity';
          const fileName = this.toKebabCase(fk.referencedTableName);

          // 자기 참조인 경우 import 하지 않음
          if (fk.referencedTableName !== table.tableName) {
            relatedEntityImports.add(
              `import { ${entityName} } from './${fileName}.entity';`,
            );
          }
        });
      }

      // OneToMany 관계 (다른 테이블에서 이 테이블을 참조하는 경우)
      this.schemaResult.tables.forEach((otherTable) => {
        otherTable.foreignKeys.forEach((fk) => {
          if (fk.referencedTableName === table.tableName) {
            const entityName =
              this.toPascalCase(otherTable.tableName) + 'Entity';
            const fileName = this.toKebabCase(otherTable.tableName);

            // 자기 참조가 아닌 경우만 import 추가
            if (otherTable.tableName !== table.tableName) {
              relatedEntityImports.add(
                `import { ${entityName} } from './${fileName}.entity';`,
              );
            }
          }
        });
      });

      const importArray = Array.from(relatedEntityImports);
      if (importArray.length > 0) {
        importStatements += '\n' + importArray.join('\n');
      }
    }

    return importStatements;
  }

  /**
   * 클래스 데코레이터 생성 - @Entity 및 @Index 데코레이터 생성
   *
   * 🏷️ 데코레이터 종류:
   * 1. @Entity: 테이블 이름 매핑 (@Entity('table_name'))
   * 2. @Index: Unique 인덱스 매핑 (Primary Key 제외)
   *
   * 💡 인덱스 처리: 고유 인덱스만 데코레이터로 추가
   */
  private generateClassDecorator(table: TableInfo): string {
    let decorator = `@Entity('${table.tableName}')`;

    // 인덱스 추가
    const uniqueIndexes = table.indexes.filter(
      (idx) => idx.isUnique && !idx.isPrimary && idx.indexName !== 'PRIMARY',
    );

    if (uniqueIndexes.length > 0) {
      const indexDecorators = uniqueIndexes.map(
        (idx) =>
          `@Index('${idx.indexName}', ['${this.toCamelCase(idx.columnName)}'], { unique: true })`,
      );
      decorator = indexDecorators.join('\n') + '\n' + decorator;
    }

    return decorator;
  }

  /**
   * 프로퍼티 생성 - 모든 DB 컬럼을 TypeScript 프로퍼티로 변환
   *
   * 📋 변환 대상:
   * 1. 일반 컬럼: 데이터 타입에 따른 TypeScript 타입 매핑
   * 2. Primary Key 컬럼: @PrimaryGeneratedColumn 또는 @PrimaryColumn
   * 3. 외래키 컬럼: 일반 컬럼으로 처리 (관계는 별도 생성)
   * 4. 날짜 컬럼: @CreateDateColumn, @UpdateDateColumn 자동 감지
   *
   * 💡 snake_case → camelCase 자동 변환 및 name 매핑
   */
  private generateProperties(table: TableInfo): string {
    // 모든 컬럼을 포함 (외래키 컬럼도 Entity 필드로 필요함)
    return table.columns
      .map((column) => {
        return this.generateColumnProperty(column, table);
      })
      .join('\n\n');
  }

  /**
   * 개별 컬럼 프로퍼티 생성
   */
  private generateColumnProperty(column: ColumnInfo, table: TableInfo): string {
    const propertyName = this.toCamelCase(column.columnName);
    const typeInfo = this.getTypeScriptType(column);
    const decorators = this.generateColumnDecorators(column, table);
    const comment =
      this.options.includeComments && column.columnComment
        ? `  /**\n   * ${column.columnComment}\n   */\n`
        : '';

    return `${comment}${decorators}
  ${propertyName}${typeInfo.nullable ? '?' : ''}: ${typeInfo.type};`;
  }

  /**
   * 컬럼 데코레이터 생성 (snake_case 매핑 및 인덱스 포함)
   */
  private generateColumnDecorators(
    column: ColumnInfo,
    table?: TableInfo,
  ): string {
    const decorators: string[] = [];

    if (column.isPrimaryKey) {
      if (column.isAutoIncrement) {
        // snake_case 매핑 추가
        const nameMapping =
          column.columnName !== this.toCamelCase(column.columnName)
            ? `{ name: '${column.columnName}' }`
            : '';
        decorators.push(`  @PrimaryGeneratedColumn(${nameMapping})`);
      } else {
        const typeOptions = this.getColumnTypeOptionsWithName(column);
        decorators.push(`  @PrimaryColumn(${typeOptions})`);
      }
    } else {
      // 특별한 날짜 컬럼 처리
      if (
        column.columnName.toLowerCase().includes('created') &&
        (column.dataType.includes('timestamp') ||
          column.dataType.includes('datetime'))
      ) {
        const nameMapping =
          column.columnName !== this.toCamelCase(column.columnName)
            ? `{ name: '${column.columnName}' }`
            : '';
        decorators.push(`  @CreateDateColumn(${nameMapping})`);
      } else if (
        column.columnName.toLowerCase().includes('updated') &&
        (column.dataType.includes('timestamp') ||
          column.dataType.includes('datetime'))
      ) {
        const nameMapping =
          column.columnName !== this.toCamelCase(column.columnName)
            ? `{ name: '${column.columnName}' }`
            : '';
        decorators.push(`  @UpdateDateColumn(${nameMapping})`);
      } else {
        const typeOptions = this.getColumnTypeOptionsWithName(column);
        decorators.push(`  @Column(${typeOptions})`);
      }
    }

    // 인덱스 추가 (Primary Key가 아닌 경우) - 테이블의 인덱스 정보에서 확인
    if (table) {
      const hasIndex = table.indexes?.some(
        (idx) => idx.columnName === column.columnName && !idx.isPrimary,
      );

      if (hasIndex && !column.isPrimaryKey) {
        decorators.push(`  @Index('idx_${column.columnName}')`);
      }
    }

    return decorators.join('\n');
  }

  /**
   * 컬럼 타입 옵션 생성 (snake_case 매핑 포함)
   */
  private getColumnTypeOptionsWithName(column: ColumnInfo): string {
    const options: string[] = [];

    // snake_case 매핑 추가
    if (column.columnName !== this.toCamelCase(column.columnName)) {
      options.push(`name: '${column.columnName}'`);
    }

    // 기존 옵션들 추가 (name 속성 제외)
    const existingOptions = this.getColumnTypeOptions(column);
    if (existingOptions && existingOptions !== '{}') {
      // 기존 옵션에서 중괄호 제거하고 내용만 추출
      const innerOptions = existingOptions.replace(/^\{|\}$/g, '').trim();
      if (innerOptions) {
        // name 속성이 이미 추가되었으므로 중복 방지
        const filteredOptions = innerOptions
          .split(',')
          .map((opt) => opt.trim())
          .filter((opt) => !opt.startsWith('name:'))
          .join(', ');
        if (filteredOptions) {
          options.push(filteredOptions);
        }
      }
    }

    return options.length > 0 ? `{ ${options.join(', ')} }` : '{}';
  }

  /**
   * 컬럼 타입 옵션 생성
   */
  private getColumnTypeOptions(column: ColumnInfo): string {
    const options: string[] = [];

    // 데이터 타입
    if (this.needsExplicitType(column)) {
      options.push(`type: '${column.dataType}'`);
    }

    // 길이
    if (column.maxLength && this.needsLength(column)) {
      options.push(`length: ${column.maxLength}`);
    }

    // Nullable
    if (column.isNullable && !column.isPrimaryKey) {
      options.push('nullable: true');
    }

    // Default 값
    if (column.columnDefault !== null && column.columnDefault !== 'NULL') {
      const defaultValue = this.formatDefaultValue(
        column.columnDefault,
        column.dataType,
      );
      if (defaultValue) {
        options.push(`default: ${defaultValue}`);
      }
    }

    // ENUM 값
    if (column.enumValues && column.enumValues.length > 0) {
      const enumStr = column.enumValues.map((val) => `'${val}'`).join(', ');
      options.push(`enum: [${enumStr}]`);
    }

    // Precision과 Scale (decimal, numeric 타입)
    if (
      column.numericPrecision &&
      ['decimal', 'numeric'].includes(column.dataType)
    ) {
      options.push(`precision: ${column.numericPrecision}`);
      if (column.numericScale) {
        options.push(`scale: ${column.numericScale}`);
      }
    }

    // 컬럼명이 프로퍼티명과 다른 경우
    const propertyName = this.toCamelCase(column.columnName);
    if (propertyName !== column.columnName) {
      options.push(`name: '${column.columnName}'`);
    }

    // 코멘트
    if (this.options.includeComments && column.columnComment) {
      options.push(`comment: '${column.columnComment.replace(/'/g, "\\'")}'`);
    }

    return options.length > 0 ? `{ ${options.join(', ')} }` : '';
  }

  /**
   * TypeScript 타입 정보 반환
   */
  private getTypeScriptType(column: ColumnInfo): {
    type: string;
    nullable: boolean;
  } {
    let type: string;

    // @CreateDateColumn과 @UpdateDateColumn은 항상 값이 존재하므로 nullable이 아님
    const isDateColumn =
      (column.columnName.toLowerCase().includes('created') ||
        column.columnName.toLowerCase().includes('updated')) &&
      (column.dataType.includes('timestamp') ||
        column.dataType.includes('datetime'));

    const nullable = column.isNullable && !column.isPrimaryKey && !isDateColumn;

    switch (column.dataType.toLowerCase()) {
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
        type = 'number';
        break;

      case 'varchar':
      case 'char':
      case 'text':
      case 'tinytext':
      case 'mediumtext':
      case 'longtext':
      case 'json':
        type = 'string';
        break;

      case 'enum':
        if (column.enumValues && column.enumValues.length > 0) {
          type = column.enumValues.map((val) => `'${val}'`).join(' | ');
        } else {
          type = 'string';
        }
        break;

      case 'boolean':
      case 'bool':
        type = 'boolean';
        break;

      case 'date':
      case 'datetime':
      case 'timestamp':
      case 'time':
        type = 'Date';
        break;

      case 'blob':
      case 'tinyblob':
      case 'mediumblob':
      case 'longblob':
      case 'binary':
      case 'varbinary':
        type = 'Buffer';
        break;

      default:
        type = 'any';
        console.warn(
          `⚠️ Unknown data type: ${column.dataType} for column ${column.columnName}`,
        );
    }

    return { type, nullable };
  }

  /**
   * 관계 생성 - 외래키 기반 TypeORM 관계 매핑 자동 생성
   *
   * 🔗 생성 관계 종류:
   * 1. @ManyToOne: 외래키 컬럼 기반 (이 테이블 → 참조 테이블)
   * 2. @OneToMany: 역방향 관계 (참조 테이블 → 이 테이블)
   * 3. 자기 참조: parent-children 관계 (계층형 구조)
   *
   * 💡 자동 설정:
   * - @JoinColumn: 외래키 컬럼 명 매핑
   * - onDelete: 'CASCADE' 기본 설정
   * - 의미있는 프로퍼티 이름 생성 (tb_ 접두사 제거)
   */
  private generateRelations(table: TableInfo): string {
    if (!this.options.generateRelations) {
      return '';
    }

    const relations: string[] = [];

    // ManyToOne 관계 생성 (외래키 기반)
    table.foreignKeys.forEach((fk) => {
      const targetEntity = this.toPascalCase(fk.referencedTableName) + 'Entity';

      // 자기 참조인 경우 특별 처리
      const isSelfReference = fk.referencedTableName === table.tableName;
      let propertyName: string;
      let inverseProperty: string;

      if (isSelfReference) {
        propertyName = 'parent';
        inverseProperty = 'children';
      } else {
        // tb_ 접두사 제거하고 의미있는 이름 사용
        const cleanTableName = fk.referencedTableName.replace(/^tb_/, '');
        propertyName = this.toCamelCase(cleanTableName);
        inverseProperty = `${this.toCamelCase(table.tableName.replace(/^tb_/, ''))}s`;
      }

      relations.push(`
  @ManyToOne(() => ${targetEntity}, (${this.toCamelCase(fk.referencedTableName.replace(/^tb_/, ''))}) => ${this.toCamelCase(fk.referencedTableName.replace(/^tb_/, ''))}.${inverseProperty}, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: '${fk.columnName}' })
  ${propertyName}: ${targetEntity};`);
    });

    // OneToMany 관계 생성 (역방향 관계)
    this.schemaResult.tables.forEach((otherTable) => {
      otherTable.foreignKeys.forEach((fk) => {
        if (fk.referencedTableName === table.tableName) {
          const targetEntity =
            this.toPascalCase(otherTable.tableName) + 'Entity';

          // 자기 참조인 경우
          if (otherTable.tableName === table.tableName) {
            relations.push(`
  @OneToMany(() => ${targetEntity}, (${this.toCamelCase(otherTable.tableName.replace(/^tb_/, ''))}) => ${this.toCamelCase(otherTable.tableName.replace(/^tb_/, ''))}.parent)
  children: ${targetEntity}[];`);
          } else {
            // tb_ 접두사 제거하고 의미있는 이름 사용
            const cleanTableName = otherTable.tableName.replace(/^tb_/, '');
            const propertyName = `${this.toCamelCase(cleanTableName)}s`;
            const cleanCurrentTable = table.tableName.replace(/^tb_/, '');

            relations.push(`
  @OneToMany(() => ${targetEntity}, (${this.toCamelCase(cleanTableName)}) => ${this.toCamelCase(cleanTableName)}.${this.toCamelCase(cleanCurrentTable)})
  ${propertyName}: ${targetEntity}[];`);
          }
        }
      });
    });

    return relations.join('\n');
  }

  /**
   * index.ts 파일 업데이트 - 모든 Entity 자동 export 및 ALL_ENTITIES 배열 생성
   *
   * 📦 생성 내용:
   * 1. 개별 Entity export: export * from './table-name.entity'
   * 2. Entity import: ALL_ENTITIES 배열용 import 문
   * 3. ALL_ENTITIES 배열: TypeORM 설정에서 사용할 모든 Entity 배열
   * 4. 메타데이터: 환경, 테이블 수 등 정보
   *
   * 💡 자동화 목적: 새 Entity 추가 시 수동 import 불필요
   */
  private async updateIndexFile(): Promise<void> {
    const indexPath = path.join(this.options.outputDir, 'index.ts');

    // 모든 엔티티 export 문 생성
    const exports = this.schemaResult.tables
      .map((table) => {
        const fileName = this.toKebabCase(table.tableName);
        return `export * from './${fileName}.entity';`;
      })
      .sort();

    // ALL_ENTITIES 배열 생성
    const entityNames = this.schemaResult.tables
      .map((table) => this.toPascalCase(table.tableName) + 'Entity')
      .sort();

    const imports = entityNames
      .map(
        (name) =>
          `import { ${name} } from './${this.toKebabCase(name.replace('Entity', ''))}.entity';`,
      )
      .join('\n');

    const content = `// 🤖 Auto-generated entity exports
// Environment: ${this.schemaResult.database.environment}
// Tables: ${this.schemaResult.tables.length}

${exports.join('\n')}

// 🚀 자동화를 위한 엔티티 배열 export
${imports}

/**
 * 모든 엔티티 배열 - 자동 생성됨
 * 새 엔티티가 DB에 추가되면 자동으로 여기에 포함됩니다.
 */
export const ALL_ENTITIES = [
${entityNames.map((name) => `  ${name},`).join('\n')}
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
      console.log('📝 Updated entities index.ts file');
    } else {
      console.log('✅ Entities index.ts is already up to date');
    }
  }

  /**
   * 롤백 실행
   */
  private async rollback(): Promise<void> {
    if (!this.backupDir) return;

    try {
      console.log('🔄 Rolling back changes...');

      // 생성된 파일들 삭제
      for (const file of this.generatedFiles) {
        const filePath = path.join(this.options.outputDir, file);
        await fs.unlink(filePath).catch(() => {}); // 에러 무시
      }

      // 백업에서 복원
      await this.copyDirectory(this.backupDir, this.options.outputDir);

      // 백업 디렉토리 삭제
      await fs.rm(this.backupDir, { recursive: true, force: true });

      console.log('✅ Rollback completed');
    } catch (error) {
      console.error('❌ Rollback failed:', error);
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
    // 이미 camelCase인 경우 그대로 반환
    if (!/[_-]/.test(str) && /^[a-z][a-zA-Z0-9]*$/.test(str)) {
      return str;
    }

    // snake_case나 kebab-case인 경우 변환
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase()
      .replace(/_/g, '-');
  }

  private needsExplicitType(column: ColumnInfo): boolean {
    const explicitTypes = [
      'text',
      'mediumtext',
      'longtext',
      'json',
      'decimal',
      'numeric',
    ];
    return explicitTypes.includes(column.dataType.toLowerCase());
  }

  private needsLength(column: ColumnInfo): boolean {
    const lengthTypes = ['varchar', 'char'];
    return lengthTypes.includes(column.dataType.toLowerCase());
  }

  private formatDefaultValue(
    defaultValue: string,
    dataType: string,
  ): string | null {
    if (!defaultValue || defaultValue === 'NULL') return null;

    // 문자열 타입
    if (['varchar', 'char', 'text', 'enum'].includes(dataType.toLowerCase())) {
      return `'${defaultValue.replace(/'/g, "\\'")}'`;
    }

    // 숫자 타입
    if (
      ['int', 'integer', 'decimal', 'float', 'double'].includes(
        dataType.toLowerCase(),
      )
    ) {
      return defaultValue;
    }

    // 불린 타입
    if (['boolean', 'bool'].includes(dataType.toLowerCase())) {
      return defaultValue === '1' || defaultValue.toLowerCase() === 'true'
        ? 'true'
        : 'false';
    }

    // 함수 호출 (CURRENT_TIMESTAMP 등)
    if (defaultValue.includes('()')) {
      return `() => '${defaultValue}'`;
    }

    return `'${defaultValue}'`;
  }
}

/**
 * CLI 실행 함수
 */
async function main() {
  const schemaFile = process.argv[2];
  const outputDir = process.argv[3] || 'libs/database/src/entities';

  if (!schemaFile) {
    console.error(
      '❌ Usage: ts-node enhanced-entity-generator.ts <schema-file> [output-dir]',
    );
    process.exit(1);
  }

  try {
    console.log(`🚀 Loading schema from: ${schemaFile}`);

    const schemaContent = await fs.readFile(schemaFile, 'utf-8');
    const schemaResult: SchemaAnalysisResult = JSON.parse(schemaContent);

    const options: EntityGenerationOptions = {
      outputDir,
      backup: true,
      overwrite: true,
      includeComments: true,
      generateRelations: true,
      useStrictTypes: true,
    };

    const generator = new EnhancedEntityGenerator(schemaResult, options);
    await generator.generateEntities();

    console.log('🎉 Entity generation completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Entity generation failed:', error);
    process.exit(1);
  }
}

// CLI에서 직접 실행되는 경우
if (require.main === module) {
  main().catch(console.error);
}

export { EnhancedEntityGenerator, EntityGenerationOptions };
