// 모든 엔티티를 한 곳에서 관리
export * from './board.entity';
export * from './comment.entity';
export * from './test.entity';

// 🚀 자동화를 위한 엔티티 배열 export
import { BoardEntity } from './board.entity';
import { CommentEntity } from './comment.entity';
import { TestEntity } from './test.entity';

/**
 * 모든 엔티티 배열 - 새 엔티티 추가 시 여기만 수정하면 됨!
 */
export const ALL_ENTITIES = [
  TestEntity,
  BoardEntity,
  CommentEntity,
  // 👆 새 엔티티는 여기에만 추가하면 자동으로 모든 곳에 적용!
];
