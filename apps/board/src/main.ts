import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { BoardModule } from './board.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { CustomConfigService } from '@app/core/config/config.service';
import { CustomConfigModule } from '@app/core/config/config.module';
import { AllExceptionFilter } from '@app/core/filter/exception/all-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // 설정 가져오기 위한 임시 컨텍스트
  const context =
    await NestFactory.createApplicationContext(CustomConfigModule);
  const config = context.get(CustomConfigService);

  // TCP 마이크로서비스 생성
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    BoardModule,
    config.boardMicroserviceOptions,
  );

  // 예외 필터 등록
  const httpAdapter = app.get(HttpAdapterHost);

  // 📋 ValidationPipe를 전역으로 적용
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 자동 형변환 활성화
    }),
  );

  // 🚨 모든 예외를 처리하는 전역 필터 등록 (HTTP, RPC 모두 처리)
  app.useGlobalFilters(new AllExceptionFilter(httpAdapter));

  // 🚀 인터셉터는 InterceptorModule에서 처리

  // 서비스 시작
  await app.listen();

  console.log('Board Microservice is running');

  // 옵션에 접근
  const options = config.boardMicroserviceOptions.options as any;
  if (options && options.port) {
    console.log(`Port: ${options.port}`);
  }
}
bootstrap();
