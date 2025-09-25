import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { GatewayModule } from './gateway.module';
import { CustomConfigService } from '@app/core/config/config.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { CustomConfigModule } from '@app/core/config/config.module';
import { AllExceptionFilter } from '@app/core/filter/exception/all-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const context =
    await NestFactory.createApplicationContext(CustomConfigModule);
  const config = context.get(CustomConfigService);

  const app = await NestFactory.create<NestExpressApplication>(GatewayModule);

  app.enableCors({
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
  });

  // Swagger 설정
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJS 마이크로서비스 스켈레톤 API')
    .setDescription('NestJS 마이크로서비스 스켈레톤 프로젝트 API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api-docs', app, document);

  // 🚨 모든 예외를 처리하는 전역 필터 등록 (HTTP, RPC 모두 처리)
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionFilter(httpAdapter));

  // 🌐 API prefix 설정 (Gateway가 모든 HTTP 요청의 진입점)
  app.setGlobalPrefix('api', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });

  // 📋 ValidationPipe를 전역으로 적용 (Gateway에서 검증 후 TCP 전달)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 자동 형변환 활성화
      // whitelist: true, // DTO에 정의된 속성만 허용
      // forbidNonWhitelisted: true, // 정의되지 않은 속성 차단
    }),
  );

  // 🚀 게이트웨이는 검증 후 TCP 프록시 역할

  const options = config.gatewayServiceOptions.options as any;

  await app.listen(options.port);

  console.log('Gateway Microservice is running');
  console.log(`Swagger 문서: http://localhost:${options.port}/api-docs`);

  if (options && options.port) {
    console.log(`Port: ${options.port}`);
  }
}
bootstrap();
