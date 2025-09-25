import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  MaxLength,
  MinLength,
  IsEnum,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsIn,
} from 'class-validator';
import { Type, Expose, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  NotificationTypeEnum,
  NotificationLevelEnum,
  EmailFormat,
  SentryLevel,
  NotificationTypeUnion,
  NotificationLevelUnion,
} from '../enums';

// =============================================================================
// 기본 공통 클래스
// =============================================================================

/**
 * 🔧 공통 알림 기본 정보
 */
export class NotificationBase {
  @ApiProperty({
    description: '알림 메시지 내용',
    example: '🚨 중요한 시스템 에러 발생',
    minLength: 1,
    maxLength: 2000,
  })
  @Expose()
  @IsString()
  @MinLength(1, { message: '알림 메시지는 필수입니다.' })
  @MaxLength(2000, { message: '알림 메시지는 2000자를 초과할 수 없습니다.' })
  @Type(() => String)
  message: string;

  @ApiProperty({
    description: '알림 레벨',
    enum: NotificationLevelEnum,
    example: NotificationLevelEnum.ERROR,
  })
  @Expose()
  @IsEnum(NotificationLevelEnum)
  @Type(() => String)
  level: NotificationLevelUnion;

  @ApiPropertyOptional({
    description: '추가 컨텍스트 정보',
    example: {
      service: 'scheduler',
      errorCode: 'DB_CONNECTION_FAILED',
      timestamp: '2025-01-01T10:00:00Z',
    },
  })
  @Expose()
  @IsOptional()
  @Type(() => Object)
  context?: any;
}

// =============================================================================
// 옵션 클래스들
// =============================================================================

/**
 * 🔧 Slack 알림 옵션
 */
export class SlackOptions {
  @ApiPropertyOptional({
    description: 'Slack 채널명 (# 접두어 자동 추가)',
    example: '#general',
    maxLength: 50,
  })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => (value?.startsWith('#') ? value : `#${value}`))
  @Type(() => String)
  channel?: string;

  @ApiPropertyOptional({
    description: 'Slack 봇 사용자명',
    example: 'AlertBot',
    maxLength: 30,
  })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Type(() => String)
  username?: string;

  @ApiPropertyOptional({
    description: 'Slack 메시지 이모지',
    example: '🚨',
    maxLength: 10,
  })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(10)
  @Type(() => String)
  emoji?: string;
}

/**
 * 🔧 간소화된 Slack 옵션 (HTTP 서비스용)
 */
export class SimpleSlackOptions {
  @ApiPropertyOptional({
    description: 'Slack 채널명 (# 접두어 자동 추가)',
    example: '#general',
    maxLength: 50,
  })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => (value?.startsWith('#') ? value : `#${value}`))
  @Type(() => String)
  channel?: string;

  @ApiPropertyOptional({
    description: 'Slack 메시지 이모지',
    example: '🚨',
    maxLength: 10,
  })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(10)
  @Type(() => String)
  emoji?: string;

  @ApiPropertyOptional({
    description: 'Slack 봇 사용자명',
    example: 'AlertBot',
    maxLength: 30,
  })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Type(() => String)
  username?: string;
}

/**
 * 🔧 Sentry 알림 옵션
 */
export class SentryOptions {
  @ApiPropertyOptional({
    description: 'Sentry 로그 레벨',
    enum: SentryLevel,
    example: SentryLevel.ERROR,
  })
  @Expose()
  @IsOptional()
  @IsEnum(SentryLevel)
  @Type(() => String)
  level?: SentryLevel;

  @ApiPropertyOptional({
    description: 'Sentry 태그 (키-값 쌍)',
    example: { service: 'scheduler', module: 'testJob' },
    additionalProperties: { type: 'string' },
  })
  @Expose()
  @IsOptional()
  @Type(() => Object)
  tags?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Sentry 추가 정보 (키-값 쌍)',
    example: { errorStack: 'Error stack trace...', retryCount: 3 },
  })
  @Expose()
  @IsOptional()
  @Type(() => Object)
  extra?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Sentry 핑거프린트 (그룹핑용)',
    example: 'db-connection-error',
    maxLength: 100,
  })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Type(() => String)
  fingerprint?: string;
}

