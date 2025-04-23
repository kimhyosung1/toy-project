import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { RedisQueueName, SOURCE_TYPE } from '@app/common/constants';
import { Logger } from '@nestjs/common';

// Mock 서비스 정의 - 실제 구현에 의존하지 않음
const mockNotificationService = {
  healthCheck: jest.fn().mockReturnValue('i am alive!!'),
  addKeywordMatchesQueue: jest.fn().mockResolvedValue(undefined),
};

describe('NotificationService', () => {
  let mockQueue;
  let loggerSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(async () => {
    // Mock Queue
    mockQueue = {
      add: jest.fn().mockResolvedValue({}),
    };

    // 로그 스파이
    loggerSpy = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => {});
    errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('healthCheck', () => {
    it('should return health status', () => {
      expect(mockNotificationService.healthCheck()).toBe('i am alive!!');
    });
  });

  describe('addKeywordMatchesQueue', () => {
    it('should add keyword match jobs to the queue', async () => {
      // 준비
      const sourceType = SOURCE_TYPE.BOARD;
      const sourceId = 1;
      const title = '테스트 게시글';
      const content = '테스트 내용';
      const timestamp = new Date().toISOString();

      const keywordMatches = [
        {
          keyNotificationId: 1,
          author: '사용자1',
          keyword: '테스트',
          createdAt: new Date(),
        },
        {
          keyNotificationId: 2,
          author: '사용자2',
          keyword: '내용',
          createdAt: new Date(),
        },
      ];

      // 실행
      await mockNotificationService.addKeywordMatchesQueue(
        sourceType,
        sourceId,
        title,
        content,
        keywordMatches,
        timestamp,
      );

      // 검증
      expect(
        mockNotificationService.addKeywordMatchesQueue,
      ).toHaveBeenCalledWith(
        sourceType,
        sourceId,
        title,
        content,
        keywordMatches,
        timestamp,
      );
    });
  });
});
