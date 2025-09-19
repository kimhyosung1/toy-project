import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from '../../src/account.service';
import { DatabaseService } from '@app/database';

describe('AccountService', () => {
  let service: AccountService;

  const mockDatabaseService = {
    runTransaction: jest.fn(),
    getConnection: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AccountService,
          useFactory: () => new AccountService(mockDatabaseService as any),
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
  });

  it('서비스가 정의되어야 합니다', () => {
    expect(service).toBeDefined();
  });

  it('헬스 체크가 작동해야 합니다', () => {
    const result = service.healthCheck();
    expect(result).toBe('Account service is alive!!');
  });
});
