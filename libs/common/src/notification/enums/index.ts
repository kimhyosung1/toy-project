/**
 * 📋 알림 관련 Enum 타입 정의
 *
 * 모든 알림 관련 enum 타입들을 중앙 집중 관리
 * 타입 안정성과 일관성을 보장하며, 코드 자동완성 지원
 */

/**
 * 알림 타입
 */
export enum NotificationTypeEnum {
  SLACK = 'slack',
  EMAIL = 'email',
  SENTRY = 'sentry',
}

/**
 * 알림 레벨 (공통)
 */
export enum NotificationLevelEnum {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  INFO = 'info',
}

/**
 * 이메일 포맷
 */
export enum EmailFormat {
  TEXT = 'text',
  HTML = 'html',
}

/**
 * Sentry 로그 레벨
 */
export enum SentryLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  FATAL = 'fatal',
}

/**
 * 알림 우선순위
 */
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * 알림 상태
 */
export enum NotificationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SENT = 'sent',
  FAILED = 'failed',
  RETRYING = 'retrying',
}

// 타입 유니온 (기존 코드와의 호환성을 위해 유지)
export type NotificationTypeUnion = 'slack' | 'email' | 'sentry';
export type NotificationLevelUnion = 'success' | 'warning' | 'error' | 'info';
export type EmailFormatUnion = 'text' | 'html';
export type SentryLevelUnion = 'debug' | 'info' | 'warning' | 'error' | 'fatal';
