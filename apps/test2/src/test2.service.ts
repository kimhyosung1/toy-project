import { CustomConfigService } from '@app/common/config/config.service';
import { TestRepository2 } from '@app/database/repositories/test.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Test2Service {
  constructor(
    private readonly customConfigService: CustomConfigService,
    private testRepository: TestRepository2,
  ) {}

  healthCheck(): string {
    return 'i am alive!!';
  }
}
