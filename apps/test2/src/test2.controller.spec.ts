import { Test, TestingModule } from '@nestjs/testing';
import { Test2Controller } from './test2.controller';
import { Test2Service } from './test2.service';

// Test2Service 의존성을 위한 Mock 생성
const mockTest2Service = {
  healthCheck: jest.fn().mockReturnValue('Hello World!'),
};

describe('Test2Controller', () => {
  let test2Controller: Test2Controller;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Test2Controller],
      providers: [
        {
          provide: Test2Service,
          useValue: mockTest2Service,
        },
      ],
    }).compile();

    test2Controller = app.get<Test2Controller>(Test2Controller);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(test2Controller.healthCheck()).toBe('Hello World!');
    });
  });
});
