import {
  NumberTransform,
  StringTransform,
} from '@app/common/transformer/transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

// 게시글 생성 요청 DTO
export class CreateBoardRequest {
  @ApiProperty({
    description: '게시글 제목',
  })
  @IsNotEmpty()
  @MaxLength(255) // DB 해당컬럼 최대 길이 varchar(255)
  @StringTransform()
  @IsString()
  title: string;

  @ApiProperty({
    description: '게시글 내용',
  })
  @IsNotEmpty()
  @MaxLength(2000) // DB 해당컬럼 최대 길이 varchar(2000)
  @StringTransform()
  @IsString()
  content: string;

  @ApiProperty({
    description: '게시글 작성자',
  })
  @IsNotEmpty()
  @MaxLength(50) // DB 해당컬럼 최대 길이 varchar(50)
  @StringTransform()
  @IsString()
  author: string;

  @ApiProperty({
    description: '게시글 비밀번호',
    example: '1234',
  })
  @IsNotEmpty()
  @MaxLength(255) // DB 해당컬럼 최대 길이 varchar(255)
  @StringTransform()
  @IsString()
  password: string;
}

// 게시글 조회 요청 DTO
export class SelectBoardRequest {
  @ApiProperty({
    description: '게시글 페이지',
    default: 1,
    required: false,
  })
  @IsOptional()
  @NumberTransform()
  @IsNumber()
  page?: number = 1;

  @ApiProperty({
    description: '게시글 페이지 당 최대 게시글 수',
    default: 10,
    required: false,
  })
  @IsOptional()
  @NumberTransform()
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({
    description: '게시글 제목',
  })
  @IsNotEmpty()
  @StringTransform()
  @MaxLength(255) // DB 해당컬럼 최대 길이 varchar(255)
  @IsString()
  title: string;

  @ApiProperty({
    description: '게시글 작성자',
  })
  @IsNotEmpty()
  @StringTransform()
  @MaxLength(50) // DB 해당컬럼 최대 길이 varchar(50)
  @IsString()
  author: string;
}

// 게시글 삭제 요청 DTO
export class DeleteBoardRequest {
  // query param '게시글 ID',
  @IsNotEmpty()
  @NumberTransform()
  @IsNumber()
  boardId: number;

  @ApiProperty({
    description: '게시글 비밀번호',
  })
  @IsNotEmpty()
  @MaxLength(255) // DB 해당컬럼 최대 길이 varchar(255)
  @StringTransform()
  @IsString()
  password: string;
}

// 게시글 수정 요청 DTO
export class UpdateBoardRequest {
  // query param '게시글 ID',
  @IsNotEmpty()
  @NumberTransform()
  @IsNumber()
  boardId: number;

  @ApiProperty({
    description: '게시글 제목',
  })
  @IsNotEmpty()
  @MaxLength(255) // DB 해당컬럼 최대 길이 varchar(255)
  @StringTransform()
  @IsString()
  title: string;

  @ApiProperty({
    description: '게시글 내용',
  })
  @IsNotEmpty()
  @MaxLength(2000) // DB 해당컬럼 최대 길이 varchar(2000)
  @StringTransform()
  @IsString()
  content: string;

  @ApiProperty({
    description: '게시글 비밀번호',
  })
  @IsNotEmpty()
  @StringTransform()
  @MaxLength(255) // DB 해당컬럼 최대 길이 varchar(255)
  @IsString()
  password: string;
}
