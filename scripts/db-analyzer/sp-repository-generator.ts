#!/usr/bin/env ts-node

import fs from 'fs/promises';
import path from 'path';

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
 * 스토어드 프로시저 기반 Repository 생성기
 * MySQL 스토어드 프로시저를 분석하여 TypeScript Repository 메서드 생성
 */
export class SPRepositoryGenerator {
  private outputDir: string;

  constructor(outputDir: string = 'libs/database/src/procedures') {
    this.outputDir = outputDir;
  }

  /**
   * 모든 스토어드 프로시저에 대한 Repository 생성
   */
  async generateSPRepositories(
    procedures: StoredProcedureInfo[],
  ): Promise<void> {
    console.log(
      `🚀 Generating repositories for ${procedures.length} stored procedures...`,
    );

    await fs.mkdir(this.outputDir, { recursive: true });

    // 도메인별로 프로시저 그룹핑
    const procedureGroups = this.groupProceduresByDomain(procedures);

    const repositoryFiles: string[] = [];

    for (const [domain, domainProcedures] of procedureGroups) {
      const repositoryContent = this.generateDomainRepository(
        domain,
        domainProcedures,
      );
      const fileName = `${domain}-sp.repository.ts`;
      const filePath = path.join(this.outputDir, fileName);

      await fs.writeFile(filePath, repositoryContent, 'utf8');
      console.log(`  ✅ Generated: ${fileName}`);

      repositoryFiles.push(fileName.replace('.ts', ''));
    }

    // 통합 SP 서비스 생성
    await this.generateSPService(procedureGroups);

    // index.ts 파일 생성
    await this.generateIndexFile(repositoryFiles);

    console.log('🎉 All SP repositories generated successfully!');
  }

  /**
   * 프로시저를 도메인별로 그룹핑
   */
  private groupProceduresByDomain(
    procedures: StoredProcedureInfo[],
  ): Map<string, StoredProcedureInfo[]> {
    const groups = new Map<string, StoredProcedureInfo[]>();

    for (const proc of procedures) {
      const domain = this.extractDomainFromProcedureName(proc.name);

      if (!groups.has(domain)) {
        groups.set(domain, []);
      }
      groups.get(domain)!.push(proc);
    }

    return groups;
  }

  /**
   * 프로시저 이름에서 도메인 추출
   */
  private extractDomainFromProcedureName(procName: string): string {
    // sp_board_get_list -> board
    // proc_user_create -> user
    // get_product_stats -> product

    const cleanName = procName
      .toLowerCase()
      .replace(/^(sp_|proc_|get_|set_|update_|delete_|create_)/, '');

    const parts = cleanName.split('_');
    return parts[0] || 'common';
  }

  /**
   * 도메인별 Repository 생성
   */
  private generateDomainRepository(
    domain: string,
    procedures: StoredProcedureInfo[],
  ): string {
    const className = this.toPascalCase(domain) + 'SPRepository';
    const imports = this.generateSPImports();
    const methods = procedures
      .map((proc) => this.generateSPMethod(proc))
      .join('\n\n');

    return `${imports}

/**
 * ${this.toPascalCase(domain)} 도메인 스토어드 프로시저 Repository
 * 
 * 자동 생성된 파일입니다.
 * 생성 시간: ${new Date().toISOString()}
 */
@Injectable()
export class ${className} {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

${methods}
}
`;
  }

  /**
   * SP Repository Import 생성
   */
  private generateSPImports(): string {
    return `import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';`;
  }

  /**
   * 단일 스토어드 프로시저 메서드 생성
   */
  private generateSPMethod(procedure: StoredProcedureInfo): string {
    const methodName = this.generateMethodName(procedure.name);
    const parameters = this.generateMethodParameters(procedure.parameters);
    const returnType = this.generateMethodReturnType(procedure);
    const implementation = this.generateMethodImplementation(procedure);
    const comments = this.generateMethodComments(procedure);

    return `${comments}
  async ${methodName}(${parameters}): Promise<${returnType}> {
${implementation}
  }`;
  }

  /**
   * 메서드 이름 생성
   */
  private generateMethodName(procName: string): string {
    // sp_board_get_list -> getBoardList
    // proc_user_create -> createUser
    // update_product_stats -> updateProductStats

    const cleanName = procName.toLowerCase().replace(/^(sp_|proc_)/, '');

    const parts = cleanName.split('_');
    const camelCase = parts
      .map((part, index) =>
        index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
      )
      .join('');

    return camelCase;
  }

