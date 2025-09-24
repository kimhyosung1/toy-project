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
  ACCOUNT_SERVICE = 'ACCOUNT_SERVICE',
  FILE_SERVICE = 'FILE_SERVICE',
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

const ACCOUNT_FACTORY = {
  provide: ProxyClientProvideService.ACCOUNT_SERVICE,
  useFactory: (configService: CustomConfigService) => {
    return ClientProxyFactory.create(configService.accountServiceOptions);
  },
  inject: [CustomConfigService],
};

const FILE_FACTORY = {
  provide: ProxyClientProvideService.FILE_SERVICE,
  useFactory: (configService: CustomConfigService) => {
    return ClientProxyFactory.create(configService.fileServiceOptions);
  },
  inject: [CustomConfigService],
};

export {
  TEST2_FACTORY,
  NOTIFICATION_FACTORY,
  BOARD_FACTORY,
  SCHEDULER_FACTORY,
  ACCOUNT_FACTORY,
  FILE_FACTORY,
};

export const CustomMessagePatterns = {
  // Health Check
  BoardHealthCheck: 'BoardHealthCheck',
  NotificationHealthCheck: 'NotificationHealthCheck',
  SchedulerHealthCheck: 'SchedulerHealthCheck',
  AccountHealthCheck: 'AccountHealthCheck',
  FileHealthCheck: 'FileHealthCheck',

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

  // Account
  AccountInfo: 'AccountInfo',
  CreateAccount: 'CreateAccount',
  UpdateAccount: 'UpdateAccount',
  DeleteAccount: 'DeleteAccount',
  SignInAccount: 'SignInAccount',
  ValidateToken: 'ValidateToken',

  // File
  UploadFile: 'UploadFile',
  DownloadFile: 'DownloadFile',
  ListFiles: 'ListFiles',
  DeleteFile: 'DeleteFile',
  FileInfo: 'FileInfo',
};
