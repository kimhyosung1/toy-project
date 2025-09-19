import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from '../../src/account.controller';
import { AccountService } from '../../src/account.service';

describe('AccountController', () => {
  let controller: AccountController;

  const mockAccountService = {
    healthCheck: jest.fn().mockReturnValue('Account service is alive!!'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: mockAccountService,
        },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
  });

  it('컨트롤러가 정의되어야 합니다', () => {
    expect(controller).toBeDefined();
  });

  it('헬스 체크가 작동해야 합니다', () => {
    const result = controller.healthCheck();
    expect(result).toBe('Account service is alive!!');
  });
});
