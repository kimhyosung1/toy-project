import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { RequestMethod } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { NotificationModule } from './notification.module';
import { NotificationLoggerService } from './common/logger.service';
import { NotificationValidationPipe } from './common/validation.pipe';

async function bootstrap() {
  try {
    const app = await NestFactory.create(NotificationModule, {
      logger: false,
    });

    const logger = new NotificationLoggerService('NotificationMain');
    app.useLogger(logger);

    // Exception filter는 모듈에서 처리됨

    app.useGlobalPipes(
      new NotificationValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.setGlobalPrefix('api', {
      exclude: [{ path: '/', method: RequestMethod.GET }],
    });

    // CORS 설정 (다른 앱에서 HTTP 호출할 수 있도록)
    app.enableCors({
      origin: true,
      credentials: true,
    });

    // 환경변수에서 직접 설정
    const environment = process.env.NODE_ENV || 'dev';
    const sentryDSN =
      environment === 'production'
        ? process.env.SENTRY_DSN_PRODUCTION
        : process.env.SENTRY_DSN_DEV;

    if (sentryDSN && environment !== 'local') {
      Sentry.init({
        dsn: sentryDSN,
        environment,
        normalizeDepth: 6,
        integrations: [],
        tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
        beforeSend(event) {
          event.tags = {
            ...event.tags,
            service: 'notification',
            environment,
          };
          return event;
        },
      });
      logger.log(`Sentry 초기화 완료 - 환경: ${environment}`);
    } else {
      logger.log('Sentry 설정이 없어 초기화를 건너뜁니다.');
    }

    logger.log(`알림 서비스 환경: ${environment}`);

    const port = process.env.NOTIFICATION_SERVICE_PORT || 3002;

    await app.listen(port, () => {
      logger.log(`📢 알림 서비스가 포트 ${port}에서 시작되었습니다.`);
      logger.log(`🌐 HTTP API 사용 가능: http://localhost:${port}/api`);
    });

    process.on('SIGTERM', async () => {
      logger.log('SIGTERM 수신 - 알림 서비스 종료 중...');
      await app.close();
    });

    process.on('SIGINT', async () => {
      logger.log('SIGINT 수신 - 알림 서비스 종료 중...');
      await app.close();
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('처리되지 않은 Promise 거부:', String(reason));
      Sentry.captureException(reason);
    });

    process.on('uncaughtException', (error) => {
      logger.error('처리되지 않은 예외:', error.stack);
      Sentry.captureException(error);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ 알림 서비스 시작 실패:', error);
    Sentry.captureException(error);
    process.exit(1);
  }
}
bootstrap();
