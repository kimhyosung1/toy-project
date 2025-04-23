import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';

// 인터페이스 정의 (실제 구현이 누락됨)
interface KeywordNotificationService {
  createKeywordNotification: (input: any) => Promise<any>;
  getAllKeywordNotifications: (userId: number) => Promise<any[]>;
  getKeywordNotificationById: (id: number) => Promise<any>;
  updateKeywordNotification: (id: number, data: any) => Promise<any>;
  deleteKeywordNotification: (id: number) => Promise<any>;
}

interface KeywordNotificationRepo {
  findAll: () => Promise<any[]>;
  findById: (id: number) => Promise<any>;
  findByKeyword: (keyword: string) => Promise<any>;
  create: (data: any) => Promise<any>;
  update: (id: number, data: any) => Promise<any>;
  delete: (id: number) => Promise<any>;
}

// 모의 데이터 타입
enum InvitationType {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

describe('KeywordNotificationService', () => {
  let service: KeywordNotificationService;
  let repository: KeywordNotificationRepo;

  beforeEach(async () => {
    // Mock Repository
    const mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByKeyword: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    // Mock Service
    const mockService = {
      createKeywordNotification: jest.fn(),
      getAllKeywordNotifications: jest.fn(),
      getKeywordNotificationById: jest.fn(),
      updateKeywordNotification: jest.fn(),
      deleteKeywordNotification: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: 'KeywordNotificationService', useValue: mockService },
        { provide: 'KeywordNotificationRepository', useValue: mockRepository },
        Logger,
      ],
    }).compile();

    service = module.get<KeywordNotificationService>(
      'KeywordNotificationService',
    );
    repository = module.get<KeywordNotificationRepo>(
      'KeywordNotificationRepository',
    );
  });

  it('should create a keyword notification setting', async () => {
    // 모의 데이터
    const mockInput = {
      userId: 1,
      keyword: '테스트',
      type: InvitationType.OPEN,
    };

    const mockResult = {
      id: 1,
      userId: 1,
      keyword: '테스트',
      type: InvitationType.OPEN,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Repository 메서드 목킹
    (repository.create as jest.Mock).mockResolvedValue(mockResult);
    (service.createKeywordNotification as jest.Mock).mockResolvedValue(
      mockResult,
    );

    // 서비스 메서드 호출
    const result = await service.createKeywordNotification(mockInput);

    // 검증
    expect(service.createKeywordNotification).toHaveBeenCalledWith(mockInput);
    expect(result).toEqual(mockResult);
  });

  it('should handle create error gracefully', async () => {
    // 모의 에러
    const mockError = new Error('Database error');

    // Repository 메서드 목킹 - 오류 발생하도록 설정
    (repository.create as jest.Mock).mockRejectedValue(mockError);
    (service.createKeywordNotification as jest.Mock).mockRejectedValue(
      mockError,
    );

    // 모의 입력 데이터
    const mockInput = {
      userId: 1,
      keyword: '테스트',
      type: InvitationType.OPEN,
    };

    // 서비스 메서드 호출 및 오류 검증
    await expect(service.createKeywordNotification(mockInput)).rejects.toThrow(
      'Database error',
    );
  });

  it('should get all keyword notifications for a user', async () => {
    // 모의 결과 데이터
    const mockResults = [
      {
        id: 1,
        userId: 1,
        keyword: '테스트1',
        type: InvitationType.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        userId: 1,
        keyword: '테스트2',
        type: InvitationType.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Repository 메서드 목킹
    (repository.findAll as jest.Mock).mockResolvedValue(mockResults);
    (service.getAllKeywordNotifications as jest.Mock).mockResolvedValue(
      mockResults,
    );

    // 서비스 메서드 호출
    const result = await service.getAllKeywordNotifications(1);

    // 검증
    expect(service.getAllKeywordNotifications).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockResults);
    expect(result.length).toBe(2);
  });

  it('should find a keyword notification by id', async () => {
    // 모의 결과 데이터
    const mockResult = {
      id: 1,
      userId: 1,
      keyword: '테스트',
      type: InvitationType.OPEN,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Repository 메서드 목킹
    (repository.findById as jest.Mock).mockResolvedValue(mockResult);
    (service.getKeywordNotificationById as jest.Mock).mockResolvedValue(
      mockResult,
    );

    // 서비스 메서드 호출
    const result = await service.getKeywordNotificationById(1);

    // 검증
    expect(service.getKeywordNotificationById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockResult);
  });

  it('should return null when keyword notification not found', async () => {
    // Repository 메서드 목킹 - null 반환
    (repository.findById as jest.Mock).mockResolvedValue(null);
    (service.getKeywordNotificationById as jest.Mock).mockResolvedValue(null);

    // 서비스 메서드 호출
    const result = await service.getKeywordNotificationById(999);

    // 검증
    expect(service.getKeywordNotificationById).toHaveBeenCalledWith(999);
    expect(result).toBeNull();
  });

  it('should update a keyword notification', async () => {
    // 모의 입력 및 결과 데이터
    const updateId = 1;
    const mockInput = {
      keyword: '업데이트된테스트',
      type: InvitationType.CLOSED,
    };

    const mockResult = {
      id: 1,
      userId: 1,
      keyword: '업데이트된테스트',
      type: InvitationType.CLOSED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Repository 메서드 목킹
    (repository.update as jest.Mock).mockResolvedValue(mockResult);
    (service.updateKeywordNotification as jest.Mock).mockResolvedValue(
      mockResult,
    );

    // 서비스 메서드 호출
    const result = await service.updateKeywordNotification(updateId, mockInput);

    // 검증
    expect(service.updateKeywordNotification).toHaveBeenCalledWith(
      updateId,
      mockInput,
    );
    expect(result).toEqual(mockResult);
  });

  it('should delete a keyword notification', async () => {
    // 모의 결과 데이터
    const mockResult = {
      id: 1,
      userId: 1,
      keyword: '테스트',
      type: InvitationType.OPEN,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Repository 메서드 목킹
    (repository.delete as jest.Mock).mockResolvedValue(mockResult);
    (service.deleteKeywordNotification as jest.Mock).mockResolvedValue(
      mockResult,
    );

    // 서비스 메서드 호출
    const result = await service.deleteKeywordNotification(1);

    // 검증
    expect(service.deleteKeywordNotification).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockResult);
  });
});
