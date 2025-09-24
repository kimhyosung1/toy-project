import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

/**
 * JWT 토큰 응답 DTO
 */
export class AuthTokenResponseDto {
  @ApiProperty({
    description: 'JWT 액세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Expose()
  @Type(() => String)
  accessToken: string;

  @ApiProperty({
    description: '토큰 타입',
    example: 'Bearer',
  })
  @Expose()
  @Type(() => String)
  tokenType: string;

  @ApiProperty({
    description: '토큰 만료 시간 (초)',
    example: 3600,
  })
  @Expose()
  @Type(() => Number)
  expiresIn: number;
}

/**
 * 회원가입 응답 DTO
 */
export class SignUpResponseDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 1,
  })
  @Expose()
  @Type(() => Number)
  userId: number;

  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
  })
  @Expose()
  @Type(() => String)
  name: string;

  @ApiProperty({
    description: '이메일',
    example: 'user@example.com',
  })
  @Expose()
  @Type(() => String)
  email: string;

  @ApiProperty({
    description: '사용자 역할',
    example: 'user',
  })
  @Expose()
  @Type(() => String)
  role: string;

  @ApiProperty({
    description: '계정 생성 시간',
    example: '2023-12-01T10:30:00.000Z',
  })
  @Expose()
  @Type(() => Date)
  createdAt: Date;
}

/**
 * 로그인 응답 DTO
 */
export class SignInResponseDto {
  @ApiProperty({
    description: '사용자 정보',
    type: () => SignUpResponseDto,
  })
  @Expose()
  @Type(() => SignUpResponseDto)
  user: SignUpResponseDto;

  @ApiProperty({
    description: 'JWT 토큰 정보',
    type: () => AuthTokenResponseDto,
  })
  @Expose()
  @Type(() => AuthTokenResponseDto)
  token: AuthTokenResponseDto;
}
