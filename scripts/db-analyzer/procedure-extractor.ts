#!/usr/bin/env ts-node

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  SchemaAnalysisResult,
  ProcedureInfo,
} from './enhanced-schema-analyzer';

/**
 * 🏪 Procedure & Function Extractor
 *
 * 기능:
 * - Stored Procedure를 .sql 파일로 추출
 * - Function을 .sql 파일로 추출
 * - 파라미터 정보와 함께 문서화
 * - 환경별 분리 저장
 * - 백업 및 버전 관리
 */

interface ProcedureExtractionOptions {
  outputDir: string;
  backup: boolean;
  overwrite: boolean;
  includeComments: boolean;
  separateByType: boolean;
  generateDocumentation: boolean;
}

interface ProcedureDocumentation {
  name: string;
  type: 'PROCEDURE' | 'FUNCTION';
  description: string;
  parameters: Array<{
    name: string;
    mode: string;
    type: string;
    description?: string;
  }>;
  returnType?: string;
  usage: string;
  examples: string[];
  createdAt: Date;
  modifiedAt: Date;
}

class ProcedureExtractor {
  private options: ProcedureExtractionOptions;
  private schemaResult: SchemaAnalysisResult;
  private generatedFiles: string[] = [];
  private backupDir?: string;

  constructor(
    schemaResult: SchemaAnalysisResult,
    options: ProcedureExtractionOptions,
  ) {
    this.schemaResult = schemaResult;
    this.options = options;
  }

