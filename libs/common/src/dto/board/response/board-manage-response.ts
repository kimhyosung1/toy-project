import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import {
  NumberTransform,
  StringTransform,
} from '@app/common/transformer/transformer';
import { Type } from 'class-transformer';

// 게시글 조회 DTO
export class BoardModel {
  @ApiProperty({
    description: '게시글 ID',
  })
  @IsNotEmpty()
  @IsNumber()
  boardId: number;

  @ApiProperty({
    description: '게시글 제목',
  })
  @IsNotEmpty()
  @StringTransform()
  @IsString()
  title: string;

  @ApiProperty({
    description: '게시글 내용',
  })
  @IsNotEmpty()
  @StringTransform()
  @IsString()
  content: string;

  @ApiProperty({
    description: '게시글 작성자',
  })
  @IsNotEmpty()
  @StringTransform()
  @IsString()
  author: string;

  @ApiProperty({
    description: '게시글 작성일',
  })
  @IsNotEmpty()
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: '게시글 수정일',
    required: false,
  })
  @IsOptional()
  @IsDate()
  updatedAt: Date;
}

// 게시글 조회 반환 DTO
export class SelectBoardModel extends BoardModel {}
export class SelectBoardResponse {
  @ApiProperty({
    description: '게시글 목록',
    type: SelectBoardModel,
    isArray: true,
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectBoardModel)
  boards: SelectBoardModel[];

  @ApiProperty({
    description: '게시글 총 개수',
  })
  @IsNotEmpty()
  @NumberTransform()
  @IsNumber()
  totalCount: number;
}

// 게시글 조회 반환 DTO
export class CreateBoardResponse extends BoardModel {}

// 게시글 조회 반환 DTO
export class UpdateBoardResponse extends BoardModel {}

// 게시글 조회 반환 DTO
export class DeleteBoardResponse extends BoardModel {}