/**
 * 🔧 간소화된 Sentry 옵션 (HTTP 서비스용)
 */
export class SimpleSentryOptions {
  @ApiPropertyOptional({
    description: 'Sentry 로그 레벨',
    enum: SentryLevel,
    example: SentryLevel.ERROR,
  })
  @Expose()
  @IsOptional()
  @IsEnum(SentryLevel)
  @Type(() => String)
  level?: SentryLevel;

  @ApiPropertyOptional({
    description: 'Sentry 태그 (키-값 쌍)',
    example: { service: 'scheduler', module: 'testJob' },
  })
  @Expose()
  @IsOptional()
  @Type(() => Object)
  tags?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Sentry 추가 정보 (키-값 쌍)',
    example: { errorStack: 'Error stack trace...', retryCount: 3 },
  })
  @Expose()
  @IsOptional()
  @Type(() => Object)
  extra?: Record<string, any>;
}

/**
 * 📧 이메일 알림 옵션
 */
export class EmailOptions {
  @ApiProperty({
    description: '수신자 이메일 주소',
    example: 'admin@company.com',
    format: 'email',
  })
  @Expose()
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  @Type(() => String)
  to: string;

  @ApiProperty({
    description: '이메일 제목',
    example: '[긴급] 시스템 알림',
    minLength: 1,
    maxLength: 200,
  })
  @Expose()
  @IsString()
  @MinLength(1, { message: '제목은 필수입니다.' })
  @MaxLength(200, { message: '제목은 200자를 초과할 수 없습니다.' })
  @Type(() => String)
  subject: string;

  @ApiPropertyOptional({
    description: '참조 이메일 주소',
    example: 'manager@company.com',
    format: 'email',
  })
  @Expose()
  @IsOptional()
  @IsEmail({}, { message: '유효한 참조 이메일 주소를 입력해주세요.' })
  @Type(() => String)
  cc?: string;

  @ApiPropertyOptional({
    description: '숨은참조 이메일 주소',
    example: 'dev-team@company.com',
    format: 'email',
  })
  @Expose()
  @IsOptional()
  @IsEmail({}, { message: '유효한 숨은참조 이메일 주소를 입력해주세요.' })
  @Type(() => String)
  bcc?: string;

  @ApiPropertyOptional({
    description: '이메일 형식',
    enum: EmailFormat,
    example: EmailFormat.HTML,
  })
  @Expose()
  @IsOptional()
  @IsEnum(EmailFormat)
  @Type(() => String)
  format?: EmailFormat;

  @ApiPropertyOptional({
    description: '이메일 본문 내용',
    example: '상세한 이메일 내용...',
    maxLength: 10000,
  })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  @Type(() => String)
  body?: string;
}

/**
 * 📧 간소화된 이메일 옵션 (HTTP 서비스용)
 */
export class SimpleEmailOptions {
  @ApiProperty({
    description: '수신자 이메일 주소',
    example: 'admin@company.com',
    format: 'email',
  })
  @Expose()
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  @Type(() => String)
  to: string;

  @ApiProperty({
    description: '이메일 제목',
    example: '[긴급] 시스템 알림',
    minLength: 1,
    maxLength: 200,
  })
  @Expose()
  @IsString()
  @MinLength(1, { message: '제목은 필수입니다.' })
  @MaxLength(200, { message: '제목은 200자를 초과할 수 없습니다.' })
  @Type(() => String)
  subject: string;

  @ApiPropertyOptional({
    description: '이메일 본문 내용',
    example: '상세한 이메일 내용...',
    maxLength: 10000,
  })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  @Type(() => String)
  body?: string;

  @ApiPropertyOptional({
    description: '참조 이메일 주소',
    example: 'manager@company.com',
    format: 'email',
  })
  @Expose()
  @IsOptional()
  @IsEmail({}, { message: '유효한 참조 이메일 주소를 입력해주세요.' })
  @Type(() => String)
  cc?: string;

