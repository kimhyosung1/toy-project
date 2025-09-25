import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { SchedulerModule } from './scheduler.module';
import { AllExceptionFilter } from '@app/core/filter/exception/all-exception.filter';
import { RequestMethod, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  try {
    // 스케줄러 앱 생성 (간단한 구조)
    const app = await NestFactory.create(SchedulerModule);

    // 🚨 전역 Exception Filter 등록 (서버 안정성 보장)
    const httpAdapterHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionFilter(httpAdapterHost));

    // 📋 ValidationPipe를 전역으로 적용 (Notification 앱과 동일한 설정)
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true, // 자동 형변환 활성화
      }),
    );

    // API prefix 설정
    app.setGlobalPrefix('api', {
      exclude: [{ path: '/', method: RequestMethod.GET }],
    });

    const port = process.env.SCHEDULER_SERVICE_PORT || 3004;

    // 서버 시작
    await app.listen(port);
    console.log(`🕒 스케줄러 서비스가 포트 ${port}에서 시작되었습니다.`);

    // 프로세스 종료 처리
    ['SIGTERM', 'SIGINT'].forEach((signal) => {
      process.on(signal, async () => {
        console.log(`${signal} 수신 - 스케줄러 서비스 종료 중...`);
        await app.close();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ 스케줄러 서비스 시작 실패:', error);
    process.exit(1);
  }
}

bootstrap();
