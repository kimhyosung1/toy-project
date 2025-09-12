import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientOptions,
  MicroserviceOptions,
  Transport,
} from '@nestjs/microservices';

@Injectable()
export class CustomConfigService {
  constructor(protected readonly configService: ConfigService) {}

  get gatewayServiceOptions(): ClientOptions {
    return {
      transport: Transport.TCP,
      options: {
        host: this.configService.get<string>(
          'GATEWAY_SERVICE_HOST',
          '127.0.0.1',
        ),
        port: parseInt(
          this.configService.get<string>('GATEWAY_SERVICE_PORT', '3000'),
        ),
      },
    };
  }

  // NestFactory.createMicroservice()용 옵션 (MicroserviceOptions)
  get test2MicroserviceOptions(): MicroserviceOptions {
    return {
      transport: Transport.TCP,
      options: {
        host: this.configService.get<string>('TEST2_SERVICE_HOST', '127.0.0.1'),
        port: parseInt(
          this.configService.get<string>('TEST2_SERVICE_PORT', '3003'),
        ),
      },
    };
  }

  // ClientProxyFactory.create()용 옵션 (ClientOptions)
  get test2ServiceOptions(): ClientOptions {
    return {
      transport: Transport.TCP,
      options: {
        host: this.configService.get<string>('TEST2_SERVICE_HOST', '127.0.0.1'),
        port: parseInt(
          this.configService.get<string>('TEST2_SERVICE_PORT', '3003'),
        ),
      },
    };
  }

  // NestFactory.createMicroservice()용 옵션 (MicroserviceOptions)
  get boardMicroserviceOptions(): MicroserviceOptions {
    return {
      transport: Transport.TCP,
      options: {
        host: this.configService.get<string>('BOARD_SERVICE_HOST', '127.0.0.1'),
        port: parseInt(
          this.configService.get<string>('BOARD_SERVICE_PORT', '3001'),
        ),
      },
    };
  }

  // ClientProxyFactory.create()용 옵션 (ClientOptions)
  get boardServiceOptions(): ClientOptions {
    return {
      transport: Transport.TCP,
      options: {
        host: this.configService.get<string>('BOARD_SERVICE_HOST', '127.0.0.1'),
        port: parseInt(
          this.configService.get<string>('BOARD_SERVICE_PORT', '3001'),
        ),
      },
    };
  }

  // NestFactory.createMicroservice()용 옵션 (MicroserviceOptions)
  get notificationMicroserviceOptions(): MicroserviceOptions {
    return {
      transport: Transport.TCP,
      options: {
        host: this.configService.get<string>(
          'NOTIFICATION_SERVICE_HOST',
          '127.0.0.1',
        ),
        port: parseInt(
          this.configService.get<string>('NOTIFICATION_SERVICE_PORT', '3002'),
        ),
      },
    };
  }

  // ClientProxyFactory.create()용 옵션 (ClientOptions)
  get notificationServiceOptions(): ClientOptions {
    return {
      transport: Transport.TCP,
      options: {
        host: this.configService.get<string>(
          'NOTIFICATION_SERVICE_HOST',
          '127.0.0.1',
        ),
        port: parseInt(
          this.configService.get<string>('NOTIFICATION_SERVICE_PORT', '3002'),
        ),
      },
    };
  }

  get dbHost(): string {
    return this.configService.get<string>('DB_HOST', 'localhost');
  }

  get dbPW(): string {
    return this.configService.get<string>('DB_PASSWORD', '');
  }

  get dbUserName(): string {
    return this.configService.get<string>('DB_USERNAME', 'root');
  }

  get dbPort(): number {
    return this.configService.get<number>('DB_PORT', 3306);
  }

  get dbDatabase(): string {
    return this.configService.get<string>('DB_DATABASE', 'public');
  }

  get dbSchema(): string {
    return this.configService.get<string>('DB_SCHEMA', 'public');
  }

  get dbSync(): boolean {
    return this.configService.get<boolean>('DB_SYNC', false);
  }

  get redisHost(): string {
    return this.configService.get<string>('REDIS_HOST', 'localhost');
  }

  get redisPort(): number {
    return this.configService.get<number>('REDIS_PORT', 6379);
  }
}
