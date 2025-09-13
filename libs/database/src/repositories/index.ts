// 🤖 Auto-generated repository exports
// Generated at: 2025-09-13T09:40:00.000Z
// Environment: dev
// Tables: 4 (Active tables only)

// Active repositories (for existing tables)
export * from './board.repository';
export * from './comment.repository';
export * from './tb-test1.repository';
export * from './tb-user.repository';

// Deprecated repositories (for deleted tables) - kept for backward compatibility
export * from './tb-keyword-notification.repository';
export * from './tb-notification.repository';
export * from './tb-test2.repository';
export * from './tb-test3.repository';

// 🚀 자동화를 위한 Repository 배열 export (Active repositories only)
import { BoardRepository } from './board.repository';
import { CommentRepository } from './comment.repository';
import { TbTest1Repository } from './tb-test1.repository';
import { TbUserRepository } from './tb-user.repository';

/**
 * 활성 Repository 배열 - 현재 DB에 존재하는 테이블의 Repository만 포함
 * 삭제된 테이블의 Repository는 하위 호환성을 위해 export는 하지만 배열에는 포함하지 않음
 */
export const ALL_REPOSITORIES = [
  BoardRepository,
  CommentRepository,
  TbTest1Repository,
  TbUserRepository,
];

// Deprecated repositories (kept for backward compatibility)
import { TbKeywordNotificationRepository } from './tb-keyword-notification.repository';
import { TbNotificationRepository } from './tb-notification.repository';
import { TbTest2Repository } from './tb-test2.repository';
import { TbTest3Repository } from './tb-test3.repository';

/**
 * @deprecated 삭제된 테이블의 Repository들
 * 하위 호환성을 위해 유지되지만 새로운 코드에서는 사용하지 마세요.
 */
export const DEPRECATED_REPOSITORIES = [
  TbKeywordNotificationRepository,
  TbNotificationRepository,
  TbTest2Repository,
  TbTest3Repository,
];
