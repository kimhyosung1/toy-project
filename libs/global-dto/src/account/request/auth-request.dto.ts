import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * 회원가입 요청 DTO
 */
export class SignUpRequestDto {
  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  name: string;

  @ApiProperty({
    description: '이메일',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  @Type(() => String)
  email: string;

  @ApiProperty({
    description: '비밀번호',
    example: 'password123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: '비밀번호는 8자 이상이어야 합니다' })
  @IsNotEmpty()
  @Type(() => String)
  password: string;
}

/**
 * 로그인 요청 DTO
 */
export class SignInRequestDto {
  @ApiProperty({
    description: '이메일',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  @Type(() => String)
  email: string;

  @ApiProperty({
    description: '비밀번호',
    example: 'password123!',
  })
  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  password: string;
}
