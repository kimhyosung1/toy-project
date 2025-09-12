#!/usr/bin/env ts-node

import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';

interface TableColumn {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  columnKey: string;
  extra: string;
  columnDefault: string | null;
  characterMaximumLength: number | null;
  numericPrecision: number | null;
  numericScale: number | null;
  columnComment: string;
}

interface TableInfo {
  tableName: string;
  columns: TableColumn[];
  indexes: IndexInfo[];
  foreignKeys: ForeignKeyInfo[];
}

interface IndexInfo {
  indexName: string;
  columnName: string;
  isUnique: boolean;
  isPrimary: boolean;
}

interface ForeignKeyInfo {
  constraintName: string;
  columnName: string;
  referencedTableName: string;
  referencedColumnName: string;
  onDelete: string;
  onUpdate: string;
}

interface StoredProcedureInfo {
  name: string;
  parameters: SPParameterInfo[];
  returnType: string;
  body: string;
}

interface SPParameterInfo {
  name: string;
  type: string;
  mode: 'IN' | 'OUT' | 'INOUT';
}

/**
 * MySQL 데이터베이스 스키마 분석기
 * 테이블, 컬럼, 인덱스, 외래키, 스토어드 프로시저 정보를 추출
 */
export class MySQLSchemaAnalyzer {
  private connection: mysql.Connection;

  constructor(
    private config: {
      host: string;
      port: number;
      user: string;
      password: string;
      database: string;
    },
  ) {}