  @ApiPropertyOptional({
    description: '숨은참조 이메일 주소',
    example: 'dev-team@company.com',
    format: 'email',
  })
  @Expose()
  @IsOptional()
  @IsEmail({}, { message: '유효한 숨은참조 이메일 주소를 입력해주세요.' })
  @Type(() => String)
  bcc?: string;

  @ApiPropertyOptional({
    description: '이메일 형식',
    enum: EmailFormat,
    example: EmailFormat.TEXT,
    default: EmailFormat.TEXT,
  })
  @Expose()
  @IsOptional()
  @IsEnum(EmailFormat)
  @Type(() => String)
  format?: EmailFormat;
}

/**
 * 📧 개별 이메일 알림 (서로 다른 내용 지원)
 */
export class IndividualEmailNotification {
  @ApiProperty({
    description: '수신자 이메일 주소',
    example: 'admin@company.com',
    format: 'email',
  })
  @Expose()
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  @Type(() => String)
  to: string;

  @ApiProperty({
    description: '이메일 제목',
    example: '[긴급] 시스템 에러',
    minLength: 1,
    maxLength: 200,
  })
  @Expose()
  @IsString()
  @MinLength(1, { message: '제목은 필수입니다.' })
  @MaxLength(200, { message: '제목은 200자를 초과할 수 없습니다.' })
  @Type(() => String)
  subject: string;

  @ApiProperty({
    description: '이메일 본문 내용',
    example: '관리자님께: 시스템에 중대한 오류가 발생했습니다.',
    minLength: 1,
    maxLength: 10000,
  })
  @Expose()
  @IsString()
  @MinLength(1, { message: '본문 내용은 필수입니다.' })
  @MaxLength(10000, { message: '본문은 10000자를 초과할 수 없습니다.' })
  @Type(() => String)
  body: string;

  @ApiPropertyOptional({
    description: '이메일 형식',
    enum: EmailFormat,
    example: EmailFormat.HTML,
    default: EmailFormat.TEXT,
  })
  @Expose()
  @IsOptional()
  @IsEnum(EmailFormat)
  @Type(() => String)
  format?: EmailFormat;

  @ApiPropertyOptional({
    description: '참조 이메일 주소',
    example: 'manager@company.com',
    format: 'email',
  })
  @Expose()
  @IsOptional()
  @IsEmail({}, { message: '유효한 참조 이메일 주소를 입력해주세요.' })
  @Type(() => String)
  cc?: string;

  @ApiPropertyOptional({
    description: '숨은참조 이메일 주소',
    example: 'dev-team@company.com',
    format: 'email',
  })
  @Expose()
  @IsOptional()
  @IsEmail({}, { message: '유효한 숨은참조 이메일 주소를 입력해주세요.' })
  @Type(() => String)
  bcc?: string;
}

// =============================================================================
// 요청 클래스들
// =============================================================================

// 타입 호환성을 위해 유지 (기존 코드와의 호환성)
export type NotificationTypeAlias = NotificationTypeUnion;
export type NotificationLevelAlias = NotificationLevelUnion;

/**
 * 📱 단일 알림 요청
 */
export class NotificationRequest {
  @ApiProperty({
    description: '알림 타입',
    enum: NotificationTypeEnum,
    example: NotificationTypeEnum.SLACK,
  })
  @Expose()
  @IsEnum(NotificationTypeEnum)
  @Type(() => String)
  type: NotificationTypeAlias;

  @ApiProperty({
    description: '알림 레벨',
    enum: NotificationLevelEnum,
    example: NotificationLevelEnum.ERROR,
  })
  @Expose()
  @IsEnum(NotificationLevelEnum)
  @Type(() => String)
  level: NotificationLevelAlias;

  @ApiProperty({
    description: '알림 메시지 내용',
    example: '🚨 스케줄러 작업 실패: 데이터베이스 연결 오류',
    minLength: 1,
    maxLength: 2000,
  })
  @Expose()
  @IsString()
  @MinLength(1, { message: '알림 메시지는 필수입니다.' })
  @MaxLength(2000, { message: '알림 메시지는 2000자를 초과할 수 없습니다.' })
  @Type(() => String)
  message: string;

