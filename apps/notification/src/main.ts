import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NotificationModule } from './notification.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { CustomConfigService } from '@app/common/config/config.service';
import { CustomConfigModule } from '@app/common/config/config.module';
import { AllExceptionFilter } from 'libs/core/src/filter/exception/all-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // 설정 가져오기 위한 임시 컨텍스트
  const context =
    await NestFactory.createApplicationContext(CustomConfigModule);
  const config = context.get(CustomConfigService);

  // TCP 마이크로서비스 생성
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationModule,
    config.notificationMicroserviceOptions,
  );

  // 예외 필터 등록
  const httpAdapter = app.get(HttpAdapterHost);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 자동 형변환 활성화
    }),
  );
  app.useGlobalFilters(new AllExceptionFilter(httpAdapter));

  // 서비스 시작
  await app.listen();

  console.log('Notification Microservice is running');

  // 옵션에 접근
  const options = config.notificationMicroserviceOptions.options as any;
  if (options && options.port) {
    console.log(`Port: ${options.port}`);
  }
}
bootstrap();