  /**
   * 메서드 파라미터 생성
   */
  private generateMethodParameters(parameters: SPParameterInfo[]): string {
    const inParams = parameters.filter(
      (p) => p.mode === 'IN' || p.mode === 'INOUT',
    );

    if (inParams.length === 0) return '';

    const paramStrings = inParams.map((param) => {
      const paramName = this.toCamelCase(param.name.replace('@', ''));
      const tsType = this.mapSQLTypeToTS(param.type);
      return `${paramName}: ${tsType}`;
    });

    return paramStrings.join(', ');
  }

  /**
   * 메서드 반환 타입 생성
   */
  private generateMethodReturnType(procedure: StoredProcedureInfo): string {
    const outParams = procedure.parameters.filter(
      (p) => p.mode === 'OUT' || p.mode === 'INOUT',
    );

    if (outParams.length > 1) {
      // 여러 OUT 파라미터가 있는 경우 객체 타입 반환
      const returnFields = outParams.map((param) => {
        const fieldName = this.toCamelCase(param.name.replace('@', ''));
        const tsType = this.mapSQLTypeToTS(param.type);
        return `${fieldName}: ${tsType}`;
      });
      return `{ ${returnFields.join('; ')} }`;
    } else if (outParams.length === 1) {
      // 단일 OUT 파라미터
      return this.mapSQLTypeToTS(outParams[0].type);
    } else {
      // SELECT 결과를 반환하는 경우
      if (this.procedureReturnsResultSet(procedure)) {
        return 'any[]'; // 실제로는 더 구체적인 타입을 생성할 수 있음
      } else {
        return 'void';
      }
    }
  }

  /**
   * 메서드 구현부 생성
   */
  private generateMethodImplementation(procedure: StoredProcedureInfo): string {
    const procName = procedure.name;
    const inParams = procedure.parameters.filter(
      (p) => p.mode === 'IN' || p.mode === 'INOUT',
    );
    const outParams = procedure.parameters.filter(
      (p) => p.mode === 'OUT' || p.mode === 'INOUT',
    );

    // SQL 파라미터 준비
    const sqlParams = inParams.map((param) => {
      const paramName = this.toCamelCase(param.name.replace('@', ''));
      return paramName;
    });

    const paramPlaceholders = inParams.map(() => '?').join(', ');

    let implementation = `    try {
      const query = 'CALL ${procName}(${paramPlaceholders})';
      const result = await this.dataSource.query(query, [${sqlParams.join(', ')}]);
`;

    if (outParams.length > 0) {
      // OUT 파라미터가 있는 경우
      implementation += `
      // OUT 파라미터 추출
      const outputResult = result[result.length - 1][0] || {};
      return ${this.generateReturnStatement(outParams)};`;
    } else if (this.procedureReturnsResultSet(procedure)) {
      // SELECT 결과를 반환하는 경우
      implementation += `
      // 결과 집합 반환
      return result[0] || [];`;
    } else {
      // 단순 실행만 하는 경우
      implementation += `
      // 실행 완료
      return;`;
    }

    implementation += `
    } catch (error) {
      throw new Error(\`Failed to execute ${procName}: \${error.message}\`);
    }`;

    return implementation;
  }

  /**
   * Return 문 생성
   */
  private generateReturnStatement(outParams: SPParameterInfo[]): string {
    if (outParams.length === 1) {
      const paramName = this.toCamelCase(outParams[0].name.replace('@', ''));
      return `outputResult['${paramName}'] || outputResult['@${outParams[0].name}']`;
    } else {
      const fields = outParams.map((param) => {
        const fieldName = this.toCamelCase(param.name.replace('@', ''));
        return `${fieldName}: outputResult['${fieldName}'] || outputResult['@${param.name}']`;
      });
      return `{ ${fields.join(', ')} }`;
    }
  }

