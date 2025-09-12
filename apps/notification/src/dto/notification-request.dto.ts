import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsArray,
  ValidateNested,
  IsEmail,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum NotificationType {
  SLACK = 'slack',
  EMAIL = 'email',
  SENTRY = 'sentry',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export class SlackNotificationDto {
  @IsString()
  @MaxLength(1000)
  message: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  channel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  emoji?: string;

  @IsOptional()
  @IsObject()
  attachments?: any[];

  @IsOptional()
  @IsObject()
  blocks?: any[];
}

export class EmailNotificationDto {
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  to: string;

  @IsOptional()
  @IsEmail()
  cc?: string;

  @IsOptional()
  @IsEmail()
  bcc?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  subject: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  body: string;

  @IsOptional()
  @IsString()
  @IsEnum(['text', 'html'])
  format?: 'text' | 'html';

  @IsOptional()
  @IsArray()
  attachments?: any[];
}

export class SentryNotificationDto {
  @IsString()
  @MaxLength(500)
  message: string;

  @IsOptional()
  @IsString()
  @IsEnum(['debug', 'info', 'warning', 'error', 'fatal'])
  level?: 'debug' | 'info' | 'warning' | 'error' | 'fatal';

  @IsOptional()
  @IsObject()
  tags?: Record<string, string>;

  @IsOptional()
  @IsObject()
  extra?: Record<string, any>;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  fingerprint?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  environment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  release?: string;
}

export class NotificationRequestDto {
  @IsEnum(NotificationType, { message: '지원되는 알림 타입을 선택해주세요.' })
  type: NotificationType;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority = NotificationPriority.NORMAL;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ValidateNested()
  @Type((context) => {
    const type = context?.object?.type;
    switch (type) {
      case NotificationType.SLACK:
        return SlackNotificationDto;
      case NotificationType.EMAIL:
        return EmailNotificationDto;
      case NotificationType.SENTRY:
        return SentryNotificationDto;
      // WEBHOOK 타입 제거됨
      default:
        return Object;
    }
  })
  data:
    | SlackNotificationDto
    | EmailNotificationDto
    | SentryNotificationDto;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  correlationId?: string;
}

export class BulkNotificationRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NotificationRequestDto)
  notifications: NotificationRequestDto[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  batchId?: string;
}

export class ScheduledNotificationDto extends NotificationRequestDto {
  @IsString()
  scheduledAt: string; // ISO 8601 형식

  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string;
}
