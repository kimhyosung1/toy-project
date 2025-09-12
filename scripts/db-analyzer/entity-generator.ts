#!/usr/bin/env ts-node

import fs from 'fs/promises';
import path from 'path';
import { TableInfo, TableColumn } from './schema-analyzer';

/**
 * TypeORM Entity 자동 생성기
 * MySQL 스키마 정보를 기반으로 TypeScript Entity 클래스 생성
 */
export class EntityGenerator {
  private outputDir: string;

  constructor(outputDir: string = 'libs/database/src/entities') {
    this.outputDir = outputDir;
  }

  /**
   * 모든 테이블에 대한 Entity 생성
   */
  async generateEntities(tables: TableInfo[]): Promise<void> {
    console.log(`🚀 Generating ${tables.length} entities...`);

    // entities 디렉토리 생성
    await fs.mkdir(this.outputDir, { recursive: true });

    const entityFiles: string[] = [];

    for (const table of tables) {
      const entityContent = this.generateEntityContent(table);
      const fileName = this.getEntityFileName(table.tableName);
      const filePath = path.join(this.outputDir, fileName);

      await fs.writeFile(filePath, entityContent, 'utf8');
      console.log(`  ✅ Generated: ${fileName}`);

      entityFiles.push(fileName.replace('.ts', ''));
    }

    // index.ts 파일 생성
    await this.generateIndexFile(entityFiles);

    console.log('🎉 All entities generated successfully!');
  }

  /**
   * 단일 Entity 클래스 내용 생성
   */
  private generateEntityContent(table: TableInfo): string {
    const className = this.getEntityClassName(table.tableName);
    const imports = this.generateImports(table);
    const classDecorators = this.generateClassDecorators(table);
    const properties = this.generateProperties(table);
    const relations = this.generateRelations(table);

    return `${imports}

${classDecorators}
export class ${className} {
${properties}${relations}
}
`;
  }

  /**
   * Import 문 생성
   */
  private generateImports(table: TableInfo): string {
    const imports = new Set<string>([
      'Entity',
      'PrimaryGeneratedColumn',
      'Column',
    ]);

    // 타임스탬프 컬럼이 있으면 추가
    const hasCreatedAt = table.columns.some(
      (col) =>
        col.columnName.toLowerCase().includes('created') &&
        col.dataType.includes('timestamp'),
    );
    const hasUpdatedAt = table.columns.some(
      (col) =>
        col.columnName.toLowerCase().includes('updated') &&
        col.dataType.includes('timestamp'),
    );

    if (hasCreatedAt) imports.add('CreateDateColumn');
    if (hasUpdatedAt) imports.add('UpdateDateColumn');

    // 인덱스가 있으면 추가
    if (table.indexes.length > 0) imports.add('Index');

    // 외래키가 있으면 관계 어노테이션 추가
    if (table.foreignKeys.length > 0) {
      imports.add('ManyToOne');
      imports.add('JoinColumn');
    }

    // 유니크 제약조건 체크
    const hasUnique = table.indexes.some(
      (idx) => idx.isUnique && !idx.isPrimary,
    );
    if (hasUnique) imports.add('Unique');

    return `import {
  ${Array.from(imports).sort().join(',\n  ')},
} from 'typeorm';`;
  }

  /**
   * 클래스 데코레이터 생성
   */
  private generateClassDecorators(table: TableInfo): string {
    let decorators = `@Entity('${table.tableName}')`;

    // 유니크 제약조건 추가
    const uniqueIndexes = table.indexes.filter(
      (idx) => idx.isUnique && !idx.isPrimary,
    );
    if (uniqueIndexes.length > 0) {
      const uniqueGroups = this.groupIndexesByName(uniqueIndexes);
      for (const [indexName, columns] of uniqueGroups) {
        const columnNames = columns
          .map((col) => `'${col.columnName}'`)
          .join(', ');
        decorators += `\n@Unique('${indexName}', [${columnNames}])`;
      }
    }

    return decorators;
  }

  /**
   * 프로퍼티 생성
   */
  private generateProperties(table: TableInfo): string {
    const properties: string[] = [];

    for (const column of table.columns) {
      const property = this.generateProperty(column, table);
      properties.push(property);
    }

    return properties.join('\n\n');
  }

  /**
   * 단일 프로퍼티 생성
   */
  private generateProperty(column: TableColumn, table: TableInfo): string {
    const propertyName = this.toCamelCase(column.columnName);
    const typeInfo = this.getTypeScriptType(column);
    const decorators = this.generatePropertyDecorators(column, table);

    return `  ${decorators}
  ${propertyName}: ${typeInfo.type};`;
  }

