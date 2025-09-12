import { CustomConfigService } from '@app/core/config/config.service';
import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { Request } from 'express';

@Injectable()
export abstract class CommonProxyClient {
  protected requestRedirect(
    messagePattern: string,
    client: ClientProxy,
    req?: Request,
  ) {
    return client.send(messagePattern, {
      ...(req.params || {}),
      ...(req.query || {}),
      ...(req.body || {}),
    });
  }
}

// 중복 하드코딩 방지
export enum ProxyClientProvideService {
  TEST2_SERVICE = 'TEST2_SERVICE',
  NOTIFICATION_SERVICE = 'NOTIFICATION_SERVICE',
  BOARD_SERVICE = 'BOARD_SERVICE',
  SCHEDULER_SERVICE = 'SCHEDULER_SERVICE',
}

const TEST2_FACTORY = {
  provide: ProxyClientProvideService.TEST2_SERVICE,
  useFactory: (configService: CustomConfigService) => {
    return ClientProxyFactory.create(configService.test2ServiceOptions);
  },
  inject: [CustomConfigService],
};

const NOTIFICATION_FACTORY = {
  provide: ProxyClientProvideService.NOTIFICATION_SERVICE,
  useFactory: (configService: CustomConfigService) => {
    return ClientProxyFactory.create(configService.notificationServiceOptions);
  },
  inject: [CustomConfigService],
};

const BOARD_FACTORY = {
  provide: ProxyClientProvideService.BOARD_SERVICE,
  useFactory: (configService: CustomConfigService) => {
    return ClientProxyFactory.create(configService.boardServiceOptions);
  },
  inject: [CustomConfigService],
};

const SCHEDULER_FACTORY = {
  provide: ProxyClientProvideService.SCHEDULER_SERVICE,
  useFactory: (configService: CustomConfigService) => {
    return ClientProxyFactory.create(configService.schedulerClientOptions);
  },
  inject: [CustomConfigService],
};

export {
  TEST2_FACTORY,
  NOTIFICATION_FACTORY,
  BOARD_FACTORY,
  SCHEDULER_FACTORY,
};

export const CustomMessagePatterns = {
  // Health Check
  BoardHealthCheck: 'BoardHealthCheck',
  NotificationHealthCheck: 'NotificationHealthCheck',
  SchedulerHealthCheck: 'SchedulerHealthCheck',

  // Board
  CreateBoard: 'CreateBoard',
  FindAllBoards: 'FindAllBoards',
  UpdateBoard: 'UpdateBoard',
  DeleteBoard: 'DeleteBoard',
  CreateComment: 'CreateComment',
  FindCommentsByBoard: 'FindCommentsByBoard',

  // Scheduler
  SchedulerStart: 'SchedulerStart',
  SchedulerStop: 'SchedulerStop',
  SchedulerStatus: 'SchedulerStatus',
};
