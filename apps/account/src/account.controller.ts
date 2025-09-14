import { Controller } from '@nestjs/common';
import { AccountService } from './account.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CustomMessagePatterns } from '@app/proxy/common-proxy-client';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  // 헬스 체크
  @MessagePattern(CustomMessagePatterns.AccountHealthCheck)
  healthCheck(): string {
    return this.accountService.healthCheck();
  }
}
