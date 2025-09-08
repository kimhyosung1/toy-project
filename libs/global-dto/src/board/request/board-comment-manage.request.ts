import {
  NumberTransform,
  StringTransform,
} from '@app/common/decorators/transform.decorator';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

// 게시글 댓글 생성 요청 DTO
export class CreateBoardCommentDto {
  // query param '게시글 ID',
  @IsNotEmpty()
  @Type(() => Number)
  @NumberTransform()
  @IsNumber()
  boardId: number;

  @ApiProperty({
    description: '게시글 댓글 부모 ID',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @NumberTransform()
  @IsNumber()
  parentId?: number;

  @ApiProperty({
    description: '게시글 댓글 작성자',
  })
  @IsNotEmpty()
  @MaxLength(50) // mysql 해당컬럼 최대 길이 varchar(50)
  @Type(() => String)
  @StringTransform()
  @IsString()
  author: string;

  @ApiProperty({
    description: '게시글 댓글 내용',
  })
  @IsNotEmpty()
  @MaxLength(2000) // mysql 해당컬럼 최대 길이 varchar(2000)
  @Type(() => String)
  @StringTransform()
  @IsString()
  content: string;
}

// 게시글 댓글 조회 요청 DTO
export class SelectBoardCommentDto {
  // query param '게시글 ID',
  @IsNotEmpty()
  @Type(() => Number)
  @NumberTransform()
  @IsNumber()
  boardId: number;

  @ApiProperty({
    description: '게시글 댓글 페이지',
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @NumberTransform()
  @IsNumber()
  page?: number = 1;

  @ApiProperty({
    description: '게시글 댓글 페이지 당 최대 댓글 수',
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @NumberTransform()
  @IsNumber()
  limit?: number = 10;
}
