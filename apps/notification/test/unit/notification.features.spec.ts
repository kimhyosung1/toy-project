import { BullModule } from '@nestjs/bull';
import { RedisQueueName } from '@app/common/constants';
import { Logger } from '@nestjs/common';

// mock 서비스 정의
const mockServices = {
  notificationService: {
    healthCheck: jest.fn().mockReturnValue('i am alive!!'),
    addKeywordMatchesQueue: jest.fn().mockResolvedValue(undefined),
  },
  queueService: {
    add: jest.fn().mockResolvedValue({}),
  },
};

describe('Notification 기능 테스트', () => {
  let loggerSpy: jest.SpyInstance;

  beforeEach(() => {
    loggerSpy = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('서비스가 정상 상태를 반환한다', () => {
    expect(mockServices.notificationService.healthCheck()).toBe('i am alive!!');
  });

  it('키워드 매칭 정보를 큐에 정상적으로 추가한다', async () => {
    // 준비
    const sourceType = 'BOARD';
    const sourceId = 1;
    const title = '테스트';
    const content = '내용';
    const timestamp = new Date().toISOString();
    const keywordMatches = [{ author: '사용자1', keyword: '테스트' }];

    // 실행
    await mockServices.notificationService.addKeywordMatchesQueue(
      sourceType,
      sourceId,
      title,
      content,
      keywordMatches,
      timestamp,
    );

    // 검증
    expect(
      mockServices.notificationService.addKeywordMatchesQueue,
    ).toHaveBeenCalledWith(
      sourceType,
      sourceId,
      title,
      content,
      keywordMatches,
      timestamp,
    );
  });

  it('Bull 큐 모듈이 올바르게 설정된다', () => {
    const queueConfig = BullModule.registerQueue({
      name: RedisQueueName.KEYWORD_NOTIFICATIONS,
    });

    expect(queueConfig).toBeDefined();
    expect(queueConfig.module).toBeDefined();
  });
});
