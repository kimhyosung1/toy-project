// 애플리케이션 전체에서 사용하는 Queue 이름을 정의하는 enum
export enum RedisQueueName {
  KEYWORD_NOTIFICATIONS = 'keyword-notifications',
  // 향후 추가될 수 있는 큐 이름들...
}

// 알림 소스 타입 상수 정의
// 'board': 게시글에서 발생한 알림
// 'comment': 댓글에서 발생한 알림
export enum SOURCE_TYPE {
  BOARD = 'board',
  COMMENT = 'comment',
}
