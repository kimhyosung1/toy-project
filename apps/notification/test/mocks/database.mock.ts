import { EntityManager } from 'typeorm';

// Mock KeywordNotificationRepository
export class MockKeywordNotificationRepository {
  findMatchingKeywords = jest.fn().mockResolvedValue([]);
}

// Mock DatabaseService
export class MockDatabaseService {
  runTransaction = jest.fn((callback) => {
    return callback({
      getRepository: jest.fn().mockReturnValue({
        delete: jest.fn().mockResolvedValue(true),
      }),
    } as unknown as EntityManager);
  });
}

// Export mock providers configuration
export const mockDatabaseProviders = [
  {
    provide: 'KeywordNotificationRepository',
    useClass: MockKeywordNotificationRepository,
  },
  {
    provide: 'DatabaseService',
    useClass: MockDatabaseService,
  },
];
