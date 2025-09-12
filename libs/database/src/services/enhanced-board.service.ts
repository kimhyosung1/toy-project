import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import {
  BoardWithCommentCountDto,
  BoardStatisticsDto,
  StoredProcedureResultDto,
} from '../dto/board-query.dto';

/**
 * 🚀 개선된 Raw SQL 쿼리 사용 예제 서비스
 *
 * DatabaseService의 새로운 queryOneResult, queryManyResults 메서드를 사용하여
 * snake_case → camelCase 자동 변환과 타입 안정성을 보여줍니다.
 */
@Injectable()
export class EnhancedBoardService {
  private readonly logger = new Logger(EnhancedBoardService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  // =========================
  // 📊 단일 결과 쿼리 예제들
  // =========================

  /**
   * 예제 1: 단일 게시글 조회 (타입 안정성 있음)
   */
  async findBoardWithCommentCount(
    boardId: number,
  ): Promise<BoardWithCommentCountDto | null> {
    const sql = `
      SELECT 
        b.id,
        b.title,
        b.content,
        b.author,
        b.created_at,
        b.updated_at,
        COALESCE(c.comment_count, 0) as comment_count,
        (
          SELECT GROUP_CONCAT(DISTINCT keyword)
          FROM keyword_notification kn
          WHERE (b.title LIKE CONCAT('%', kn.keyword, '%') 
                 OR b.content LIKE CONCAT('%', kn.keyword, '%'))
        ) as matched_keywords
      FROM board b
      LEFT JOIN (
        SELECT 
          board_id,
          COUNT(*) as comment_count
        FROM board_comment 
        GROUP BY board_id
      ) c ON b.id = c.board_id
      WHERE b.id = ? AND b.deleted_at IS NULL
    `;

    // 🎯 snake_case → camelCase 자동 변환 + 타입 검증
    return this.databaseService.queryOneResult(
      sql,
      [boardId],
      BoardWithCommentCountDto,
    );
  }

  /**
   * 예제 2: 단일 결과 조회 (타입 검증 없음)
   */
  async findBoardRaw(boardId: number): Promise<any | null> {
    const sql = `
      SELECT 
        b.id,
        b.title,
        b.content,
        b.author,
        b.created_at,
        b.updated_at
      FROM board b
      WHERE b.id = ? AND b.deleted_at IS NULL
    `;

    // 🎯 snake_case → camelCase 자동 변환만 (타입 검증 X)
    return this.databaseService.queryOneResult(sql, [boardId]);
  }

  // =========================
  // 📋 다중 결과 쿼리 예제들
  // =========================

  /**
   * 예제 3: 게시글 목록 조회 (타입 안정성 있음)
   */
  async findBoardsWithCommentCount(
    page: number = 1,
    limit: number = 10,
  ): Promise<BoardWithCommentCountDto[]> {
    const offset = (page - 1) * limit;

    const sql = `
      SELECT 
        b.id,
        b.title,
        b.content,
        b.author,
        b.created_at,
        b.updated_at,
        COALESCE(c.comment_count, 0) as comment_count,
        (
          SELECT GROUP_CONCAT(DISTINCT keyword)
          FROM keyword_notification kn
          WHERE (b.title LIKE CONCAT('%', kn.keyword, '%') 
                 OR b.content LIKE CONCAT('%', kn.keyword, '%'))
        ) as matched_keywords
      FROM board b
      LEFT JOIN (
        SELECT 
          board_id,
          COUNT(*) as comment_count
        FROM board_comment 
        GROUP BY board_id
      ) c ON b.id = c.board_id
      WHERE b.deleted_at IS NULL
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `;

    // 🎯 snake_case → camelCase 자동 변환 + 타입 검증
    return this.databaseService.queryManyResults(
      sql,
      [limit, offset],
      BoardWithCommentCountDto,
    );
  }

  /**
   * 예제 4: 게시글 통계 조회 (타입 안정성 있음)
   */
  async getBoardStatistics(days: number = 7): Promise<BoardStatisticsDto[]> {
    const sql = `
      SELECT 
        COUNT(*) as total_boards,
        COUNT(DISTINCT author) as unique_authors,
        AVG(CHAR_LENGTH(content)) as avg_content_length,
        DATE(created_at) as date,
        COUNT(*) as daily_count
      FROM board 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        AND deleted_at IS NULL
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    // 🎯 snake_case → camelCase 자동 변환 + 타입 검증
    return this.databaseService.queryManyResults(
      sql,
      [days],
      BoardStatisticsDto,
    );
  }

  /**
   * 예제 5: 동적 검색 쿼리 (타입 검증 없음)
   */
  async searchBoardsAdvanced(searchParams: {
    keyword?: string;
    author?: string;
    dateFrom?: Date;
    dateTo?: Date;
    hasComments?: boolean;
  }): Promise<any[]> {
    let sql = `
      SELECT DISTINCT 
        b.id,
        b.title,
        b.content,
        b.author,
        b.created_at,
        b.updated_at,
        COALESCE(c.comment_count, 0) as comment_count
      FROM board b 
      LEFT JOIN (
        SELECT board_id, COUNT(*) as comment_count
        FROM board_comment 
        GROUP BY board_id
      ) c ON b.id = c.board_id 
      WHERE b.deleted_at IS NULL
    `;

    const params: any[] = [];

    if (searchParams.keyword) {
      sql += ` AND (b.title LIKE ? OR b.content LIKE ?)`;
      const keyword = `%${searchParams.keyword}%`;
      params.push(keyword, keyword);
    }

    if (searchParams.author) {
      sql += ` AND b.author LIKE ?`;
      params.push(`%${searchParams.author}%`);
    }

    if (searchParams.dateFrom) {
      sql += ` AND b.created_at >= ?`;
      params.push(searchParams.dateFrom);
    }

    if (searchParams.dateTo) {
      sql += ` AND b.created_at <= ?`;
      params.push(searchParams.dateTo);
    }

    if (searchParams.hasComments !== undefined) {
      if (searchParams.hasComments) {
        sql += ` AND c.comment_count > 0`;
      } else {
        sql += ` AND (c.comment_count IS NULL OR c.comment_count = 0)`;
      }
    }

    sql += ` ORDER BY b.created_at DESC`;

    // 🎯 snake_case → camelCase 자동 변환만
    return this.databaseService.queryManyResults(sql, params);
  }

  // =========================
  // 🏪 Stored Procedure 호출 예제들
  // =========================

  /**
   * 예제 6: Stored Procedure 호출 (단일 결과)
   */
  async callGetBoardDetailProcedure(
    boardId: number,
  ): Promise<StoredProcedureResultDto | null> {
    const sql = 'CALL sp_get_board_detail(?)';

    // 스토어드 프로시저의 결과는 보통 result[0]에 담김
    const results = await this.databaseService.query(sql, [boardId]);
    const procedureResult = (results && results[0] && results[0][0]) || null;

    if (!procedureResult) {
      return null;
    }

    // 수동으로 camelCase 변환 후 타입 검증
    const converted = this.databaseService['columnToCamel'](procedureResult);
    return this.databaseService['validateReturnType'](
      converted,
      StoredProcedureResultDto,
    );
  }

  /**
   * 예제 7: Stored Procedure 호출 (다중 결과)
   */
  async callGetBoardListProcedure(
    page: number,
    limit: number,
  ): Promise<StoredProcedureResultDto[]> {
    const sql = 'CALL sp_get_board_list(?, ?)';

    const results = await this.databaseService.query(sql, [page, limit]);
    const procedureResults = (results && results[0]) || [];

    // 수동으로 camelCase 변환 후 타입 검증
    const converted = this.databaseService['columnToCamel'](procedureResults);

    return Promise.all(
      converted.map((item: any) =>
        this.databaseService['validateReturnType'](
          item,
          StoredProcedureResultDto,
        ),
      ),
    );
  }

  // =========================
  // 🔄 트랜잭션과 함께 사용하는 예제
  // =========================

  /**
   * 예제 8: 트랜잭션 내에서 Raw SQL 사용
   */
  async updateBoardWithAdvancedLogic(
    boardId: number,
    updateData: { title: string; content: string; updatedBy: string },
  ): Promise<{ success: boolean; updatedBoard: any }> {
    const queryRunner = await this.databaseService.startTransaction();

    try {
      // 1. 게시글 업데이트 (Raw SQL)
      const updateSql = `
        UPDATE board 
        SET 
          title = ?,
          content = ?,
          updated_at = NOW(),
          version = version + 1
        WHERE id = ? AND deleted_at IS NULL
      `;

      await queryRunner.query(updateSql, [
        updateData.title,
        updateData.content,
        boardId,
      ]);

      // 2. 업데이트된 게시글 조회 (camelCase 변환 적용)
      const selectSql = `
        SELECT 
          id,
          title,
          content,
          author,
          created_at,
          updated_at,
          version
        FROM board 
        WHERE id = ?
      `;

      const results = await queryRunner.query(selectSql, [boardId]);
      const updatedBoard = this.databaseService['columnToCamel'](results[0]);

      // 3. 업데이트 로그 기록
      const logSql = `
        INSERT INTO board_update_log (board_id, action, updated_by, updated_at)
        VALUES (?, 'UPDATE', ?, NOW())
      `;

      await queryRunner.query(logSql, [boardId, updateData.updatedBy]);

      await this.databaseService.commitTransaction(queryRunner);

      return {
        success: true,
        updatedBoard,
      };
    } catch (error) {
      await this.databaseService.rollbackTransaction(queryRunner);
      this.logger.error(`Failed to update board ${boardId}:`, error);
      throw error;
    }
  }

  // =========================
  // 🔍 복잡한 분석 쿼리 예제
  // =========================

  /**
   * 예제 9: 복잡한 집계 및 윈도우 함수 사용
   */
  async getAdvancedBoardAnalytics(
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    const sql = `
      WITH daily_stats AS (
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as board_count,
          COUNT(DISTINCT author) as unique_authors,
          AVG(CHAR_LENGTH(content)) as avg_content_length
        FROM board 
        WHERE created_at BETWEEN ? AND ?
          AND deleted_at IS NULL
        GROUP BY DATE(created_at)
      ),
      comment_stats AS (
        SELECT 
          DATE(c.created_at) as date,
          COUNT(*) as comment_count,
          AVG(CHAR_LENGTH(c.content)) as avg_comment_length
        FROM board_comment c
        INNER JOIN board b ON c.board_id = b.id
        WHERE c.created_at BETWEEN ? AND ?
          AND b.deleted_at IS NULL
        GROUP BY DATE(c.created_at)
      )
      SELECT 
        COALESCE(d.date, c.date) as date,
        COALESCE(d.board_count, 0) as board_count,
        COALESCE(d.unique_authors, 0) as unique_authors,
        COALESCE(d.avg_content_length, 0) as avg_content_length,
        COALESCE(c.comment_count, 0) as comment_count,
        COALESCE(c.avg_comment_length, 0) as avg_comment_length,
        COALESCE(d.board_count, 0) + COALESCE(c.comment_count, 0) as total_activity
      FROM daily_stats d
      LEFT JOIN comment_stats c ON d.date = c.date
      UNION
      SELECT 
        COALESCE(d.date, c.date) as date,
        COALESCE(d.board_count, 0) as board_count,
        COALESCE(d.unique_authors, 0) as unique_authors,
        COALESCE(d.avg_content_length, 0) as avg_content_length,
        COALESCE(c.comment_count, 0) as comment_count,
        COALESCE(c.avg_comment_length, 0) as avg_comment_length,
        COALESCE(d.board_count, 0) + COALESCE(c.comment_count, 0) as total_activity
      FROM comment_stats c
      LEFT JOIN daily_stats d ON c.date = d.date
      WHERE d.date IS NULL
      ORDER BY date DESC
    `;

    // 🎯 복잡한 쿼리도 자동으로 camelCase 변환
    return this.databaseService.queryManyResults(sql, [
      startDate,
      endDate,
      startDate,
      endDate,
    ]);
  }
}
