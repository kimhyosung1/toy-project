import { Module, DynamicModule, Global } from '@nestjs/common';
import { NotificationClientService } from './notification-client.service';

export interface NotificationClientModuleOptions {
  notificationServiceUrl?: string;
  isGlobal?: boolean;
}

@Module({})
export class NotificationClientModule {
  /**
   * 동적 모듈로 설정
   *
   * @example
   * // 기본 설정 (localhost:3005)
   * NotificationClientModule.forRoot()
   *
   * // 커스텀 URL 설정
   * NotificationClientModule.forRoot({
   *   notificationServiceUrl: 'http://notification-service:3005'
   * })
   *
   * // 글로벌 모듈로 설정
   * NotificationClientModule.forRoot({
   *   notificationServiceUrl: 'http://notification-service:3005',
   *   isGlobal: true
   * })
   */
  static forRoot(options: NotificationClientModuleOptions = {}): DynamicModule {
    const {
      notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL ||
        'http://localhost:3005',
      isGlobal = false,
    } = options;

    return {
      module: NotificationClientModule,
      global: isGlobal,
      providers: [
        {
          provide: 'NOTIFICATION_SERVICE_URL',
          useValue: notificationServiceUrl,
        },
        {
          provide: NotificationClientService,
          useFactory: (url: string) => new NotificationClientService(url),
          inject: ['NOTIFICATION_SERVICE_URL'],
        },
      ],
      exports: [NotificationClientService],
    };
  }

  /**
   * 비동기 설정 (ConfigService 등과 함께 사용)
   *
   * @example
   * NotificationClientModule.forRootAsync({
   *   inject: [CustomConfigService],
   *   useFactory: (config: CustomConfigService) => ({
   *     notificationServiceUrl: config.notificationServiceUrl,
   *     isGlobal: true,
   *   }),
   * })
   */
  static forRootAsync(options: {
    useFactory: (
      ...args: any[]
    ) =>
      | NotificationClientModuleOptions
      | Promise<NotificationClientModuleOptions>;
    inject?: any[];
    isGlobal?: boolean;
  }): DynamicModule {
    return {
      module: NotificationClientModule,
      global: options.isGlobal || false,
      providers: [
        {
          provide: 'NOTIFICATION_CLIENT_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: NotificationClientService,
          useFactory: (moduleOptions: NotificationClientModuleOptions) => {
            const notificationServiceUrl =
              moduleOptions.notificationServiceUrl ||
              process.env.NOTIFICATION_SERVICE_URL ||
              'http://localhost:3005';
            return new NotificationClientService(notificationServiceUrl);
          },
          inject: ['NOTIFICATION_CLIENT_OPTIONS'],
        },
      ],
      exports: [NotificationClientService],
    };
  }
}
