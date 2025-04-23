import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from '../../src/notification.controller';
import { NotificationService } from '../../src/notification.service';
import { SOURCE_TYPE } from '@app/common/constants';
import { Logger } from '@nestjs/common';

describe('NotificationController', () => {
  let controller: NotificationController;
  let notificationService: NotificationService;
  let loggerSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(async () => {
    // Mock NotificationService
    const mockNotificationService = {
      healthCheck: jest.fn().mockReturnValue('i am alive!!'),
      addKeywordMatchesQueue: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        { provide: NotificationService, useValue: mockNotificationService },
        Logger,
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
    notificationService = module.get<NotificationService>(NotificationService);

    // Logger 스파이 설정
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
    it('헬스체크 상태 수신', () => {
      expect(controller.healthCheck()).toBe('i am alive!!');
      expect(notificationService.healthCheck).toHaveBeenCalled();
    });
  });

  describe('handleKeywordMatched', () => {
    it('키워드 매치 이벤트 처리 및 서비스로 전달', async () => {
      // 모의 이벤트 데이터
      const mockEvent = {
        sourceType: SOURCE_TYPE.BOARD,
        sourceId: 1,
        title: '테스트 게시글',
        content: '테스트 내용',
        keywordMatches: [
          {
            keyNotificationId: 1,
            author: '사용자1',
            keyword: '테스트',
            createdAt: new Date(),
          },
        ],
        timestamp: new Date().toISOString(),
      };

      // 실행
      await controller.handleKeywordMatched(mockEvent);

      // 검증
      expect(notificationService.addKeywordMatchesQueue).toHaveBeenCalledWith(
        mockEvent.sourceType,
        mockEvent.sourceId,
        mockEvent.title,
        mockEvent.content,
        mockEvent.keywordMatches,
        mockEvent.timestamp,
      );

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('[알림 이벤트] 키워드 매칭 이벤트 수신:'),
      );

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('키워드 매칭 이벤트 처리 요청 완료'),
      );
    });

    it('서비스 에러 발생 시 적절히 처리', async () => {
      // 서비스 에러 시뮬레이션
      jest
        .spyOn(notificationService, 'addKeywordMatchesQueue')
        .mockImplementationOnce(() => {
          throw new Error('Service error');
        });

      // 모의 이벤트 데이터
      const mockEvent = {
        sourceType: SOURCE_TYPE.BOARD,
        sourceId: 1,
        title: '테스트 게시글',
        content: '테스트 내용',
        keywordMatches: [
          {
            keyNotificationId: 1,
            author: '사용자1',
            keyword: '테스트',
            createdAt: new Date(),
          },
        ],
        timestamp: new Date().toISOString(),
      };

      // 실행
      await controller.handleKeywordMatched(mockEvent);

      // 검증 - 컨트롤러는 에러를 잡아서 로깅해야 함
      expect(notificationService.addKeywordMatchesQueue).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('키워드 매칭 이벤트 처리 중 오류:'),
        expect.any(String),
      );
    });

    it('빈 키워드 매치 배열 처리', async () => {
      // 빈 키워드 매치 배열을 가진 이벤트
      const mockEvent = {
        sourceType: SOURCE_TYPE.BOARD,
        sourceId: 1,
        title: '테스트 게시글',
        content: '테스트 내용',
        keywordMatches: [],
        timestamp: new Date().toISOString(),
      };

      // 실행
      await controller.handleKeywordMatched(mockEvent);

      // 검증
      expect(notificationService.addKeywordMatchesQueue).toHaveBeenCalledWith(
        mockEvent.sourceType,
        mockEvent.sourceId,
        mockEvent.title,
        mockEvent.content,
        mockEvent.keywordMatches,
        mockEvent.timestamp,
      );

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '[알림 이벤트] 키워드 매칭 이벤트 수신: 0개 매치',
        ),
      );
    });
  });
});
