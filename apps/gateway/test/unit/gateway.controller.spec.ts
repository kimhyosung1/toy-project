import { Test, TestingModule } from '@nestjs/testing';
import { GatewayController } from '../../src/gateway.controller';
import { ClientProxy } from '@nestjs/microservices';
import { ProxyClientProvideService } from 'libs/proxy/src/common-proxy-client';

describe('GatewayController', () => {
  let controller: GatewayController;

  const mockClientProxy = {
    send: jest.fn(),
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GatewayController],
      providers: [
        {
          provide: ProxyClientProvideService.TEST2_SERVICE,
          useValue: mockClientProxy,
        },
        {
          provide: ProxyClientProvideService.NOTIFICATION_SERVICE,
          useValue: mockClientProxy,
        },
        {
          provide: ProxyClientProvideService.BOARD_SERVICE,
          useValue: mockClientProxy,
        },
        {
          provide: ProxyClientProvideService.SCHEDULER_SERVICE,
          useValue: mockClientProxy,
        },
      ],
    }).compile();

    controller = module.get<GatewayController>(GatewayController);
  });

  it('컨트롤러가 정의되어야 합니다', () => {
    expect(controller).toBeDefined();
  });

  it('헬스 체크가 작동해야 합니다', () => {
    const result = controller.getServiceCheck();
    expect(result).toBe('gateway api response test');
  });
});
