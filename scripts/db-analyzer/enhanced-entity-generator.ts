#!/usr/bin/env ts-node

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  SchemaAnalysisResult,
  TableInfo,
  ColumnInfo,
} from './enhanced-schema-analyzer';

/**
 * 🏗️ Enhanced Entity Generator
 *
 * 기능:
 * - TypeORM Entity 클래스 자동 생성
 * - 관계 매핑 자동 설정
 * - 인덱스 및 제약조건 적용
 * - 타입 안전성 보장
 * - 백업 및 롤백 기능
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
   * Entity 생성 실행
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

    // 기존 파일 정리 (overwrite 옵션이 true인 경우)
    if (this.options.overwrite) {
      const files = await fs.readdir(this.options.outputDir);
      const entityFiles = files.filter(
        (file) => file.endsWith('.entity.ts') && file !== 'index.ts',
      );

      for (const file of entityFiles) {
        await fs.unlink(path.join(this.options.outputDir, file));
        console.log(`🗑️ Removed existing file: ${file}`);
      }
    }
  }

  /**
   * 개별 Entity 파일 생성
   */
  private async generateEntityFile(table: TableInfo): Promise<void> {
    const entityName = this.toPascalCase(table.tableName);
    const fileName = `${this.toKebabCase(table.tableName)}.entity.ts`;
    const filePath = path.join(this.options.outputDir, fileName);

    console.log(`   📝 Generating ${entityName} -> ${fileName}`);

    const entityContent = this.generateEntityContent(table);

    await fs.writeFile(filePath, entityContent, 'utf-8');
    this.generatedFiles.push(fileName);
  }

  /**
   * Entity 클래스 내용 생성
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
   * Import 문 생성
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

    const importList = Array.from(imports).sort().join(', ');
    let importStatements = `import {\n  ${importList},\n} from 'typeorm';`;

    // 관계 Entity들의 import 추가
    if (this.options.generateRelations && table.foreignKeys.length > 0) {
      const relatedEntityImports = table.foreignKeys
        .map((fk) => {
          const entityName =
            this.toPascalCase(fk.referencedTableName) + 'Entity';
          const fileName = this.toKebabCase(fk.referencedTableName);

          // 자기 참조인 경우 import 하지 않음
          if (fk.referencedTableName === table.tableName) {
            return null;
          }

          return `import { ${entityName} } from './${fileName}.entity';`;
        })
        .filter((imp) => imp !== null) // null 제거
        .filter((imp, index, arr) => arr.indexOf(imp) === index) // 중복 제거
        .join('\n');

      if (relatedEntityImports) {
        importStatements += '\n' + relatedEntityImports;
      }
    }

    return importStatements;
  }

  /**
   * 클래스 데코레이터 생성
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
   * 프로퍼티 생성
   */
  private generateProperties(table: TableInfo): string {
    // 외래키 컬럼들은 관계에서 처리하므로 제외
    const foreignKeyColumns = table.foreignKeys.map((fk) => fk.columnName);

    return table.columns
      .filter((column) => {
        // 외래키 컬럼은 관계에서만 사용하고 별도 프로퍼티로 생성하지 않음
        return !foreignKeyColumns.includes(column.columnName);
      })
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
    const decorators = this.generateColumnDecorators(column);
    const comment =
      this.options.includeComments && column.columnComment
        ? `  /**\n   * ${column.columnComment}\n   */\n`
        : '';

    return `${comment}${decorators}
  ${propertyName}${typeInfo.nullable ? '?' : ''}: ${typeInfo.type};`;
  }

  /**
   * 컬럼 데코레이터 생성
   */
  private generateColumnDecorators(column: ColumnInfo): string {
    const decorators: string[] = [];

    if (column.isPrimaryKey) {
      if (column.isAutoIncrement) {
        decorators.push('  @PrimaryGeneratedColumn()');
      } else {
        const typeOptions = this.getColumnTypeOptions(column);
        decorators.push(`  @PrimaryColumn(${typeOptions})`);
      }
    } else {
      // 특별한 날짜 컬럼 처리
      if (
        column.columnName.toLowerCase().includes('created') &&
        (column.dataType.includes('timestamp') ||
          column.dataType.includes('datetime'))
      ) {
        decorators.push('  @CreateDateColumn()');
      } else if (
        column.columnName.toLowerCase().includes('updated') &&
        (column.dataType.includes('timestamp') ||
          column.dataType.includes('datetime'))
      ) {
        decorators.push('  @UpdateDateColumn()');
      } else {
        const typeOptions = this.getColumnTypeOptions(column);
        decorators.push(`  @Column(${typeOptions})`);
      }
    }

    return decorators.join('\n');
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
    const nullable = column.isNullable && !column.isPrimaryKey;

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
   * 관계 생성 (외래키 기반)
   */
  private generateRelations(table: TableInfo): string {
    if (!this.options.generateRelations || table.foreignKeys.length === 0) {
      return '';
    }

    const relations = table.foreignKeys.map((fk) => {
      const targetEntity = this.toPascalCase(fk.referencedTableName) + 'Entity';
      const propertyName = this.toCamelCase(fk.referencedTableName);
      const joinColumn = this.toCamelCase(fk.columnName);

      return `
  /**
   * ${fk.referencedTableName} 관계
   */
  @ManyToOne(() => ${targetEntity})
  @JoinColumn({ name: '${fk.columnName}' })
  ${propertyName}?: ${targetEntity};`;
    });

    return relations.join('\n');
  }

  /**
   * index.ts 파일 업데이트
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
// Generated at: ${new Date().toISOString()}
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

    await fs.writeFile(indexPath, content, 'utf-8');
    console.log('📝 Updated index.ts file');
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
