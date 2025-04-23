import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { CustomConfigService } from '@app/common/config/config.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { CustomConfigModule } from '@app/common/config/config.module';
import { AllExceptionFilter } from 'libs/core/src/filter/exception/all-exception.filter';
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
    .setTitle('Wanted Codding Test API')
    .setDescription('Wanted Codding Test API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api-docs', app, document);

  // exception filter global로 exception filter 등록하기
  const httpAdapter = app.get(HttpAdapterHost);

  app.useGlobalFilters(new AllExceptionFilter(httpAdapter));

  const options = config.gatewayServiceOptions.options as any;

  await app.listen(options.port);

  console.log('Gateway Microservice is running');
  console.log(`Swagger 문서: http://localhost:${options.port}/api-docs`);

  if (options && options.port) {
    console.log(`Port: ${options.port}`);
  }
}
bootstrap();
