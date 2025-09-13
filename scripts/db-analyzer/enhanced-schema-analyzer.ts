#!/usr/bin/env ts-node

import * as mysql from 'mysql2/promise';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * 🚀 Enhanced Database Schema Analyzer - MySQL DB 구조 실시간 분석 시스템
 *
 * 📋 핵심 기능:
 * - 테이블 스키마 분석 및 Entity 생성 정보 수집 (INFORMATION_SCHEMA 활용)
 * - Stored Procedure/Function 분석 (파라미터, 반환타입, 본문 포함)
 * - 인덱스, 외래키, 제약조건 분석 (관계 매핑용)
 * - 에러 핸들링 및 롤백 기능 (안전한 DB 연결 관리)
 * - 환경별 설정 지원 (dev/qa/prod 구분)
 *
 * 🔄 분석 원리:
 * - MySQL INFORMATION_SCHEMA 테이블을 통한 메타데이터 수집
 * - 비동기 병렬 처리로 성능 최적화
 * - 전체 DB 구조를 JSON 형태로 직렬화
 * - 에러 발생 시 안전한 연결 종료
 */

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

interface ColumnInfo {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  columnDefault: string | null;
  isPrimaryKey: boolean;
  isAutoIncrement: boolean;
  maxLength: number | null;
  numericPrecision: number | null;
  numericScale: number | null;
  columnComment: string;
  enumValues?: string[];
}

interface IndexInfo {
  indexName: string;
  columnName: string;
  isUnique: boolean;
  isPrimary: boolean;
  indexType: string;
  cardinality: number;
}

interface ForeignKeyInfo {
  constraintName: string;
  columnName: string;
  referencedTableName: string;
  referencedColumnName: string;
  updateRule: string;
  deleteRule: string;
}

