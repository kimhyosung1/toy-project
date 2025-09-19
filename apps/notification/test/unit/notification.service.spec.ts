import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../../src/notification.service';
import { SlackService, SentryService } from '@app/notification';

describe('NotificationService', () => {
  let service: NotificationService;

  const mockSlackService = {
    sendMessage: jest.fn().mockResolvedValue(true),
    sendError: jest.fn().mockResolvedValue(true),
    sendSuccess: jest.fn().mockResolvedValue(true),
    sendWarning: jest.fn().mockResolvedValue(true),
  };

  const mockSentryService = {
    reportError: jest.fn().mockResolvedValue(true),
    reportMessage: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: NotificationService,
          useFactory: () =>
            new NotificationService(
              mockSlackService as any,
              mockSentryService as any,
            ),
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    jest.clearAllMocks();
  });

  it('서비스가 정의되어야 합니다', () => {
    expect(service).toBeDefined();
  });

  it('헬스 체크가 작동해야 합니다', () => {
    const result = service.healthCheck();
    expect(result).toHaveProperty('status', 'healthy');
    expect(result).toHaveProperty('timestamp');
  });

  it('Slack 메시지를 전송할 수 있어야 합니다', async () => {
    const result = await service.sendSlack('test');
    expect(result.success).toBe(true);
  });

  it('Sentry 에러를 리포팅할 수 있어야 합니다', async () => {
    const result = await service.sendSentryError('error');
    expect(result.success).toBe(true);
  });
});
