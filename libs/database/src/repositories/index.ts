// 🤖 Auto-generated repository exports
// Environment: dev
// Tables: 4

export * from './board.repository';
export * from './comment.repository';
export * from './tb-keyword-notification.repository';
export * from './tb-notification.repository';
export * from './tb-test1.repository';
export * from './tb-test2.repository';
export * from './tb-test3.repository';
export * from './tb-user.repository';

// 🚀 자동화를 위한 Repository 배열 export
import { BoardRepository } from './board.repository';
import { CommentRepository } from './comment.repository';
import { TbUserRepository } from './tb-user.repository';

/**
 * 모든 Repository 배열 - 자동 생성됨
 * 새 Repository가 DB에 추가되면 자동으로 여기에 포함됩니다.
 * 
 * Note: Deprecated repositories (deleted tables) are exported but not included in ALL_REPOSITORIES
 */
export const ALL_REPOSITORIES = [
  BoardRepository,
  CommentRepository,
  TbUserRepository,
];
