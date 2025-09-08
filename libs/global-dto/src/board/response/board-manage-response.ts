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
} from '@app/common/decorators/transform.decorator';
import { Type, Expose } from 'class-transformer';

// 게시글 조회 DTO
export class BoardModel {
  @ApiProperty({
    description: '게시글 ID',
  })
  @Expose()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  boardId: number;

  @ApiProperty({
    description: '게시글 제목',
  })
  @Expose()
  @IsNotEmpty()
  @Type(() => String)
  @StringTransform()
  @IsString()
  title: string;

  @ApiProperty({
    description: '게시글 내용',
  })
  @Expose()
  @IsNotEmpty()
  @Type(() => String)
  @StringTransform()
  @IsString()
  content: string;

  @ApiProperty({
    description: '게시글 작성자',
  })
  @Expose()
  @IsNotEmpty()
  @Type(() => String)
  @StringTransform()
  @IsString()
  author: string;

  @ApiProperty({
    description: '게시글 작성일',
  })
  @Expose()
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: '게시글 수정일',
    required: false,
  })
  @Expose()
  @IsOptional()
  @Type(() => Date)
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
  @Expose()
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectBoardModel)
  boards: SelectBoardModel[];

  @ApiProperty({
    description: '게시글 총 개수',
  })
  @Expose()
  @IsNotEmpty()
  @Type(() => Number)
  @NumberTransform()
  @IsNumber()
  totalCount: number;
}

// 게시글 생성 반환 DTO
export class CreateBoardResponse extends BoardModel {}

// 게시글 수정 반환 DTO
export class UpdateBoardResponse extends BoardModel {}

// 게시글 삭제 반환 DTO
export class DeleteBoardResponse extends BoardModel {}