  @ApiPropertyOptional({
    description: '추가 컨텍스트 정보',
    example: `{
      service: 'scheduler',
      jobId: 'daily-report',
      timestamp: '2025-01-01T10:00:00Z',
    }`,
  })
  @Expose()
  @IsOptional()
  @Type(() => Object)
  context?: any;

  @ApiPropertyOptional({
    description: 'Slack 알림 옵션',
    type: () => SlackOptions,
  })
  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => SlackOptions)
  slackOptions?: SlackOptions;

  @ApiPropertyOptional({
    description: 'Sentry 알림 옵션',
    type: () => SentryOptions,
  })
  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => SentryOptions)
  sentryOptions?: SentryOptions;

  @ApiPropertyOptional({
    description: '이메일 알림 옵션',
    type: () => EmailOptions,
  })
  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => EmailOptions)
  emailOptions?: EmailOptions;
}

/**
 * 📦 Bulk 알림 요청
 */
export class BulkNotificationRequest {
  @ApiProperty({
    description: '알림 목록 (최대 500개)',
    type: [NotificationRequest],
    example: [
      {
        type: 'slack',
        level: 'info',
        message: '일일 리포트 완료',
        slackOptions: { channel: '#reports' },
      },
      {
        type: 'email',
        level: 'info',
        message: '상세 리포트 첨부',
        emailOptions: { to: 'admin@company.com', subject: '일일 리포트' },
      },
    ],
  })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NotificationRequest)
  notifications: NotificationRequest[];

  @ApiPropertyOptional({
    description: '배치 추적용 고유 ID',
    example: 'daily-report-2025-01-01',
    maxLength: 100,
  })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Type(() => String)
  batchId?: string;

  @ApiPropertyOptional({
    description: '병렬 처리 여부 (기본값: true)',
    example: true,
    default: true,
  })
  @Expose()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  parallel?: boolean;
}

/**
 * 🌐 다중 타입 알림 요청 (개선된 버전)
 */
export class EnhancedMultiTypeNotificationRequest extends NotificationBase {
  @ApiPropertyOptional({
    description: 'Slack 알림 옵션',
    type: () => SlackOptions,
    example: {
      channel: '#critical-alerts',
      emoji: '💥',
      username: 'CriticalBot',
    },
  })
  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => SlackOptions)
  slack?: SlackOptions;

  @ApiPropertyOptional({
    description: '개별 이메일 알림 (서로 다른 내용 지원)',
    type: [IndividualEmailNotification],
    example: [
      {
        to: 'admin@company.com',
        subject: '[긴급] 시스템 에러',
        body: '관리자님께: 시스템에 중대한 오류가 발생했습니다. 즉시 확인 바랍니다.',
        format: 'html',
      },
      {
        to: 'dev-team@company.com',
        subject: '[개발팀] 에러 알림',
        body: '개발팀께: 스케줄러에서 DB 연결 오류가 발생했습니다. 로그를 확인해주세요.',
        format: 'text',
      },
    ],
  })
  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IndividualEmailNotification)
  emails?: IndividualEmailNotification[];

  @ApiPropertyOptional({
    description: 'Sentry 알림 옵션',
    type: () => SentryOptions,
    example: {
      level: 'error',
      tags: { service: 'scheduler', module: 'database' },
      extra: { connectionString: 'mysql://***', errorStack: 'Error...' },
    },
  })
  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => SentryOptions)
  sentry?: SentryOptions;
}

/**
 * 🌐 다중 타입 알림 요청 (기존 버전 - 호환성 유지)
 */
export class MultiTypeNotificationRequest {
  @ApiProperty({
    description: '알림 메시지 내용',
    example: '🚨 중요한 시스템 에러 발생: 데이터베이스 연결 실패',
    minLength: 1,
    maxLength: 2000,
  })
  @Expose()
  @IsString()
  @MinLength(1, { message: '알림 메시지는 필수입니다.' })
  @MaxLength(2000, { message: '알림 메시지는 2000자를 초과할 수 없습니다.' })
  @Type(() => String)
  message: string;

