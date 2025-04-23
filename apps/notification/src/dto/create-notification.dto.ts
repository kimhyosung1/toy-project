import { SOURCE_TYPE } from '@app/common';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';

/**
 * 알림 생성을 위한 DTO
 */
export class CreateNotificationDto {
  @IsString()
  recipient: string;

  @IsString()
  message: string;

  @IsBoolean()
  isRead: boolean;

  @IsEnum(SOURCE_TYPE)
  sourceType: SOURCE_TYPE;

  @IsNumber()
  sourceId: number;

  @IsString()
  @IsOptional()
  keyword?: string;
}
