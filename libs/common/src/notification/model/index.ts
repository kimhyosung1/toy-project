// 📋 알림 시스템 통합 모델 - 모든 DTO/Model 클래스들

export * from './notification.model';

// 타입 호환성을 위한 별칭 (기존 코드와의 호환성)
export type {
  NotificationTypeAlias as NotificationType,
  NotificationLevelAlias as NotificationLevel,
} from './notification.model';