  /**
   * 프로퍼티 데코레이터 생성
   */
  private generatePropertyDecorators(
    column: TableColumn,
    table: TableInfo,
  ): string {
    const decorators: string[] = [];

    // Primary Key
    if (column.columnKey === 'PRI' && column.extra.includes('auto_increment')) {
      decorators.push('@PrimaryGeneratedColumn()');
    } else if (column.columnKey === 'PRI') {
      decorators.push("@PrimaryGeneratedColumn('uuid')");
    }

    // 일반 컬럼
    if (column.columnKey !== 'PRI') {
      // 타임스탬프 컬럼 특별 처리
      if (
        column.columnName.toLowerCase().includes('created') &&
        column.dataType.includes('timestamp')
      ) {
        decorators.push('@CreateDateColumn()');
      } else if (
        column.columnName.toLowerCase().includes('updated') &&
        column.dataType.includes('timestamp')
      ) {
        decorators.push('@UpdateDateColumn()');
      } else {
        const columnOptions = this.generateColumnOptions(column);
        decorators.push(`@Column(${columnOptions})`);
      }
    }

    // 인덱스
    const indexes = table.indexes.filter(
      (idx) => idx.columnName === column.columnName && !idx.isPrimary,
    );
    for (const index of indexes) {
      if (!index.isUnique) {
        // 유니크는 클래스 레벨에서 처리
        decorators.push(`@Index('${index.indexName}')`);
      }
    }

    return decorators.join('\n  ');
  }

  /**
   * 컬럼 옵션 생성
   */
  private generateColumnOptions(column: TableColumn): string {
    const options: string[] = [];

    // 데이터 타입
    const typeMapping = this.getColumnTypeMapping(column);
    if (typeMapping.type) {
      options.push(`type: '${typeMapping.type}'`);
    }

    // 길이
    if (column.characterMaximumLength) {
      options.push(`length: ${column.characterMaximumLength}`);
    }

    // Nullable
    if (column.isNullable) {
      options.push('nullable: true');
    }

    // Default 값
    if (column.columnDefault !== null) {
      const defaultValue = this.formatDefaultValue(
        column.columnDefault,
        column.dataType,
      );
      if (defaultValue) {
        options.push(`default: ${defaultValue}`);
      }
    }

    // 정밀도 (decimal, numeric)
    if (column.numericPrecision && column.numericScale !== null) {
      options.push(`precision: ${column.numericPrecision}`);
      options.push(`scale: ${column.numericScale}`);
    }

    // 코멘트
    if (column.columnComment) {
      options.push(`comment: '${column.columnComment.replace(/'/g, "\\'")}'`);
    }

    return options.length > 0 ? `{ ${options.join(', ')} }` : '';
  }

  /**
   * 관계 생성 (외래키 기반)
   */
  private generateRelations(table: TableInfo): string {
    if (table.foreignKeys.length === 0) return '';

    const relations: string[] = [];

    for (const fk of table.foreignKeys) {
      const relation = this.generateRelation(fk, table);
      relations.push(relation);
    }

    return relations.length > 0 ? '\n\n' + relations.join('\n\n') : '';
  }

  /**
   * 단일 관계 생성
   */
  private generateRelation(fk: any, table: TableInfo): string {
    const referencedEntityName = this.getEntityClassName(
      fk.referencedTableName,
    );
    const propertyName = this.toCamelCase(fk.referencedTableName);
    const columnName = fk.columnName;

    const onDeleteClause = fk.onDelete ? `onDelete: '${fk.onDelete}'` : '';
    const onUpdateClause = fk.onUpdate ? `onUpdate: '${fk.onUpdate}'` : '';
    const options = [onDeleteClause, onUpdateClause].filter(Boolean).join(', ');

    return `  @ManyToOne(() => ${referencedEntityName}, ${options ? `{ ${options} }` : ''})
  @JoinColumn({ name: '${columnName}' })
  ${propertyName}: ${referencedEntityName};`;
  }

  /**
   * TypeScript 타입 매핑
   */
  private getTypeScriptType(column: TableColumn): {
    type: string;
    import?: string;
  } {
    const baseType = this.getColumnTypeMapping(column).tsType;
    const nullable = column.isNullable ? ' | null' : '';

    return {
      type: baseType + nullable,
    };
  }

