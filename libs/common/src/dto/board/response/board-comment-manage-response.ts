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
import { NumberTransform } from '@app/common/transformer/transformer';

export class SelectBoardCommentModel {
  @ApiProperty({
    description: '게시글 댓글 ID',
  })
  @IsNotEmpty()
  @IsNumber()
  commentId: number;

  @ApiProperty({
    description: '게시글 ID',
  })
  @IsNotEmpty()
  @IsNumber()
  boardId: number;

  @ApiProperty({
    description: '게시글 댓글 부모 ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  parentId: number;

  @ApiProperty({
    description: '게시글 댓글 내용',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: '게시글 댓글 작성자',
  })
  @IsNotEmpty()
  @IsString()
  author: string;

  @ApiProperty({
    description: '게시글 댓글 작성일',
  })
  @IsNotEmpty()
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
  children: SelectBoardCommentModel[];
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
  @NumberTransform()
  @IsNumber()
  totalCount: number;
}

export class CreateBoardCommentResponse extends SelectBoardCommentModel {}
