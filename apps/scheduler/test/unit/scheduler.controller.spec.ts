import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerController } from '../../src/scheduler.controller';
import { SchedulerService } from '../../src/scheduler.service';

describe('SchedulerController', () => {
  let controller: SchedulerController;

  const mockSchedulerService = {
    testScheduler: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchedulerController],
      providers: [
        {
          provide: SchedulerService,
          useValue: mockSchedulerService,
        },
      ],
    }).compile();

    controller = module.get<SchedulerController>(SchedulerController);
  });

  it('컨트롤러가 정의되어야 합니다', () => {
    expect(controller).toBeDefined();
  });
});