  /**
   * Procedure/Function 추출 실행
   */
  async extractProcedures(): Promise<void> {
    try {
      console.log('🏪 Starting procedure and function extraction...');

      // 백업 생성
      if (this.options.backup) {
        await this.createBackup();
      }

      // 출력 디렉토리 준비
      await this.prepareOutputDirectories();

      // Stored Procedures 추출
      if (this.schemaResult.procedures.length > 0) {
        await this.extractStoredProcedures();
      }

      // Functions 추출
      if (this.schemaResult.functions.length > 0) {
        await this.extractFunctions();
      }

      // 문서화 생성 - SSOT 정책에 따라 비활성화
      // if (this.options.generateDocumentation) {
      //   await this.generateDocumentation();
      // }

      // README 파일 생성 - SSOT 정책에 따라 비활성화
      // await this.generateReadme();

      console.log(
        `✅ Successfully extracted ${this.generatedFiles.length} procedure/function files`,
      );
      console.log('📋 Generated files:');
      this.generatedFiles.forEach((file) => console.log(`   - ${file}`));
    } catch (error) {
      console.error('❌ Procedure extraction failed:', error);

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
      `../.backup-procedures-${timestamp}`,
    );

    try {
      const proceduresDir = this.options.outputDir;
      const exists = await fs
        .access(proceduresDir)
        .then(() => true)
        .catch(() => false);

      if (exists) {
        await fs.mkdir(this.backupDir, { recursive: true });
        await this.copyDirectory(proceduresDir, this.backupDir);
        console.log(`📦 Procedures backup created: ${this.backupDir}`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to create procedures backup:', error);
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
  private async prepareOutputDirectories(): Promise<void> {
    await fs.mkdir(this.options.outputDir, { recursive: true });

    if (this.options.separateByType) {
      await fs.mkdir(path.join(this.options.outputDir, 'procedures'), {
        recursive: true,
      });
      await fs.mkdir(path.join(this.options.outputDir, 'functions'), {
        recursive: true,
      });
    }

    // 문서화 디렉토리
    if (this.options.generateDocumentation) {
      await fs.mkdir(path.join(this.options.outputDir, 'docs'), {
        recursive: true,
      });
    }

    // 기존 파일 정리 (overwrite 옵션이 true인 경우)
    if (this.options.overwrite) {
      await this.cleanupExistingFiles();
    }
  }

  /**
   * 기존 파일 정리
   */
  private async cleanupExistingFiles(): Promise<void> {
    const cleanupDirs = [this.options.outputDir];

    if (this.options.separateByType) {
      cleanupDirs.push(
        path.join(this.options.outputDir, 'procedures'),
        path.join(this.options.outputDir, 'functions'),
      );
    }

    for (const dir of cleanupDirs) {
      try {
        const files = await fs.readdir(dir);
        const sqlFiles = files.filter((file) => file.endsWith('.sql'));

        for (const file of sqlFiles) {
          await fs.unlink(path.join(dir, file));
          console.log(`🗑️ Removed existing file: ${file}`);
        }
      } catch (error) {
        // 디렉토리가 없는 경우 무시
      }
    }
  }

  /**
   * Stored Procedures 추출
   */
  private async extractStoredProcedures(): Promise<void> {
    console.log(
      `🔧 Extracting ${this.schemaResult.procedures.length} stored procedures...`,
    );

    const outputDir = this.options.separateByType
      ? path.join(this.options.outputDir, 'procedures')
      : this.options.outputDir;

    for (const procedure of this.schemaResult.procedures) {
      await this.extractProcedure(procedure, outputDir);
    }
  }

  /**
   * Functions 추출
   */
  private async extractFunctions(): Promise<void> {
    console.log(
      `⚙️ Extracting ${this.schemaResult.functions.length} functions...`,
    );

    const outputDir = this.options.separateByType
      ? path.join(this.options.outputDir, 'functions')
      : this.options.outputDir;

    for (const func of this.schemaResult.functions) {
      await this.extractFunction(func, outputDir);
    }
  }

  /**
   * 개별 Procedure 추출
   */
  private async extractProcedure(
    procedure: ProcedureInfo,
    outputDir: string,
  ): Promise<void> {
    const fileName = `${procedure.name.toLowerCase()}.sql`;
    const filePath = path.join(outputDir, fileName);

    console.log(`   🔧 Extracting procedure: ${procedure.name} -> ${fileName}`);

    const content = this.generateProcedureContent(procedure);

    // 기존 파일과 내용이 다른 경우에만 업데이트
    let shouldUpdate = true;
    try {
      const existingContent = await fs.readFile(filePath, 'utf-8');
      shouldUpdate = existingContent !== content;
    } catch {
      // 파일이 없으면 생성
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      await fs.writeFile(filePath, content, 'utf-8');
      console.log(`   📝 Updated ${fileName}`);
    } else {
      console.log(`   ✅ ${fileName} is already up to date`);
    }

    this.generatedFiles.push(path.relative(this.options.outputDir, filePath));
  }

  /**
   * 개별 Function 추출
   */
  private async extractFunction(
    func: ProcedureInfo,
    outputDir: string,
  ): Promise<void> {
    const fileName = `${func.name.toLowerCase()}.sql`;
    const filePath = path.join(outputDir, fileName);

    console.log(`   ⚙️ Extracting function: ${func.name} -> ${fileName}`);

    const content = this.generateFunctionContent(func);

    // 기존 파일과 내용이 다른 경우에만 업데이트
    let shouldUpdate = true;
    try {
      const existingContent = await fs.readFile(filePath, 'utf-8');
      shouldUpdate = existingContent !== content;
    } catch {
      // 파일이 없으면 생성
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      await fs.writeFile(filePath, content, 'utf-8');
      console.log(`   📝 Updated ${fileName}`);
    } else {
      console.log(`   ✅ ${fileName} is already up to date`);
    }

    this.generatedFiles.push(path.relative(this.options.outputDir, filePath));
  }

  /**
   * Procedure SQL 내용 생성
   */
  private generateProcedureContent(procedure: ProcedureInfo): string {
    const header = this.generateHeader(procedure);
    const dropStatement = `DROP PROCEDURE IF EXISTS \`${procedure.name}\`;`;
    const delimiter = 'DELIMITER ;;';
    const body = this.formatProcedureBody(procedure);
    const delimiterReset = 'DELIMITER ;';

    return `${header}

${dropStatement}

${delimiter}

${body}

;;

${delimiterReset}
`;
  }

  /**
   * Function SQL 내용 생성
   */
  private generateFunctionContent(func: ProcedureInfo): string {
    const header = this.generateHeader(func);
    const dropStatement = `DROP FUNCTION IF EXISTS \`${func.name}\`;`;
    const delimiter = 'DELIMITER ;;';
    const body = this.formatFunctionBody(func);
    const delimiterReset = 'DELIMITER ;';

    return `${header}

${dropStatement}

${delimiter}

${body}

;;

${delimiterReset}
`;
  }

  /**
   * 파일 헤더 생성
   */
  private generateHeader(item: ProcedureInfo): string {
    if (!this.options.includeComments) {
      return `-- ${item.type}: ${item.name}`;
    }

    const parametersList =
      item.parameters.length > 0
        ? item.parameters
            .map((p) => `--   ${p.mode} ${p.name} ${p.dataType}`)
            .join('\n')
        : '--   (no parameters)';

    const returnInfo = item.returnType ? `-- Returns: ${item.returnType}` : '';

    return `-- ================================================================
-- ${item.type}: ${item.name}
-- ================================================================
--
-- Description: ${item.comment || 'No description available'}
--
-- Parameters:
${parametersList}
--
${returnInfo}
-- Created: ${item.created.toISOString()}
-- Modified: ${item.modified.toISOString()}
-- Environment: ${this.schemaResult.database.environment}
-- Database: ${this.schemaResult.database.database}
--
-- Generated by: Enhanced DB Schema Analyzer
-- ================================================================`;
  }

  /**
   * Procedure 본문 포맷팅
   */
  private formatProcedureBody(procedure: ProcedureInfo): string {
    // 파라미터 문자열 생성
    const parameterString =
      procedure.parameters.length > 0
        ? procedure.parameters
            .map((p) => {
              const mode = p.mode || 'IN';
              const length = p.maxLength ? `(${p.maxLength})` : '';
              return `${mode} \`${p.name}\` ${p.dataType}${length}`;
            })
            .join(',\n    ')
        : '';

    const parameters = parameterString ? `\n    ${parameterString}\n` : '';

    return `CREATE PROCEDURE \`${procedure.name}\`(${parameters})
BEGIN
${this.indentSqlBody(procedure.body)}
END`;
  }

  /**
   * Function 본문 포맷팅
   */
  private formatFunctionBody(func: ProcedureInfo): string {
    // 파라미터 문자열 생성
    const parameterString =
      func.parameters.length > 0
        ? func.parameters
            .map((p) => {
              const length = p.maxLength ? `(${p.maxLength})` : '';
              return `\`${p.name}\` ${p.dataType}${length}`;
            })
            .join(',\n    ')
        : '';

    const parameters = parameterString ? `\n    ${parameterString}\n` : '';
    const returnType = func.returnType || 'VARCHAR(255)';

    return `CREATE FUNCTION \`${func.name}\`(${parameters})
RETURNS ${returnType}
READS SQL DATA
DETERMINISTIC
BEGIN
${this.indentSqlBody(func.body)}
END`;
  }

  /**
   * SQL 본문 들여쓰기
   */
  private indentSqlBody(body: string): string {
    return body
      .split('\n')
      .map((line) => (line.trim() ? `    ${line}` : ''))
      .join('\n');
  }

  /**
   * 문서화 생성
   */
  private async generateDocumentation(): Promise<void> {
    console.log('📚 Generating procedure documentation...');

    const docsDir = path.join(this.options.outputDir, 'docs');

    // Procedures 문서
    if (this.schemaResult.procedures.length > 0) {
      await this.generateProceduresDocs(docsDir);
    }

    // Functions 문서
    if (this.schemaResult.functions.length > 0) {
      await this.generateFunctionsDocs(docsDir);
    }

    // 통합 인덱스 문서
    await this.generateIndexDocs(docsDir);
  }

  /**
   * Procedures 문서 생성
   */
  private async generateProceduresDocs(docsDir: string): Promise<void> {
    const content = this.generateProceduresMarkdown();
    const filePath = path.join(docsDir, 'procedures.md');

    await fs.writeFile(filePath, content, 'utf-8');
    this.generatedFiles.push(path.relative(this.options.outputDir, filePath));
  }

  /**
   * Functions 문서 생성
   */
  private async generateFunctionsDocs(docsDir: string): Promise<void> {
    const content = this.generateFunctionsMarkdown();
    const filePath = path.join(docsDir, 'functions.md');

    await fs.writeFile(filePath, content, 'utf-8');
    this.generatedFiles.push(path.relative(this.options.outputDir, filePath));
  }

  /**
   * 인덱스 문서 생성
   */
  private async generateIndexDocs(docsDir: string): Promise<void> {
    const content = this.generateIndexMarkdown();
    const filePath = path.join(docsDir, 'index.md');

    await fs.writeFile(filePath, content, 'utf-8');
    this.generatedFiles.push(path.relative(this.options.outputDir, filePath));
  }

  /**
   * Procedures 마크다운 생성
   */
  private generateProceduresMarkdown(): string {
    const procedures = this.schemaResult.procedures;

    let content = `# Stored Procedures

> 🤖 Auto-generated documentation  
> Environment: ${this.schemaResult.database.environment}  
> Database: ${this.schemaResult.database.database}  
> Generated: ${new Date().toISOString()}

## Overview

Total Procedures: **${procedures.length}**

## Procedures List

`;

    procedures.forEach((proc, index) => {
      content += `### ${index + 1}. ${proc.name}

**Description:** ${proc.comment || 'No description available'}

**Parameters:**
`;

      if (proc.parameters.length > 0) {
        content += `
| Parameter | Mode | Type | Description |
|-----------|------|------|-------------|
`;
        proc.parameters.forEach((param) => {
          content += `| \`${param.name}\` | ${param.mode} | ${param.dataType} | - |\n`;
        });
      } else {
        content += 'No parameters\n';
      }

      content += `
**Usage:**
\`\`\`sql
CALL \`${proc.name}\`(${proc.parameters.map((p) => `/* ${p.name} */`).join(', ')});
\`\`\`

**File:** \`${proc.name.toLowerCase()}.sql\`

**Created:** ${proc.created.toISOString()}  
**Modified:** ${proc.modified.toISOString()}

---

`;
    });

    return content;
  }

  /**
   * Functions 마크다운 생성
   */
  private generateFunctionsMarkdown(): string {
    const functions = this.schemaResult.functions;

    let content = `# Functions

> 🤖 Auto-generated documentation  
> Environment: ${this.schemaResult.database.environment}  
> Database: ${this.schemaResult.database.database}  
> Generated: ${new Date().toISOString()}

## Overview

Total Functions: **${functions.length}**

## Functions List

`;

    functions.forEach((func, index) => {
      content += `### ${index + 1}. ${func.name}

**Description:** ${func.comment || 'No description available'}

**Return Type:** ${func.returnType || 'Unknown'}

**Parameters:**
`;

      if (func.parameters.length > 0) {
        content += `
| Parameter | Type | Description |
|-----------|------|-------------|
`;
        func.parameters.forEach((param) => {
          content += `| \`${param.name}\` | ${param.dataType} | - |\n`;
        });
      } else {
        content += 'No parameters\n';
      }

      content += `
**Usage:**
\`\`\`sql
SELECT \`${func.name}\`(${func.parameters.map((p) => `/* ${p.name} */`).join(', ')});
\`\`\`

**File:** \`${func.name.toLowerCase()}.sql\`

**Created:** ${func.created.toISOString()}  
**Modified:** ${func.modified.toISOString()}

---

`;
    });

    return content;
  }

  /**
   * 인덱스 마크다운 생성
   */
  private generateIndexMarkdown(): string {
    return `# Database Procedures & Functions

> 🤖 Auto-generated documentation  
> Environment: ${this.schemaResult.database.environment}  
> Database: ${this.schemaResult.database.database}  
> Generated: ${new Date().toISOString()}

## 📊 Overview

| Type | Count | Files |
|------|-------|-------|
| Stored Procedures | ${this.schemaResult.procedures.length} | [procedures.md](./procedures.md) |
| Functions | ${this.schemaResult.functions.length} | [functions.md](./functions.md) |

## 📁 File Structure

\`\`\`
${this.options.outputDir}/
${
  this.options.separateByType
    ? `├── procedures/          # Stored procedure SQL files
├── functions/           # Function SQL files`
    : '├── *.sql                # All procedure/function files'
}
├── docs/
│   ├── index.md         # This file
│   ├── procedures.md    # Procedures documentation
│   └── functions.md     # Functions documentation
└── README.md            # Usage guide
\`\`\`

## 🚀 Quick Start

### Running Procedures
\`\`\`sql
-- Example procedure call
CALL procedure_name(param1, param2);
\`\`\`

### Using Functions
\`\`\`sql
-- Example function usage
SELECT function_name(param1, param2) AS result;
\`\`\`

## 📋 All Items

### Stored Procedures
${this.schemaResult.procedures.map((proc, i) => `${i + 1}. [\`${proc.name}\`](../procedures/${proc.name.toLowerCase()}.sql) - ${proc.comment || 'No description'}`).join('\n')}

### Functions
${this.schemaResult.functions.map((func, i) => `${i + 1}. [\`${func.name}\`](../functions/${func.name.toLowerCase()}.sql) - ${func.comment || 'No description'}`).join('\n')}

## 🔄 Auto-Generation

This documentation is automatically generated from the database schema. 
To regenerate:

\`\`\`bash
npm run db:sync
\`\`\`

Last updated: ${new Date().toISOString()}
`;
  }

  /**
   * README 파일 생성
   */
  private async generateReadme(): Promise<void> {
    const content = `# Database Procedures & Functions

This directory contains extracted stored procedures and functions from the **${this.schemaResult.database.database}** database.

## 📊 Summary

- **Environment:** ${this.schemaResult.database.environment}
- **Database:** ${this.schemaResult.database.database}
- **Procedures:** ${this.schemaResult.procedures.length}
- **Functions:** ${this.schemaResult.functions.length}
- **Generated:** ${new Date().toISOString()}

## 📁 Directory Structure

${
  this.options.separateByType
    ? `
\`\`\`
procedures/     # Stored procedures (.sql files)
functions/      # Functions (.sql files)
docs/          # Documentation files
README.md      # This file
\`\`\`
`
    : `
\`\`\`
*.sql          # All procedure and function files
docs/          # Documentation files
README.md      # This file
\`\`\`
`
}

## 🚀 Usage

### Importing Procedures/Functions

\`\`\`bash
# Import all procedures
mysql -u username -p database_name < procedures/*.sql

# Import specific procedure
mysql -u username -p database_name < procedures/procedure_name.sql
\`\`\`

### Calling Procedures

\`\`\`sql
-- Call a stored procedure
CALL procedure_name(param1, param2);
\`\`\`

### Using Functions

\`\`\`sql
-- Use a function in SELECT
SELECT function_name(param1) AS result FROM table_name;
\`\`\`

## 📚 Documentation

- [📋 Complete Index](docs/index.md)
- [🔧 Stored Procedures](docs/procedures.md)
- [⚙️ Functions](docs/functions.md)

## ⚠️ Important Notes

1. **Auto-Generated**: These files are automatically generated from the database schema
2. **Environment Specific**: Files are extracted from the **${this.schemaResult.database.environment}** environment
3. **Backup Recommended**: Always backup before importing to production
4. **Dependencies**: Some procedures/functions may have dependencies on others

## 🔄 Regeneration

To regenerate these files:

\`\`\`bash
# Run the database sync workflow
npm run db:sync

# Or run manually
ts-node scripts/db-analyzer/procedure-extractor.ts schema.json
\`\`\`

---

> 🤖 **Auto-generated** by Enhanced DB Schema Analyzer  
> Last updated: ${new Date().toISOString()}
`;

    const readmePath = path.join(this.options.outputDir, 'README.md');
    await fs.writeFile(readmePath, content, 'utf-8');
    this.generatedFiles.push('README.md');
  }

  /**
   * 롤백 실행
   */
  private async rollback(): Promise<void> {
    if (!this.backupDir) return;

    try {
      console.log('🔄 Rolling back procedure changes...');

      // 생성된 파일들 삭제
      for (const file of this.generatedFiles) {
        const filePath = path.join(this.options.outputDir, file);
        await fs.unlink(filePath).catch(() => {}); // 에러 무시
      }

      // 백업에서 복원
      await this.copyDirectory(this.backupDir, this.options.outputDir);

      // 백업 디렉토리 삭제
      await fs.rm(this.backupDir, { recursive: true, force: true });

      console.log('✅ Procedure rollback completed');
    } catch (error) {
      console.error('❌ Procedure rollback failed:', error);
    }
  }
}

/**
 * CLI 실행 함수
 */
async function main() {
  const schemaFile = process.argv[2];
  const outputDir = process.argv[3] || 'libs/database/src/procedures';

  if (!schemaFile) {
    console.error(
      '❌ Usage: ts-node procedure-extractor.ts <schema-file> [output-dir]',
    );
    process.exit(1);
  }

  try {
    console.log(`🚀 Loading schema from: ${schemaFile}`);

    const schemaContent = await fs.readFile(schemaFile, 'utf-8');
    const schemaResult: SchemaAnalysisResult = JSON.parse(schemaContent);

    const options: ProcedureExtractionOptions = {
      outputDir,
      backup: true,
      overwrite: true,
      includeComments: true,
      separateByType: true,
      generateDocumentation: true,
    };

    const extractor = new ProcedureExtractor(schemaResult, options);
    await extractor.extractProcedures();

    console.log('🎉 Procedure extraction completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Procedure extraction failed:', error);
    process.exit(1);
  }
}

// CLI에서 직접 실행되는 경우
if (require.main === module) {
  main().catch(console.error);
}

export { ProcedureExtractor, ProcedureExtractionOptions };