  /**
   * 메서드 주석 생성
   */
  private generateMethodComments(procedure: StoredProcedureInfo): string {
    const inParams = procedure.parameters.filter(
      (p) => p.mode === 'IN' || p.mode === 'INOUT',
    );
    const outParams = procedure.parameters.filter(
      (p) => p.mode === 'OUT' || p.mode === 'INOUT',
    );

    let comments = `  /**
   * ${procedure.name} 스토어드 프로시저 실행
   *`;

    if (inParams.length > 0) {
      comments += `
   * @param 입력 파라미터:`;
      inParams.forEach((param) => {
        const paramName = this.toCamelCase(param.name.replace('@', ''));
        comments += `
   * @param ${paramName} - ${param.type} (${param.mode})`;
      });
    }

    if (outParams.length > 0) {
      comments += `
   * @returns 출력 파라미터:`;
      outParams.forEach((param) => {
        const paramName = this.toCamelCase(param.name.replace('@', ''));
        comments += `
   *   - ${paramName}: ${param.type} (${param.mode})`;
      });
    }

    comments += `
   */`;

    return comments;
  }

  /**
   * 프로시저가 결과 집합을 반환하는지 확인
   */
  private procedureReturnsResultSet(procedure: StoredProcedureInfo): boolean {
    // 간단한 휴리스틱: SELECT 문이 있으면 결과 집합 반환
    return procedure.body && procedure.body.toLowerCase().includes('select');
  }

  /**
   * 통합 SP 서비스 생성
   */
  private async generateSPService(
    procedureGroups: Map<string, StoredProcedureInfo[]>,
  ): Promise<void> {
    const imports = Array.from(procedureGroups.keys())
      .map((domain) => {
        const className = this.toPascalCase(domain) + 'SPRepository';
        return `import { ${className} } from './${domain}-sp.repository';`;
      })
      .join('\n');

    const injections = Array.from(procedureGroups.keys())
      .map((domain) => {
        const className = this.toPascalCase(domain) + 'SPRepository';
        const propertyName = this.toCamelCase(domain) + 'SP';
        return `    public readonly ${propertyName}: ${className},`;
      })
      .join('\n');

    const content = `import { Injectable } from '@nestjs/common';
${imports}

/**
 * 통합 스토어드 프로시저 서비스
 * 모든 도메인의 SP Repository에 대한 통합 접근점
 * 
 * 자동 생성된 파일입니다.
 * 생성 시간: ${new Date().toISOString()}
 */
@Injectable()
export class StoredProcedureService {
  constructor(
${injections}
  ) {}

  /**
   * 모든 도메인의 SP Repository에 대한 접근
   */
  get repositories() {
    return {
${Array.from(procedureGroups.keys())
  .map((domain) => {
    const propertyName = this.toCamelCase(domain) + 'SP';
    return `      ${domain}: this.${propertyName},`;
  })
  .join('\n')}
    };
  }
}
`;

    const filePath = path.join(this.outputDir, 'stored-procedure.service.ts');
    await fs.writeFile(filePath, content, 'utf8');
    console.log('  ✅ Generated: stored-procedure.service.ts');
  }

  /**
   * SQL 타입을 TypeScript 타입으로 매핑
   */
  private mapSQLTypeToTS(sqlType: string): string {
    const lowerType = sqlType.toLowerCase();

    if (
      lowerType.includes('int') ||
      lowerType.includes('decimal') ||
      lowerType.includes('float') ||
      lowerType.includes('double')
    ) {
      return 'number';
    }
    if (lowerType.includes('char') || lowerType.includes('text')) {
      return 'string';
    }
    if (lowerType.includes('date') || lowerType.includes('time')) {
      return 'Date';
    }
    if (lowerType.includes('json')) {
      return 'any';
    }
    if (lowerType.includes('bool')) {
      return 'boolean';
    }

    return 'any';
  }

  /**
   * 유틸리티 메서드들
   */
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

  /**
   * index.ts 파일 생성
   */
  private async generateIndexFile(repositoryFiles: string[]): Promise<void> {
    const exports = [
      ...repositoryFiles.map((file) => `export * from './${file}';`),
      `export * from './stored-procedure.service';`,
    ]
      .sort()
      .join('\n');

    const content = `// Auto-generated stored procedure repository exports
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
    const outputDir = process.argv[3] || 'libs/database/src/procedures';

    try {
      const schemaContent = await fs.readFile(schemaPath, 'utf8');
      const schema = JSON.parse(schemaContent);

      const generator = new SPRepositoryGenerator(outputDir);
      await generator.generateSPRepositories(schema.procedures);

      console.log('🎉 SP Repository generation completed!');
    } catch (error) {
      console.error('❌ Error generating SP repositories:', error);
      process.exit(1);
    }
  }

  main();
}
