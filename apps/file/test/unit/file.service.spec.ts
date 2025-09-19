import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from '../../src/file.service';
import { DatabaseService } from '@app/database';

describe('FileService', () => {
  let service: FileService;

  const mockDatabaseService = {
    runTransaction: jest.fn(),
    getConnection: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: FileService,
          useFactory: () => new FileService(mockDatabaseService as any),
        },
      ],
    }).compile();

    service = module.get<FileService>(FileService);
  });

  it('서비스가 정의되어야 합니다', () => {
    expect(service).toBeDefined();
  });

  it('헬스 체크가 작동해야 합니다', () => {
    const result = service.healthCheck();
    expect(result).toBe('File service is alive!!');
  });
});
