// 엔티티들
export * from './entities';

// 레포지토리들
export * from './repositories';

// 레거시 호환성을 위해 유지 (존재하는 경우에만)
// export * from './board';
// export * from './common';

// 핵심 모듈들
export * from './database.module';
export * from './database.service';

// 🔄 하위 호환성을 위한 Alias Exports
// 기존 코드에서 사용하던 이름들을 새로운 Entity/Repository로 매핑

// Entity Aliases
export { TbBoardEntity as BoardEntity } from './entities/tb-board.entity';
export { TbCommentEntity as CommentEntity } from './entities/tb-comment.entity';

// Repository Aliases
export { BoardRepository } from './repositories/board.repository';
export { CommentRepository } from './repositories/comment.repository';
export { TbKeywordNotificationRepository as KeywordNotificationRepository } from './repositories/tb-keyword-notification.repository';
