// 최소한의 Jest 설정 - 순수 Mock 테스트용

// Node.js crypto 모듈 전역 설정
global.crypto = require('crypto');

// TypeORM 모듈 모킹 (최소한)
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
  };
});

// Bull 모듈 모킹 (최소한)
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
    },
    InjectQueue: jest.fn().mockReturnValue(() => {}),
    Processor: jest.fn().mockReturnValue(() => {}),
  };
});
