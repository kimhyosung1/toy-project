import { Test, TestingModule } from '@nestjs/testing';
import { FileController } from '../../src/file.controller';
import { FileService } from '../../src/file.service';

describe('FileController', () => {
  let controller: FileController;

  const mockFileService = {
    healthCheck: jest.fn().mockReturnValue('File service is alive!!'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [
        {
          provide: FileService,
          useValue: mockFileService,
        },
      ],
    }).compile();

    controller = module.get<FileController>(FileController);
  });

  it('컨트롤러가 정의되어야 합니다', () => {
    expect(controller).toBeDefined();
  });

  it('헬스 체크가 작동해야 합니다', () => {
    const result = controller.healthCheck();
    expect(result).toBe('File service is alive!!');
  });
});
