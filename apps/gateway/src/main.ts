import { HttpAdapterHost, NestFactory } from '@nestjs/core';
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

  // 🚀 게이트웨이는 단순 프록시 역할 (인터셉터 없음)

  const options = config.gatewayServiceOptions.options as any;

  await app.listen(options.port);

  console.log('Gateway Microservice is running');
  console.log(`Swagger 문서: http://localhost:${options.port}/api-docs`);

  if (options && options.port) {
    console.log(`Port: ${options.port}`);
  }
}
bootstrap();
