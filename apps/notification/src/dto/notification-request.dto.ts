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
import { Type, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @ApiProperty({
    description: 'Slack 메시지 내용',
    example: '🚨 스케줄러 작업 실패: 연결 타임아웃',
    maxLength: 1000,
  })
  @Expose()
  @IsString()
  @MaxLength(1000)
  @Type(() => String)
  message: string;

  @ApiPropertyOptional({
    description: 'Slack 채널 (기본값: #general)',
    example: '#alerts',
    maxLength: 100,
  })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Type(() => String)
  channel?: string;

  @ApiPropertyOptional({
    description: '사용자명',
    example: 'NotificationBot',
    maxLength: 50,
  })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Type(() => String)
  username?: string;

  @ApiPropertyOptional({
    description: '이모지',
    example: '🤖',
    maxLength: 20,
  })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Type(() => String)
  emoji?: string;

  @ApiPropertyOptional({
    description: 'Slack 첨부파일',
    type: 'array',
    items: { type: 'object' },
  })
  @Expose()
  @IsOptional()
  @IsObject()
  @Type(() => Object)
  attachments?: any[];

  @ApiPropertyOptional({
    description: 'Slack 블록',
    type: 'array',
    items: { type: 'object' },
  })
  @Expose()
  @IsOptional()
  @IsObject()
  @Type(() => Object)
  blocks?: any[];
}

export class EmailNotificationDto {
  @ApiProperty({
    description: '수신자 이메일 주소',
    example: 'user@example.com',
  })
  @Expose()
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  @Type(() => String)
  to: string;

  @ApiPropertyOptional({
    description: '참조 이메일 주소',
    example: 'cc@example.com',
  })
  @Expose()
  @IsOptional()
  @IsEmail()
  @Type(() => String)
  cc?: string;

  @ApiPropertyOptional({
    description: '숨은참조 이메일 주소',
    example: 'bcc@example.com',
  })
  @Expose()
  @IsOptional()
  @IsEmail()
  @Type(() => String)
  bcc?: string;

  @ApiProperty({
    description: '이메일 제목',
    example: '시스템 알림: 작업 완료',
    minLength: 1,
    maxLength: 200,
  })
  @Expose()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @Type(() => String)
  subject: string;

  @ApiProperty({
    description: '이메일 본문',
    example: '안녕하세요. 요청하신 작업이 성공적으로 완료되었습니다.',
    minLength: 1,
    maxLength: 10000,
  })
  @Expose()
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  @Type(() => String)
  body: string;

  @ApiPropertyOptional({
    description: '이메일 포맷',
    enum: ['text', 'html'],
    example: 'html',
  })
  @Expose()
  @IsOptional()
  @IsString()
  @IsEnum(['text', 'html'])
  @Type(() => String)
  format?: 'text' | 'html';

  @ApiPropertyOptional({
    description: '이메일 첨부파일',
    type: 'array',
    items: { type: 'object' },
  })
  @Expose()
  @IsOptional()
  @IsArray()
  @Type(() => Object)
  attachments?: any[];
}

export class SentryNotificationDto {
  @ApiProperty({
    description: 'Sentry 에러 메시지',
    example: '데이터베이스 연결 실패',
    maxLength: 500,
  })
  @Expose()
  @IsString()
  @MaxLength(500)
  @Type(() => String)
  message: string;

  @ApiPropertyOptional({
    description: 'Sentry 로그 레벨',
    enum: ['debug', 'info', 'warning', 'error', 'fatal'],
    example: 'error',
  })
  @Expose()
  @IsOptional()
  @IsString()
  @IsEnum(['debug', 'info', 'warning', 'error', 'fatal'])
  @Type(() => String)
  level?: 'debug' | 'info' | 'warning' | 'error' | 'fatal';

  @ApiPropertyOptional({
    description: 'Sentry 태그',
    example: { service: 'scheduler', module: 'database' },
  })
  @Expose()
  @IsOptional()
  @IsObject()
  @Type(() => Object)
  tags?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Sentry 추가 정보',
    example: { userId: 123, requestId: 'req-456' },
  })
  @Expose()
  @IsOptional()
  @IsObject()
  @Type(() => Object)
  extra?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Sentry 핑거프린트',
    example: 'database-connection-error',
    maxLength: 100,
  })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Type(() => String)
  fingerprint?: string;

  @ApiPropertyOptional({
    description: 'Sentry 환경',
    example: 'production',
    maxLength: 100,
  })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Type(() => String)
  environment?: string;

  @ApiPropertyOptional({
    description: 'Sentry 릴리즈 버전',
    example: 'v1.2.3',
    maxLength: 100,
  })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Type(() => String)
  release?: string;
}

export class NotificationRequestDto {
  @ApiProperty({
    description: '알림 타입',
    enum: NotificationType,
    example: NotificationType.SLACK,
  })
  @Expose()
  @IsEnum(NotificationType, { message: '지원되는 알림 타입을 선택해주세요.' })
  @Type(() => String)
  type: NotificationType;

  @ApiPropertyOptional({
    description: '알림 우선순위',
    enum: NotificationPriority,
    example: NotificationPriority.NORMAL,
  })
  @Expose()
  @IsOptional()
  @IsEnum(NotificationPriority)
  @Type(() => String)
  priority?: NotificationPriority = NotificationPriority.NORMAL;

  @ApiPropertyOptional({
    description: '알림 제목',
    example: '시스템 알림',
    maxLength: 100,
  })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Type(() => String)
  title?: string;

  @ApiProperty({
    description: '알림 데이터 (타입에 따라 다름)',
    oneOf: [
      { $ref: '#/components/schemas/SlackNotificationDto' },
      { $ref: '#/components/schemas/EmailNotificationDto' },
      { $ref: '#/components/schemas/SentryNotificationDto' },
    ],
  })
  @Expose()
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
  data: SlackNotificationDto | EmailNotificationDto | SentryNotificationDto;

  @ApiPropertyOptional({
    description: '추가 메타데이터',
    example: { requestId: 'req-123', userId: 456 },
  })
  @Expose()
  @IsOptional()
  @IsObject()
  @Type(() => Object)
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: '상관관계 ID',
    example: 'corr-123-456',
    maxLength: 100,
  })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Type(() => String)
  correlationId?: string;
}

export class BulkNotificationRequestDto {
  @ApiProperty({
    description: '대량 알림 요청 배열',
    type: [NotificationRequestDto],
  })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NotificationRequestDto)
  notifications: NotificationRequestDto[];

  @ApiPropertyOptional({
    description: '배치 ID',
    example: 'batch-123',
    maxLength: 100,
  })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Type(() => String)
  batchId?: string;
}

export class ScheduledNotificationDto extends NotificationRequestDto {
  @ApiProperty({
    description: '예약 전송 시간 (ISO 8601 형식)',
    example: '2024-01-01T09:00:00Z',
  })
  @Expose()
  @IsString()
  @Type(() => String)
  scheduledAt: string; // ISO 8601 형식

  @ApiPropertyOptional({
    description: '타임존',
    example: 'Asia/Seoul',
    maxLength: 100,
  })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Type(() => String)
  timezone?: string;
}
