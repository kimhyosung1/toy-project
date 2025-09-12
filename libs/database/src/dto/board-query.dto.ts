import { IsNumber, IsString, IsDate, IsOptional } from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * Raw SQL 쿼리 결과를 위한 DTO 클래스들
 */

export class BoardWithCommentCountDto {
  @IsNumber()
  id: number;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  author: string;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  updatedAt?: Date;

  @IsNumber()
  @IsOptional()
  commentCount?: number;

  @IsString()
  @IsOptional()
  matchedKeywords?: string;
}

export class BoardStatisticsDto {
  @IsNumber()
  totalBoards: number;

  @IsNumber()
  uniqueAuthors: number;

  @IsNumber()
  avgContentLength: number;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsNumber()
  dailyCount: number;
}

export class StoredProcedureResultDto {
  @IsNumber()
  boardId: number;

  @IsString()
  title: string;

  @IsString()
  status: string;

  @IsNumber()
  @IsOptional()
  viewCount?: number;
}