  async connect(): Promise<void> {
    this.connection = await mysql.createConnection(this.config);
    console.log(`✅ Connected to MySQL database: ${this.config.database}`);
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      console.log('🔌 Disconnected from MySQL');
    }
  }

  /**
   * 모든 테이블 정보 분석
   */
  async analyzeTables(): Promise<TableInfo[]> {
    console.log('🔍 Analyzing database tables...');

    const [tables] = await this.connection.execute(
      `
      SELECT TABLE_NAME as tableName 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `,
      [this.config.database],
    );

    const tableInfos: TableInfo[] = [];

    for (const table of tables as any[]) {
      const tableName = table.tableName;
      console.log(`  📋 Analyzing table: ${tableName}`);

      const columns = await this.getTableColumns(tableName);
      const indexes = await this.getTableIndexes(tableName);
      const foreignKeys = await this.getTableForeignKeys(tableName);

      tableInfos.push({
        tableName,
        columns,
        indexes,
        foreignKeys,
      });
    }

    console.log(`✅ Analyzed ${tableInfos.length} tables`);
    return tableInfos;
  }

  /**
   * 테이블 컬럼 정보 조회
   */
  private async getTableColumns(tableName: string): Promise<TableColumn[]> {
    const [columns] = await this.connection.execute(
      `
      SELECT 
        COLUMN_NAME as columnName,
        DATA_TYPE as dataType,
        IS_NULLABLE as isNullable,
        COLUMN_KEY as columnKey,
        EXTRA as extra,
        COLUMN_DEFAULT as columnDefault,
        CHARACTER_MAXIMUM_LENGTH as characterMaximumLength,
        NUMERIC_PRECISION as numericPrecision,
        NUMERIC_SCALE as numericScale,
        COLUMN_COMMENT as columnComment
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `,
      [this.config.database, tableName],
    );

    return (columns as any[]).map((col) => ({
      ...col,
      isNullable: col.isNullable === 'YES',
    }));
  }

  /**
   * 테이블 인덱스 정보 조회
   */
  private async getTableIndexes(tableName: string): Promise<IndexInfo[]> {
    const [indexes] = await this.connection.execute(
      `
      SELECT 
        INDEX_NAME as indexName,
        COLUMN_NAME as columnName,
        NON_UNIQUE = 0 as isUnique,
        INDEX_NAME = 'PRIMARY' as isPrimary
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY INDEX_NAME, SEQ_IN_INDEX
    `,
      [this.config.database, tableName],
    );

    return indexes as IndexInfo[];
  }

  /**
   * 테이블 외래키 정보 조회
   */
  private async getTableForeignKeys(
    tableName: string,
  ): Promise<ForeignKeyInfo[]> {
    const [foreignKeys] = await this.connection.execute(
      `
      SELECT 
        CONSTRAINT_NAME as constraintName,
        COLUMN_NAME as columnName,
        REFERENCED_TABLE_NAME as referencedTableName,
        REFERENCED_COLUMN_NAME as referencedColumnName,
        DELETE_RULE as onDelete,
        UPDATE_RULE as onUpdate
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
      JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc 
        ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME 
        AND kcu.CONSTRAINT_SCHEMA = rc.CONSTRAINT_SCHEMA
      WHERE kcu.TABLE_SCHEMA = ? AND kcu.TABLE_NAME = ?
        AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
    `,
      [this.config.database, tableName],
    );

    return foreignKeys as ForeignKeyInfo[];
  }

  /**
   * 스토어드 프로시저 분석
   */
  async analyzeStoredProcedures(): Promise<StoredProcedureInfo[]> {
    console.log('🔍 Analyzing stored procedures...');

    const [procedures] = await this.connection.execute(
      `
      SELECT 
        ROUTINE_NAME as name,
        ROUTINE_DEFINITION as body,
        DTD_IDENTIFIER as returnType
      FROM INFORMATION_SCHEMA.ROUTINES 
      WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = 'PROCEDURE'
      ORDER BY ROUTINE_NAME
    `,
      [this.config.database],
    );

    const procedureInfos: StoredProcedureInfo[] = [];

    for (const proc of procedures as any[]) {
      console.log(`  📦 Analyzing procedure: ${proc.name}`);

      const parameters = await this.getProcedureParameters(proc.name);

      procedureInfos.push({
        name: proc.name,
        parameters,
        returnType: proc.returnType || 'void',
        body: proc.body,
      });
    }

    console.log(`✅ Analyzed ${procedureInfos.length} stored procedures`);
    return procedureInfos;
  }

  /**
   * 스토어드 프로시저 파라미터 정보 조회
   */
  private async getProcedureParameters(
    procedureName: string,
  ): Promise<SPParameterInfo[]> {
    const [parameters] = await this.connection.execute(
      `
      SELECT 
        PARAMETER_NAME as name,
        DATA_TYPE as type,
        PARAMETER_MODE as mode
      FROM INFORMATION_SCHEMA.PARAMETERS 
      WHERE SPECIFIC_SCHEMA = ? AND SPECIFIC_NAME = ?
        AND PARAMETER_NAME IS NOT NULL
      ORDER BY ORDINAL_POSITION
    `,
      [this.config.database, procedureName],
    );

    return parameters as SPParameterInfo[];
  }

  /**
   * 데이터베이스 버전 및 메타 정보 조회
   */
  async getDatabaseInfo(): Promise<any> {
    const [versionResult] = await this.connection.execute(
      'SELECT VERSION() as version',
    );
    const [schemaResult] = await this.connection.execute(
      `
      SELECT 
        COUNT(*) as tableCount
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'
    `,
      [this.config.database],
    );

    const [procResult] = await this.connection.execute(
      `
      SELECT 
        COUNT(*) as procedureCount
      FROM INFORMATION_SCHEMA.ROUTINES 
      WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = 'PROCEDURE'
    `,
      [this.config.database],
    );

    return {
      version: (versionResult as any[])[0].version,
      database: this.config.database,
      tableCount: (schemaResult as any[])[0].tableCount,
      procedureCount: (procResult as any[])[0].procedureCount,
      analyzedAt: new Date().toISOString(),
    };
  }

  /**
   * 스키마 정보를 JSON 파일로 저장
   */
  async saveSchemaToFile(outputPath: string): Promise<void> {
    const [tables, procedures, dbInfo] = await Promise.all([
      this.analyzeTables(),
      this.analyzeStoredProcedures(),
      this.getDatabaseInfo(),
    ]);

    const schema = {
      database: dbInfo,
      tables,
      procedures,
    };

    await fs.writeFile(outputPath, JSON.stringify(schema, null, 2), 'utf8');
    console.log(`💾 Schema saved to: ${outputPath}`);
  }
}

// CLI 실행 지원
if (require.main === module) {
  async function main() {
    const config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'toy_project',
    };

    const analyzer = new MySQLSchemaAnalyzer(config);

    try {
      await analyzer.connect();

      const outputPath = path.join(__dirname, '../../temp/db-schema.json');
      await analyzer.saveSchemaToFile(outputPath);

      console.log('🎉 Database schema analysis completed!');
    } catch (error) {
      console.error('❌ Error analyzing database:', error);
      process.exit(1);
    } finally {
      await analyzer.disconnect();
    }
  }

  main();
}
