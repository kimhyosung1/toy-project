import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from '../../src/notification.controller';
import { NotificationService } from '../../src/notification.service';

describe('NotificationController', () => {
  let controller: NotificationController;

  const mockNotificationService = {
    healthCheck: jest.fn().mockReturnValue({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    }),
    sendSlack: jest.fn().mockResolvedValue({ success: true }),
    sendSentryError: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
    jest.clearAllMocks();
  });

  it('컨트롤러가 정의되어야 합니다', () => {
    expect(controller).toBeDefined();
  });

  it('헬스 체크가 작동해야 합니다', () => {
    const result = controller.healthCheck();
    expect(result).toHaveProperty('status', 'healthy');
    expect(mockNotificationService.healthCheck).toHaveBeenCalled();
  });

  it('Slack 메시지를 전송할 수 있어야 합니다', async () => {
    const body = { message: 'test', channel: 'channel' };
    const result = await controller.sendSlack(body);
    expect(result.success).toBe(true);
    expect(mockNotificationService.sendSlack).toHaveBeenCalledWith(
      'test',
      'channel',
    );
  });
});