  @ApiPropertyOptional({
    description: '추가 컨텍스트 정보',
    example: {
      service: 'scheduler',
      errorCode: 'DB_CONNECTION_FAILED',
      timestamp: '2025-01-01T10:00:00Z',
      retryCount: 3,
    },
  })
  @Expose()
  @IsOptional()
  @Type(() => Object)
  context?: any;

  @ApiProperty({
    description: '알림 레벨',
    enum: NotificationLevelEnum,
    example: NotificationLevelEnum.ERROR,
  })
  @Expose()
  @IsEnum(NotificationLevelEnum)
  @Type(() => String)
  level: NotificationLevelAlias;

  @ApiPropertyOptional({
    description: 'Slack 알림 옵션',
    type: () => SlackOptions,
    example: {
      channel: '#critical-alerts',
      emoji: '💥',
      username: 'CriticalBot',
    },
  })
  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => SlackOptions)
  slack?: SlackOptions;

  @ApiPropertyOptional({
    description: '이메일 알림 옵션 (다중 수신자 지원)',
    type: [EmailOptions],
    example: [
      {
        to: 'admin@company.com',
        subject: '[긴급] 시스템 에러',
        format: 'html',
      },
      {
        to: 'dev-team@company.com',
        subject: '[알림] 시스템 에러 발생',
        format: 'text',
      },
    ],
  })
  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailOptions)
  email?: EmailOptions[];

  @ApiPropertyOptional({
    description: 'Sentry 알림 옵션',
    type: () => SentryOptions,
    example: {
      level: 'error',
      tags: { service: 'scheduler', module: 'database' },
      extra: { connectionString: 'mysql://***', errorStack: 'Error...' },
    },
  })
  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => SentryOptions)
  sentry?: SentryOptions;
}

/**
 * 🌐 CommonNotificationService.sendNotifications() 요청 클래스
 */
export class SendNotificationsRequest {
  @ApiProperty({
    description: '알림 메시지 내용',
    example: '🚨 중요한 시스템 에러 발생: 데이터베이스 연결 실패',
    minLength: 1,
    maxLength: 2000,
  })
  @Expose()
  @IsNotEmpty()
  @IsString()
  @MinLength(1, { message: '알림 메시지는 필수입니다.' })
  @MaxLength(2000, { message: '알림 메시지는 2000자를 초과할 수 없습니다.' })
  @Type(() => String)
  message: string;

  @ApiProperty({
    description: '알림 레벨',
    enum: NotificationLevelEnum,
    example: NotificationLevelEnum.ERROR,
  })
  @IsNotEmpty()
  @Expose()
  @IsEnum(NotificationLevelEnum)
  @Type(() => String)
  level: NotificationLevelEnum;

  @ApiPropertyOptional({
    description: '추가 컨텍스트 정보',
    example: {
      service: 'scheduler',
      errorCode: 'DB_CONNECTION_FAILED',
      timestamp: '2025-01-01T10:00:00Z',
      retryCount: 3,
    },
  })
  @Expose()
  @IsOptional()
  @Type(() => Object)
  context?: any;

  @ApiPropertyOptional({
    description: 'Slack 알림 옵션',
    type: () => SimpleSlackOptions,
    example: {
      channel: '#critical-alerts',
      emoji: '💥',
      username: 'CriticalBot',
    },
  })
  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => SimpleSlackOptions)
  slack?: SimpleSlackOptions;

  @ApiPropertyOptional({
    description: '이메일 알림 목록 (다중 수신자 지원)',
    type: [SimpleEmailOptions],
    example: [
      {
        to: 'admin@company.com',
        subject: '[긴급] 시스템 에러',
        body: '관리자님께: 시스템에 중대한 오류가 발생했습니다.',
        format: 'html',
      },
      {
        to: 'dev-team@company.com',
        subject: '[개발팀] 에러 알림',
        body: '개발팀께: 스케줄러에서 DB 연결 오류가 발생했습니다.',
        format: 'text',
      },
    ],
  })
  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SimpleEmailOptions)
  emails?: SimpleEmailOptions[];

  @ApiPropertyOptional({
    description: 'Sentry 알림 옵션',
    type: () => SimpleSentryOptions,
    example: {
      level: 'error',
      tags: { service: 'scheduler', module: 'database' },
      extra: { connectionString: 'mysql://***', errorStack: 'Error...' },
    },
  })
  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => SimpleSentryOptions)
  sentry?: SimpleSentryOptions;
}