  /**
   * MySQL 타입을 TypeScript/TypeORM 타입으로 매핑
   */
  private getColumnTypeMapping(column: TableColumn): {
    type?: string;
    tsType: string;
  } {
    const dataType = column.dataType.toLowerCase();

    const typeMap: Record<string, { type?: string; tsType: string }> = {
      // 정수형
      tinyint: { type: 'tinyint', tsType: 'number' },
      smallint: { type: 'smallint', tsType: 'number' },
      mediumint: { type: 'mediumint', tsType: 'number' },
      int: { type: 'int', tsType: 'number' },
      integer: { type: 'int', tsType: 'number' },
      bigint: { type: 'bigint', tsType: 'string' }, // JS는 bigint를 string으로 처리

      // 부동소수점
      float: { type: 'float', tsType: 'number' },
      double: { type: 'double', tsType: 'number' },
      decimal: { type: 'decimal', tsType: 'string' },
      numeric: { type: 'decimal', tsType: 'string' },

      // 문자열
      char: { type: 'char', tsType: 'string' },
      varchar: { type: 'varchar', tsType: 'string' },
      text: { type: 'text', tsType: 'string' },
      tinytext: { type: 'tinytext', tsType: 'string' },
      mediumtext: { type: 'mediumtext', tsType: 'string' },
      longtext: { type: 'longtext', tsType: 'string' },

      // 날짜/시간
      date: { type: 'date', tsType: 'Date' },
      datetime: { type: 'datetime', tsType: 'Date' },
      timestamp: { type: 'timestamp', tsType: 'Date' },
      time: { type: 'time', tsType: 'string' },
      year: { type: 'year', tsType: 'number' },

      // 바이너리
      binary: { type: 'binary', tsType: 'Buffer' },
      varbinary: { type: 'varbinary', tsType: 'Buffer' },
      blob: { type: 'blob', tsType: 'Buffer' },
      tinyblob: { type: 'tinyblob', tsType: 'Buffer' },
      mediumblob: { type: 'mediumblob', tsType: 'Buffer' },
      longblob: { type: 'longblob', tsType: 'Buffer' },

      // 기타
      json: { type: 'json', tsType: 'any' },
      enum: { type: 'enum', tsType: 'string' },
      set: { type: 'set', tsType: 'string' },
      boolean: { type: 'boolean', tsType: 'boolean' },
      bit: { type: 'bit', tsType: 'number' },
    };

    return typeMap[dataType] || { type: 'varchar', tsType: 'any' };
  }

  /**
   * 기본값 포맷팅
   */
  private formatDefaultValue(
    defaultValue: string,
    dataType: string,
  ): string | null {
    if (!defaultValue || defaultValue === 'NULL') return null;

    const lowerDataType = dataType.toLowerCase();

    // 문자열 타입
    if (lowerDataType.includes('char') || lowerDataType.includes('text')) {
      return `'${defaultValue.replace(/'/g, "\\'")}'`;
    }

    // 숫자 타입
    if (
      lowerDataType.includes('int') ||
      lowerDataType.includes('float') ||
      lowerDataType.includes('double') ||
      lowerDataType.includes('decimal')
    ) {
      return defaultValue;
    }

    // 불린 타입
    if (lowerDataType.includes('boolean') || lowerDataType.includes('bit')) {
      return defaultValue === '1' ? 'true' : 'false';
    }

    // 날짜 함수들
    if (
      defaultValue.includes('CURRENT_TIMESTAMP') ||
      defaultValue.includes('NOW()')
    ) {
      return '() => "CURRENT_TIMESTAMP"';
    }

    return `'${defaultValue}'`;
  }

  /**
   * 유틸리티 메서드들
   */
  private getEntityClassName(tableName: string): string {
    // tb_ 접두사 제거 후 PascalCase로 변환
    const cleanName = tableName.replace(/^tb_/, '');
    const pascalCase = this.toPascalCase(cleanName);
    return pascalCase + 'Entity';
  }

  private getEntityFileName(tableName: string): string {
    const cleanName = tableName.replace(/^tb_/, '');
    const kebabCase = cleanName.replace(/_/g, '-');
    return kebabCase + '.entity.ts';
  }

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

  private groupIndexesByName(indexes: any[]): Map<string, any[]> {
    const groups = new Map<string, any[]>();
    for (const index of indexes) {
      if (!groups.has(index.indexName)) {
        groups.set(index.indexName, []);
      }
      groups.get(index.indexName)!.push(index);
    }
    return groups;
  }

  /**
   * index.ts 파일 생성
   */
  private async generateIndexFile(entityFiles: string[]): Promise<void> {
    const exports = entityFiles
      .map((file) => `export * from './${file}';`)
      .sort()
      .join('\n');

    const content = `// Auto-generated entity exports
// Generated at: ${new Date().toISOString()}

${exports}
`;

    const indexPath = path.join(this.outputDir, 'index.ts');
    await fs.writeFile(indexPath, content, 'utf8');
    console.log('  ✅ Generated: index.ts');
  }
}

// CLI 실행 지원
if (require.main === module) {
  async function main() {
    const schemaPath =
      process.argv[2] || path.join(__dirname, '../../temp/db-schema.json');
    const outputDir = process.argv[3] || 'libs/database/src/entities';

    try {
      const schemaContent = await fs.readFile(schemaPath, 'utf8');
      const schema = JSON.parse(schemaContent);

      const generator = new EntityGenerator(outputDir);
      await generator.generateEntities(schema.tables);

      console.log('🎉 Entity generation completed!');
    } catch (error) {
      console.error('❌ Error generating entities:', error);
      process.exit(1);
    }
  }

  main();
}
