import { Controller, Get } from '@nestjs/common';
import { Test2Service } from './test2.service';
import { MessagePattern } from '@nestjs/microservices';
import { CustomMessagePatterns } from '@app/proxy/common-proxy-client';

@Controller('test2')
export class Test2Controller {
  constructor(private readonly test2Service: Test2Service) {}

  @Get()
  @MessagePattern(CustomMessagePatterns.Test2HealthCheck)
  healthCheck(): string {
    return this.test2Service.healthCheck();
  }
}