// =============================================================================
// 응답 클래스들
// =============================================================================

/**
 * 📱 알림 응답
 */
export class NotificationResponse {
  @ApiProperty({
    description: '알림 전송 성공 여부',
    example: true,
  })
  @Expose()
  @IsBoolean()
  @Type(() => Boolean)
  success: boolean;

  @ApiPropertyOptional({
    description: '응답 데이터',
    example: { messageId: 'msg-123', timestamp: '2025-01-01T10:00:00Z' },
  })
  @Expose()
  @IsOptional()
  @Type(() => Object)
  data?: any;

  @ApiPropertyOptional({
    description: '에러 메시지 (실패 시)',
    example: 'Slack webhook URL이 유효하지 않습니다.',
  })
  @Expose()
  @IsOptional()
  @IsString()
  @Type(() => String)
  error?: string;
}

/**
 * 📦 배치 결과 개별 항목
 */
export class BulkResultItem {
  @ApiProperty({
    description: '알림 인덱스',
    example: 0,
  })
  @Expose()
  @IsNumber()
  @Type(() => Number)
  index: number;

  @ApiProperty({
    description: '성공 여부',
    example: true,
  })
  @Expose()
  @IsBoolean()
  @Type(() => Boolean)
  success: boolean;

  @ApiPropertyOptional({
    description: '응답 데이터 (성공 시)',
    example: { messageId: 'msg-123', sent: true },
  })
  @Expose()
  @IsOptional()
  @Type(() => Object)
  data?: any;

  @ApiPropertyOptional({
    description: '에러 메시지 (실패 시)',
    example: 'Invalid email address',
  })
  @Expose()
  @IsOptional()
  @IsString()
  @Type(() => String)
  error?: string;
}

/**
 * 📦 배치 알림 응답
 */
export class BulkNotificationResponse {
  @ApiProperty({
    description: '배치 ID',
    example: 'batch-2025-01-01-123456',
  })
  @Expose()
  @IsString()
  @Type(() => String)
  batchId: string;

  @ApiProperty({
    description: '총 알림 수',
    example: 10,
  })
  @Expose()
  @IsNumber()
  @Type(() => Number)
  totalCount: number;

  @ApiProperty({
    description: '성공한 알림 수',
    example: 8,
  })
  @Expose()
  @IsNumber()
  @Type(() => Number)
  successCount: number;

  @ApiProperty({
    description: '실패한 알림 수',
    example: 2,
  })
  @Expose()
  @IsNumber()
  @Type(() => Number)
  failureCount: number;

  @ApiProperty({
    description: '개별 결과 상세',
    type: [BulkResultItem],
  })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkResultItem)
  results: BulkResultItem[];
}

/**
 * 🌐 CommonNotificationService.sendNotifications() 응답 클래스
 */
export class SendNotificationsResponse {
  @ApiProperty({
    description: '전체 성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '총 알림 수',
    example: 3,
  })
  totalCount: number;

  @ApiProperty({
    description: '성공한 알림 수',
    example: 2,
  })
  successCount: number;

  @ApiProperty({
    description: '실패한 알림 수',
    example: 1,
  })
  failureCount: number;

  @ApiPropertyOptional({
    description: '개별 알림 결과 상세 정보',
    example: [
      {
        index: 0,
        success: true,
        data: { messageId: 'slack-msg-123' },
      },
      {
        index: 1,
        success: false,
        error: '이메일 전송 실패: Invalid recipient',
      },
    ],
  })
  results?: any[];

  @ApiPropertyOptional({
    description: '전체 에러 메시지 (시스템 에러 발생 시)',
    example: '네트워크 연결 실패',
  })
  error?: string;
}
