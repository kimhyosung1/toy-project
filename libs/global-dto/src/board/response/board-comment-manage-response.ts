import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  IsString,
  IsDate,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NumberTransform } from '@app/common/decorators/transform.decorator';

export class SelectBoardCommentModel {
  @ApiProperty({
    description: '게시글 댓글 ID',
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  commentId: number;

  @ApiProperty({
    description: '게시글 ID',
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  boardId: number;

  @ApiProperty({
    description: '게시글 댓글 부모 ID',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  parentId?: number;

  @ApiProperty({
    description: '게시글 댓글 내용',
  })
  @IsNotEmpty()
  @Type(() => String)
  @IsString()
  content: string;

  @ApiProperty({
    description: '게시글 댓글 작성자',
  })
  @IsNotEmpty()
  @Type(() => String)
  @IsString()
  author: string;

  @ApiProperty({
    description: '게시글 댓글 작성일',
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: '게시글 댓글 자식 댓글',
    required: false,
    type: SelectBoardCommentModel,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectBoardCommentModel)
  children?: SelectBoardCommentModel[];
}

export class SelectBoardCommentResponse {
  @ApiProperty({
    description: '게시글 댓글 목록',
    type: SelectBoardCommentModel,
    isArray: true,
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectBoardCommentModel)
  comments: SelectBoardCommentModel[];

  @ApiProperty({
    description: '게시글 댓글 총 개수',
  })
  @IsNotEmpty()
  @Type(() => Number)
  @NumberTransform()
  @IsNumber()
  totalCount: number;
}

export class CreateBoardCommentResponse extends SelectBoardCommentModel {}
