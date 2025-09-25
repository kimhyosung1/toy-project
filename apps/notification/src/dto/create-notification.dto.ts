import { SOURCE_TYPE } from '@app/common';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 알림 생성을 위한 DTO
 */
export class CreateNotificationDto {
  @ApiProperty({
    description: '알림 수신자',
    example: 'user123',
  })
  @Expose()
  @IsString()
  @Type(() => String)
  recipient: string;

  @ApiProperty({
    description: '알림 메시지 내용',
    example: '새로운 댓글이 등록되었습니다.',
  })
  @Expose()
  @IsString()
  @Type(() => String)
  message: string;

  @ApiProperty({
    description: '읽음 여부',
    example: false,
  })
  @Expose()
  @IsBoolean()
  @Type(() => Boolean)
  isRead: boolean;

  @ApiProperty({
    description: '알림 소스 타입',
    enum: SOURCE_TYPE,
    example: SOURCE_TYPE.BOARD,
  })
  @Expose()
  @IsEnum(SOURCE_TYPE)
  @Type(() => String)
  sourceType: SOURCE_TYPE;

  @ApiProperty({
    description: '소스 ID',
    example: 123,
  })
  @Expose()
  @IsNumber()
  @Type(() => Number)
  sourceId: number;
}
