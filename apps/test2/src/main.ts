import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { Test2Module } from './test2.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { CustomConfigService } from '@app/core/config/config.service';
import { CustomConfigModule } from '@app/core/config/config.module';
import { AllExceptionFilter } from '@app/core/filter/exception/all-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const context =
    await NestFactory.createApplicationContext(CustomConfigModule);
  const config = context.get(CustomConfigService);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    Test2Module,
    config.test2MicroserviceOptions,
  );

  // 📋 ValidationPipe를 전역으로 적용
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 자동 형변환 활성화
    }),
  );

  // 🚨 모든 예외를 처리하는 전역 필터 등록 (HTTP, RPC 모두 처리)
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionFilter(httpAdapter));

  // 🚀 인터셉터는 InterceptorModule에서 처리

  await app.listen();

  // 옵션에 접근
  const options = config.test2MicroserviceOptions.options as any;
  if (options && options.port) {
    console.log(`Test2 Microservice is running on port: ${options.port}`);
  }
}
bootstrap();
