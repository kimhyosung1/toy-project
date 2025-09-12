// 모든 레포지토리를 한 곳에서 관리
export * from './board.repository';
export * from './comment.repository';
// export * from './test.repository'; // 파일이 삭제된 것 같으니 주석 처리

// 🚀 자동화를 위한 Repository 배열 export
import { BoardRepository } from './board.repository';
import { CommentRepository } from './comment.repository';

/**
 * 모든 Repository 배열 - 새 Repository 추가 시 여기만 수정하면 됨!
 */
export const ALL_REPOSITORIES = [
  BoardRepository,
  CommentRepository,
  // 👆 새 Repository는 여기에만 추가하면 자동으로 모든 곳에 적용!
];
