import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerService } from '../../src/scheduler.service';
import { CustomConfigService } from '@app/core';
import { UtilityService } from '@app/utility';
import { BoardSchedulerService } from '../../src/board/board-scheduler.service';

describe('SchedulerService', () => {
  let service: SchedulerService;

  const mockConfigService = {};
  const mockUtilityService = {};
  const mockBoardSchedulerService = {
    testScheduler: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SchedulerService,
          useFactory: () =>
            new SchedulerService(
              mockConfigService as any,
              mockUtilityService as any,
              mockBoardSchedulerService as any,
            ),
        },
      ],
    }).compile();

    service = module.get<SchedulerService>(SchedulerService);
  });

  it('서비스가 정의되어야 합니다', () => {
    expect(service).toBeDefined();
  });

  it('테스트 스케줄러가 작동해야 합니다', async () => {
    await service.testScheduler();
    expect(mockBoardSchedulerService.testScheduler).toHaveBeenCalled();
  });
});
