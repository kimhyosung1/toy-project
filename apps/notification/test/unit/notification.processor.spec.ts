import { Test, TestingModule } from '@nestjs/testing';
import { NotificationProcessor } from '../../src/notification.processor';
import { NotificationService } from '../../src/notification.service';
import { Logger } from '@nestjs/common';
import { SOURCE_TYPE, RedisQueueName } from '@app/common/constants';
import { Job } from 'bull';

describe('NotificationProcessor', () => {
  let processor: NotificationProcessor;
  let notificationService: NotificationService;
  let loggerSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let consoleSpy: jest.SpyInstance;

  beforeEach(async () => {
    // NotificationService 모킹
    const mockNotificationService = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationProcessor,
        { provide: NotificationService, useValue: mockNotificationService },
        Logger,
      ],
    }).compile();

    processor = module.get<NotificationProcessor>(NotificationProcessor);
    notificationService = module.get<NotificationService>(NotificationService);

    // Logger 스파이 설정
    loggerSpy = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => {});
    errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processNotification', () => {
    it('키워드 알림 작업을 정상적으로 처리한다', async () => {
      const jobData = {
        title: '테스트 게시글',
        content: '테스트 내용',
        sourceType: SOURCE_TYPE.BOARD,
        sourceId: 1,
        matchedKeywords: {
          keyNotificationId: 1,
          author: '사용자1',
          keyword: '테스트',
        },
        timestamp: new Date().toISOString(),
      };

      // job 객체 생성
      const job = {
        id: 'test-job-id',
        name: 'user1-notification-BOARD',
        data: jobData,
      } as unknown as Job<any>;

      // 실행
      await processor.processNotification(job);

      // 검증
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(`[알림 프로세서] ${job.name} 작업 처리 시작`),
      );
      expect(consoleSpy).toHaveBeenCalledWith('job.data', jobData);
    });

    it('오류 발생시 적절히 처리하고 다시 던진다', async () => {
      const jobData = {
        title: '테스트 게시글',
        content: '테스트 내용',
        sourceType: SOURCE_TYPE.BOARD,
        sourceId: 1,
        matchedKeywords: {
          keyNotificationId: 1,
          author: '사용자1',
          keyword: '테스트',
        },
        timestamp: new Date().toISOString(),
      };

      // job 객체 생성
      const job = {
        id: 'test-job-id',
        name: 'user1-notification-BOARD',
        data: jobData,
      } as unknown as Job<any>;

      // 모킹 초기화
      jest.clearAllMocks();

      // Logger가 오류를 발생시키도록 설정
      loggerSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementationOnce(() => {
          throw new Error('테스트 오류');
        });

      // 실행 및 오류 발생 테스트
      await expect(processor.processNotification(job)).rejects.toThrow(
        '테스트 오류',
      );

      // 오류 로깅 확인
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '[알림 프로세서] 작업 처리 중 오류: 테스트 오류',
        ),
        expect.any(String),
      );
    });

    it('키워드 매칭된 알림 작업을 정상 처리한다', async () => {
      // 모의 작업 데이터
      const job = {
        id: 'test-job-id',
        name: 'keyword-notification',
        data: {
          sourceType: SOURCE_TYPE.BOARD,
          sourceId: 1,
          title: '테스트 게시글',
          content: '테스트 내용',
          keywordMatch: {
            keyNotificationId: 1,
            author: '사용자1',
            keyword: '테스트',
          },
          timestamp: new Date().toISOString(),
        },
      } as unknown as Job<any>;

      // 모킹 초기화
      jest.clearAllMocks();

      // 실행
      await processor.processNotification(job);

      // 검증
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(`[알림 프로세서] ${job.name} 작업 처리 시작`),
      );
      expect(consoleSpy).toHaveBeenCalledWith('job.data', job.data);
    });

    it('컨텐츠 없는 작업도 정상 처리한다', async () => {
      // 모의 작업 데이터 (content 없음)
      const job = {
        id: 'test-job-id',
        name: 'keyword-notification',
        data: {
          sourceType: SOURCE_TYPE.BOARD,
          sourceId: 1,
          title: '테스트 게시글',
          keywordMatch: {
            keyNotificationId: 1,
            author: '사용자1',
            keyword: '테스트',
          },
          timestamp: new Date().toISOString(),
        },
      } as unknown as Job<any>;

      // 모킹 초기화
      jest.clearAllMocks();

      // 실행
      await processor.processNotification(job);

      // 검증
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(`[알림 프로세서] ${job.name} 작업 처리 시작`),
      );
      expect(consoleSpy).toHaveBeenCalledWith('job.data', job.data);
    });

    it('다양한 형식의 제목을 처리할 수 있다', async () => {
      const job = {
        id: 'test-job-id',
        name: 'keyword-notification',
        data: {
          sourceType: SOURCE_TYPE.BOARD,
          sourceId: 1,
          title: '새로운 게시글',
          content: '게시글 내용',
          keywordMatch: {
            keyNotificationId: 1,
            author: '홍길동',
            keyword: '중요공지',
          },
          timestamp: new Date().toISOString(),
        },
      } as unknown as Job<any>;

      // 모킹 초기화
      jest.clearAllMocks();

      // 실행
      await processor.processNotification(job);

      // 검증
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(`[알림 프로세서] ${job.name} 작업 처리 시작`),
      );
      expect(consoleSpy).toHaveBeenCalledWith('job.data', job.data);
    });
  });
});
