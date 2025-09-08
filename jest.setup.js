// 데이터베이스 관련 모듈 모킹
jest.mock('@app/database', () => {
  return {
    KeywordNotificationRepository: jest.fn().mockImplementation(() => ({
      findMatchingKeywords: jest.fn().mockResolvedValue([]),
    })),
    BoardRepository: jest.fn().mockImplementation(() => ({
      createBoard: jest.fn().mockResolvedValue({
        boardId: 1,
        title: '테스트 제목',
        content: '테스트 내용',
        author: '테스트 작성자',
        createdAt: new Date(),
      }),
      findAllBoards: jest.fn().mockResolvedValue([
        [
          {
            boardId: 1,
            title: '테스트 제목',
            content: '테스트 내용',
            author: '테스트 작성자',
          },
        ],
        1,
      ]),
      updateBoard: jest.fn().mockResolvedValue({
        boardId: 1,
        title: '수정된 제목',
        content: '수정된 내용',
      }),
      findOneBoard: jest.fn().mockResolvedValue({
        boardId: 1,
        password:
          '$2b$10$sCsO3i7vLm6vO7KL0n9jNemL3wLuBNO4Y1SgIa.mdm/Q4aYrv.ZQe', // hashed 'test1234'
      }),
      validatePassword: jest.fn().mockResolvedValue(true),
    })),
    CommentRepository: jest.fn().mockImplementation(() => ({
      createComment: jest.fn().mockResolvedValue({
        commentId: 1,
        boardId: 1,
        parentId: null,
        author: '댓글 작성자',
        content: '댓글 내용',
        createdAt: new Date(),
      }),
      findCommentsByBoard: jest.fn().mockResolvedValue([
        [
          {
            commentId: 1,
            boardId: 1,
            author: '댓글 작성자',
            content: '댓글 내용',
          },
        ],
        1,
      ]),
    })),
  };
});

// 데이터베이스 서비스 모킹
jest.mock('@app/database/database.service', () => {
  return {
    DatabaseService: jest.fn().mockImplementation(() => ({
      runTransaction: jest.fn((callback) =>
        callback({
          getRepository: jest.fn().mockReturnValue({
            delete: jest.fn().mockResolvedValue(true),
          }),
        }),
      ),
    })),
  };
});

// 공통 설정 서비스 모킹
jest.mock('@app/core/config/config.service', () => {
  return {
    CustomConfigService: jest.fn().mockImplementation(() => ({
      get: jest.fn((key) => {
        switch (key) {
          case 'REDIS_HOST':
            return 'localhost';
          case 'REDIS_PORT':
            return 6379;
          default:
            return '';
        }
      }),
    })),
  };
});

// TypeORM 모듈 모킹
jest.mock('@nestjs/typeorm', () => {
  const originalModule = jest.requireActual('@nestjs/typeorm');
  return {
    ...originalModule,
    TypeOrmModule: {
      forRoot: jest.fn().mockReturnValue({
        module: class DynamicModule {},
        providers: [],
      }),
      forRootAsync: jest.fn().mockReturnValue({
        module: class DynamicModule {},
        providers: [],
      }),
      forFeature: jest.fn().mockReturnValue({
        module: class DynamicModule {},
        providers: [],
      }),
    },
    getRepositoryToken: jest.fn().mockReturnValue('RepositoryToken'),
    InjectRepository: jest.fn().mockReturnValue(() => {}),
    getDataSourceToken: jest.fn().mockReturnValue('DataSourceToken'),
  };
});

// Redis 모듈 모킹 (Bull 큐)
jest.mock('@nestjs/bull', () => {
  const originalModule = jest.requireActual('@nestjs/bull');
  return {
    ...originalModule,
    BullModule: {
      registerQueue: jest.fn().mockReturnValue({
        module: class DynamicModule {},
        providers: [],
      }),
      forRoot: jest.fn().mockReturnValue({
        module: class DynamicModule {},
        providers: [],
      }),
      forRootAsync: jest.fn().mockReturnValue({
        module: class DynamicModule {},
        providers: [],
      }),
    },
    InjectQueue: jest.fn().mockReturnValue(() => {}),
    Process: jest.fn().mockReturnValue(() => {}),
    Processor: jest.fn().mockReturnValue(() => {}),
  };
});