interface TableInfo {
  tableName: string;
  tableComment: string;
  engine: string;
  collation: string;
  columns: ColumnInfo[];
  indexes: IndexInfo[];
  foreignKeys: ForeignKeyInfo[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProcedureInfo {
  name: string;
  type: 'PROCEDURE' | 'FUNCTION';
  definer: string;
  created: Date;
  modified: Date;
  sqlMode: string;
  comment: string;
  characterSetClient: string;
  collationConnection: string;
  databaseCollation: string;
  body: string;
  parameters: ProcedureParameter[];
  returnType?: string;
}

interface ProcedureParameter {
  name: string;
  mode: 'IN' | 'OUT' | 'INOUT';
  dataType: string;
  maxLength?: number;
}

interface DatabaseMetadata {
  version: string;
  database: string;
  tableCount: number;
  procedureCount: number;
  functionCount: number;
  analyzedAt: string;
  environment: string;
}

interface SchemaAnalysisResult {
  database: DatabaseMetadata;
  tables: TableInfo[];
  procedures: ProcedureInfo[];
  functions: ProcedureInfo[];
}

class EnhancedSchemaAnalyzer {
  private connection: mysql.Connection;
  private config: DatabaseConfig;
  private environment: string;

  constructor(config: DatabaseConfig, environment: string = 'dev') {
    this.config = config;
    this.environment = environment;
  }

  /**
   * 데이터베이스 연결 초기화 - MySQL 연결 설정 및 연결 테스트
   *
   * 🔗 연결 설정:
   * - MySQL 2.x 드라이버 사용
   * - multipleStatements: true (복수 쿼리 실행 지원)
   * - 환경별 DB 설정 (host, port, user, password, database)
   *
   * ⚠️ 에러 처리: 연결 실패 시 상세 에러 메시지 출력
   */
  async connect(): Promise<void> {
    try {
      this.connection = await mysql.createConnection({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        multipleStatements: true,
      });

      console.log(
        `✅ Connected to ${this.environment} database: ${this.config.database}`,
      );
    } catch (error) {
      console.error(`❌ Failed to connect to database:`, error);
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  /**
   * 연결 종료
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      console.log('🔌 Database connection closed');
    }
  }

  /**
   * 전체 스키마 분석 실행 - DB 전체 구조 종합 분석
   *
   * 🔄 분석 순서 (병렬 처리):
   * 1. 테이블 분석: 모든 테이블의 컬럼, 인덱스, 외래키 정보
   * 2. 저장 프로시저 분석: 파라미터, 본문, 메타데이터
   * 3. 함수 분석: 반환타입, 파라미터, 본문
   * 4. DB 메타데이터: 버전, 환경 정보
   *
   * 💡 성능 최적화: Promise.all로 병렬 처리
   */
  async analyzeSchema(): Promise<SchemaAnalysisResult> {
    try {
      console.log('🔍 Starting comprehensive schema analysis...');

      const [tables, procedures, functions, dbInfo] = await Promise.all([
        this.analyzeTables(),
        this.analyzeProcedures(),
        this.analyzeFunctions(),
        this.getDatabaseInfo(),
      ]);

      const result: SchemaAnalysisResult = {
        database: {
          ...dbInfo,
          tableCount: tables.length,
          procedureCount: procedures.length,
          functionCount: functions.length,
          environment: this.environment,
        },
        tables,
        procedures,
        functions,
      };

      console.log(`✅ Schema analysis completed:`);
      console.log(`   📊 Tables: ${tables.length}`);
      console.log(`   🔧 Procedures: ${procedures.length}`);
      console.log(`   ⚙️ Functions: ${functions.length}`);

      return result;
    } catch (error) {
      console.error('❌ Schema analysis failed:', error);
      throw error;
    }
  }

  /**
   * 테이블 정보 분석 - 모든 테이블의 상세 구조 분석
   *
   * 📋 분석 대상:
   * 1. 테이블 기본 정보: 이름, 코멘트, 엔진, 콜레이션
   * 2. 컬럼 정보: 데이터 타입, NULL 여부, 기본값, 제약조건
   * 3. 인덱스 정보: Primary Key, Unique, 일반 인덱스
   * 4. 외래키 정보: 참조 테이블, 업데이트/삭제 규칙
   *
   * 🔄 처리 방식: 각 테이블별로 병렬 처리로 성능 최적화
   */
  private async analyzeTables(): Promise<TableInfo[]> {
    const [tableRows] = await this.connection.execute(
      `
      SELECT 
        TABLE_NAME as tableName,
        TABLE_COMMENT as tableComment,
        ENGINE as engine,
        TABLE_COLLATION as collation,
        CREATE_TIME as createdAt,
        UPDATE_TIME as updatedAt
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
        AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `,
      [this.config.database],
    );

    const tables: TableInfo[] = [];

    for (const table of tableRows as any[]) {
      console.log(`   📋 Analyzing table: ${table.tableName}`);

      const [columns, indexes, foreignKeys] = await Promise.all([
        this.getTableColumns(table.tableName),
        this.getTableIndexes(table.tableName),
        this.getTableForeignKeys(table.tableName),
      ]);

      tables.push({
        tableName: table.tableName,
        tableComment: table.tableComment || '',
        engine: table.engine,
        collation: table.collation,
        columns,
        indexes,
        foreignKeys,
        createdAt: table.createdAt,
        updatedAt: table.updatedAt,
      });
    }

    return tables;
  }

  /**
   * 테이블 컬럼 정보 조회 - INFORMATION_SCHEMA.COLUMNS를 통한 컬럼 메타데이터 수집
   *
   * 📋 수집 정보:
   * 1. 컬럼 기본 정보: 이름, 데이터 타입, NULL 허용 여부
   * 2. 제약조건: Primary Key, Auto Increment, 기본값
   * 3. 데이터 타입 세부: 최대 길이, 정밀도, 스케일
   * 4. 코멘트 및 ENUM 값: 문서화 및 유효값 정보
   *
   * 💡 ENUM 처리: COLUMN_TYPE에서 enum('value1','value2') 형태 파싱
   */
  private async getTableColumns(tableName: string): Promise<ColumnInfo[]> {
    const [rows] = await this.connection.execute(
      `
      SELECT 
        COLUMN_NAME as columnName,
        DATA_TYPE as dataType,
        IS_NULLABLE as isNullable,
        COLUMN_DEFAULT as columnDefault,
        COLUMN_KEY as columnKey,
        EXTRA as extra,
        CHARACTER_MAXIMUM_LENGTH as maxLength,
        NUMERIC_PRECISION as numericPrecision,
        NUMERIC_SCALE as numericScale,
        COLUMN_COMMENT as columnComment,
        COLUMN_TYPE as columnType
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `,
      [this.config.database, tableName],
    );

    return (rows as any[]).map((row) => {
      // ENUM 값 추출
      let enumValues: string[] | undefined;
      if (row.dataType === 'enum') {
        const enumMatch = row.columnType.match(/enum\((.+)\)/);
        if (enumMatch) {
          enumValues = enumMatch[1]
            .split(',')
            .map((val: string) => val.trim().replace(/'/g, ''));
        }
      }

      return {
        columnName: row.columnName,
        dataType: row.dataType,
        isNullable: row.isNullable === 'YES',
        columnDefault: row.columnDefault,
        isPrimaryKey: row.columnKey === 'PRI',
        isAutoIncrement: row.extra.includes('auto_increment'),
        maxLength: row.maxLength,
        numericPrecision: row.numericPrecision,
        numericScale: row.numericScale,
        columnComment: row.columnComment || '',
        enumValues,
      };
    });
  }

  /**
   * 테이블 인덱스 정보 조회 - INFORMATION_SCHEMA.STATISTICS를 통한 인덱스 메타데이터 수집
   *
   * 📋 수집 정보:
   * 1. 인덱스 기본 정보: 이름, 컬럼명, 인덱스 타입
   * 2. 인덱스 속성: Unique 여부, Primary Key 여부
   * 3. 성능 정보: Cardinality (인덱스 선택도)
   *
   * 💡 활용: Entity 생성 시 @Index 데코레이터 자동 추가
   */
  private async getTableIndexes(tableName: string): Promise<IndexInfo[]> {
    const [rows] = await this.connection.execute(
      `
      SELECT 
        INDEX_NAME as indexName,
        COLUMN_NAME as columnName,
        NON_UNIQUE as nonUnique,
        INDEX_TYPE as indexType,
        CARDINALITY as cardinality
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY INDEX_NAME, SEQ_IN_INDEX
    `,
      [this.config.database, tableName],
    );

    return (rows as any[]).map((row) => ({
      indexName: row.indexName,
      columnName: row.columnName,
      isUnique: row.nonUnique === 0,
      isPrimary: row.indexName === 'PRIMARY',
      indexType: row.indexType,
      cardinality: row.cardinality || 0,
    }));
  }

  /**
   * 테이블 외래키 정보 조회 - INFORMATION_SCHEMA 조인으로 외래키 관계 수집
   *
   * 🔗 수집 정보:
   * 1. 외래키 기본 정보: 제약조건명, 컬럼명
   * 2. 참조 정보: 참조 테이블명, 참조 컬럼명
   * 3. 참조 무결성 규칙: UPDATE_RULE, DELETE_RULE (CASCADE, RESTRICT 등)
   *
   * 🔄 조인 쿼리:
   * - KEY_COLUMN_USAGE: 외래키 컬럼 정보
   * - REFERENTIAL_CONSTRAINTS: 참조 무결성 규칙
   *
   * 💡 활용: Entity 관계 매핑 (@ManyToOne, @OneToMany) 자동 생성
   */
  private async getTableForeignKeys(
    tableName: string,
  ): Promise<ForeignKeyInfo[]> {
    const [rows] = await this.connection.execute(
      `
      SELECT 
        kcu.CONSTRAINT_NAME as constraintName,
        kcu.COLUMN_NAME as columnName,
        kcu.REFERENCED_TABLE_NAME as referencedTableName,
        kcu.REFERENCED_COLUMN_NAME as referencedColumnName,
        rc.UPDATE_RULE as updateRule,
        rc.DELETE_RULE as deleteRule
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
      JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc 
        ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME 
        AND kcu.CONSTRAINT_SCHEMA = rc.CONSTRAINT_SCHEMA
      WHERE kcu.TABLE_SCHEMA = ? 
        AND kcu.TABLE_NAME = ?
        AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
      ORDER BY kcu.ORDINAL_POSITION
    `,
      [this.config.database, tableName],
    );

    return (rows as any[]).map((row) => ({
      constraintName: row.constraintName,
      columnName: row.columnName,
      referencedTableName: row.referencedTableName,
      referencedColumnName: row.referencedColumnName,
      updateRule: row.updateRule,
      deleteRule: row.deleteRule,
    }));
  }

  /**
   * Stored Procedure 분석 - INFORMATION_SCHEMA.ROUTINES를 통한 저장 프로시저 메타데이터 수집
   *
   * 📋 수집 정보:
   * 1. 프로시저 기본 정보: 이름, 타입, 생성자, 생성/수정 일시
   * 2. 실행 환경: SQL_MODE, 문자열 인코딩, 콜레이션
   * 3. 프로시저 본문: ROUTINE_DEFINITION (전체 SQL 코드)
   * 4. 파라미터 정보: 별도 메서드로 수집
   *
   * 💡 활용: 개별 .sql 파일로 추출하여 버전 관리 및 배포 지원
   */
  private async analyzeProcedures(): Promise<ProcedureInfo[]> {
    const [rows] = await this.connection.execute(
      `
      SELECT 
        ROUTINE_NAME as name,
        ROUTINE_TYPE as type,
        DEFINER as definer,
        CREATED as created,
        LAST_ALTERED as modified,
        SQL_MODE as sqlMode,
        ROUTINE_COMMENT as comment,
        CHARACTER_SET_CLIENT as characterSetClient,
        COLLATION_CONNECTION as collationConnection,
        DATABASE_COLLATION as databaseCollation,
        ROUTINE_DEFINITION as body,
        DTD_IDENTIFIER as returnType
      FROM INFORMATION_SCHEMA.ROUTINES 
      WHERE ROUTINE_SCHEMA = ? 
        AND ROUTINE_TYPE = 'PROCEDURE'
      ORDER BY ROUTINE_NAME
    `,
      [this.config.database],
    );

    const procedures: ProcedureInfo[] = [];

    for (const row of rows as any[]) {
      console.log(`   🔧 Analyzing procedure: ${row.name}`);

      const parameters = await this.getProcedureParameters(row.name);

      procedures.push({
        name: row.name,
        type: 'PROCEDURE',
        definer: row.definer,
        created: row.created,
        modified: row.modified,
        sqlMode: row.sqlMode,
        comment: row.comment || '',
        characterSetClient: row.characterSetClient,
        collationConnection: row.collationConnection,
        databaseCollation: row.databaseCollation,
        body: row.body,
        parameters,
      });
    }

    return procedures;
  }

  /**
   * Function 분석 - INFORMATION_SCHEMA.ROUTINES를 통한 사용자 정의 함수 메타데이터 수집
   *
   * 📋 수집 정보:
   * 1. 함수 기본 정보: 이름, 생성자, 생성/수정 일시
   * 2. 반환 타입: DTD_IDENTIFIER (함수 반환 데이터 타입)
   * 3. 실행 환경: SQL_MODE, 문자열 인코딩, 콜레이션
   * 4. 함수 본문: ROUTINE_DEFINITION (전체 SQL 코드)
   * 5. 파라미터 정보: 별도 메서드로 수집
   *
   * 💡 활용: 개별 .sql 파일로 추출하여 재사용 가능한 비즈니스 로직 관리
   */
  private async analyzeFunctions(): Promise<ProcedureInfo[]> {
    const [rows] = await this.connection.execute(
      `
      SELECT 
        ROUTINE_NAME as name,
        ROUTINE_TYPE as type,
        DEFINER as definer,
        CREATED as created,
        LAST_ALTERED as modified,
        SQL_MODE as sqlMode,
        ROUTINE_COMMENT as comment,
        CHARACTER_SET_CLIENT as characterSetClient,
        COLLATION_CONNECTION as collationConnection,
        DATABASE_COLLATION as databaseCollation,
        ROUTINE_DEFINITION as body,
        DTD_IDENTIFIER as returnType
      FROM INFORMATION_SCHEMA.ROUTINES 
      WHERE ROUTINE_SCHEMA = ? 
        AND ROUTINE_TYPE = 'FUNCTION'
      ORDER BY ROUTINE_NAME
    `,
      [this.config.database],
    );

    const functions: ProcedureInfo[] = [];

    for (const row of rows as any[]) {
      console.log(`   ⚙️ Analyzing function: ${row.name}`);

      const parameters = await this.getProcedureParameters(row.name);

      functions.push({
        name: row.name,
        type: 'FUNCTION',
        definer: row.definer,
        created: row.created,
        modified: row.modified,
        sqlMode: row.sqlMode,
        comment: row.comment || '',
        characterSetClient: row.characterSetClient,
        collationConnection: row.collationConnection,
        databaseCollation: row.databaseCollation,
        body: row.body,
        parameters,
        returnType: row.returnType,
      });
    }

    return functions;
  }

  /**
   * Procedure/Function 파라미터 정보 조회 - INFORMATION_SCHEMA.PARAMETERS를 통한 파라미터 메타데이터 수집
   *
   * 📋 수집 정보:
   * 1. 파라미터 기본 정보: 이름, 모드 (IN/OUT/INOUT)
   * 2. 데이터 타입: DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
   * 3. 순서 정보: ORDINAL_POSITION (파라미터 순서)
   *
   * 💡 활용:
   * - SQL 파일 생성 시 정확한 파라미터 선언
   * - 문서화 시 파라미터 설명 자동 생성
   * - 타입 안전성 검증
   */
  private async getProcedureParameters(
    routineName: string,
  ): Promise<ProcedureParameter[]> {
    const [rows] = await this.connection.execute(
      `
      SELECT 
        PARAMETER_NAME as name,
        PARAMETER_MODE as mode,
        DATA_TYPE as dataType,
        CHARACTER_MAXIMUM_LENGTH as maxLength
      FROM INFORMATION_SCHEMA.PARAMETERS 
      WHERE SPECIFIC_SCHEMA = ? 
        AND SPECIFIC_NAME = ?
        AND PARAMETER_NAME IS NOT NULL
      ORDER BY ORDINAL_POSITION
    `,
      [this.config.database, routineName],
    );

    return (rows as any[]).map((row) => ({
      name: row.name,
      mode: row.mode || 'IN',
      dataType: row.dataType,
      maxLength: row.maxLength,
    }));
  }

  /**
   * 데이터베이스 메타 정보 조회 - DB 버전 및 기본 정보 수집
   *
   * 📋 수집 정보:
   * 1. MySQL 버전: VERSION() 함수 결과
   * 2. 데이터베이스 이름: 설정된 DB 이름
   * 3. 분석 시간: 현재 시간 (ISO 8601 형식)
   *
   * 💡 활용:
   * - 버전 호환성 체크
   * - 분석 결과 메타데이터
   * - 환경별 구분 정보
   */
  private async getDatabaseInfo(): Promise<
    Omit<
      DatabaseMetadata,
      'tableCount' | 'procedureCount' | 'functionCount' | 'environment'
    >
  > {
    const [versionResult] = await this.connection.execute(
      'SELECT VERSION() as version',
    );
    const version = (versionResult as any[])[0].version;

    return {
      version,
      database: this.config.database,
      analyzedAt: new Date().toISOString(),
    };
  }

  /**
   * 분석 결과를 파일로 저장 - JSON 형태로 직렬화 및 요약 정보 생성
   *
   * 💾 저장 파일:
   * 1. 전체 분석 결과: {environment}-schema.json
   * 2. 요약 정보: {environment}-schema-summary.json
   *
   * 📋 요약 정보 내용:
   * - 환경, DB 이름, 분석 시간
   * - 테이블, 프로시저, 함수 개수
   * - 테이블/프로시저/함수 이름 목록
   *
   * 💡 활용: 다른 도구에서 분석 결과 재사용
   */
  async saveAnalysisResult(
    result: SchemaAnalysisResult,
    outputPath: string,
  ): Promise<void> {
    try {
      // 디렉토리 생성
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      // JSON 파일로 저장
      await fs.writeFile(outputPath, JSON.stringify(result, null, 2), 'utf-8');

      console.log(`💾 Analysis result saved to: ${outputPath}`);

      // 요약 정보도 별도 저장
      const summaryPath = outputPath.replace('.json', '-summary.json');
      const summary = {
        environment: this.environment,
        database: result.database.database,
        analyzedAt: result.database.analyzedAt,
        counts: {
          tables: result.tables.length,
          procedures: result.procedures.length,
          functions: result.functions.length,
        },
        tableNames: result.tables.map((t) => t.tableName).sort(),
        procedureNames: result.procedures.map((p) => p.name).sort(),
        functionNames: result.functions.map((f) => f.name).sort(),
      };

      await fs.writeFile(
        summaryPath,
        JSON.stringify(summary, null, 2),
        'utf-8',
      );
      console.log(`📋 Summary saved to: ${summaryPath}`);
    } catch (error) {
      console.error('❌ Failed to save analysis result:', error);
      throw error;
    }
  }
}

/**
 * CLI 실행 함수
 */
async function main() {
  const environment = process.argv[2] || process.env.NODE_ENV || 'dev';
  const outputDir = process.argv[3] || 'temp';

  console.log(
    `🚀 Starting Enhanced Schema Analysis for ${environment} environment`,
  );

  // 환경 변수에서 DB 설정 읽기
  const config: DatabaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'test',
  };

  const analyzer = new EnhancedSchemaAnalyzer(config, environment);

  try {
    // 데이터베이스 연결
    await analyzer.connect();

    // 스키마 분석 실행
    const result = await analyzer.analyzeSchema();

    // 결과 저장
    const outputPath = path.join(outputDir, `${environment}-schema.json`);
    await analyzer.saveAnalysisResult(result, outputPath);

    console.log('🎉 Enhanced schema analysis completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Schema analysis failed:', error);
    process.exit(1);
  } finally {
    await analyzer.disconnect();
  }
}

// CLI에서 직접 실행되는 경우
if (require.main === module) {
  main().catch(console.error);
}

export {
  EnhancedSchemaAnalyzer,
  SchemaAnalysisResult,
  TableInfo,
  ProcedureInfo,
  ColumnInfo,
  IndexInfo,
  ForeignKeyInfo,
  ProcedureParameter,
  DatabaseMetadata,
};
