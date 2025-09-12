import { Controller, Get, Inject, Req } from '@nestjs/common';
import {
  CommonProxyClient,
  ProxyClientProvideService,
  CustomMessagePatterns,
  SCHEDULER_FACTORY,
} from 'libs/proxy/src/common-proxy-client';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
@Controller()
@ApiTags('Gateway')
export class GatewayController extends CommonProxyClient {
  constructor(
    @Inject(ProxyClientProvideService.TEST2_SERVICE)
    protected Test2Client: ClientProxy,
    @Inject(ProxyClientProvideService.NOTIFICATION_SERVICE)
    protected NotificationClient: ClientProxy,
    @Inject(ProxyClientProvideService.BOARD_SERVICE)
    protected BoardClient: ClientProxy,
    @Inject(ProxyClientProvideService.SCHEDULER_SERVICE)
    protected SchedulerClient: ClientProxy,
  ) {
    super();
  }

  @Get('health-check')
  @ApiOperation({ summary: 'Gateway App Health Check API' })
  @ApiOkResponse({ type: String })
  getServiceCheck(): string {
    return 'gateway api response test';
  }

  @Get('board/health-check')
  @ApiOperation({ summary: 'Board App Health Check API.....' })
  @ApiOkResponse({ type: String })
  public healthCheck(@Req() req: Request) {
    return this.requestRedirect(
      CustomMessagePatterns.BoardHealthCheck,
      this.BoardClient,
      req,
    );
  }

  @Get('notification/health-check')
  @ApiOperation({ summary: 'notification App Health Check API' })
  @ApiOkResponse({ type: String })
  public notificationHealthCheck(@Req() req: Request) {
    return this.requestRedirect(
      CustomMessagePatterns.NotificationHealthCheck,
      this.NotificationClient,
      req,
    );
  }

  @Get('scheduler/health-check')
  @ApiOperation({ summary: 'Scheduler App Health Check API' })
  @ApiOkResponse({ type: String })
  public schedulerHealthCheck(@Req() req: Request) {
    return this.requestRedirect(
      CustomMessagePatterns.SchedulerHealthCheck,
      this.SchedulerClient,
      req,
    );
  }
}
