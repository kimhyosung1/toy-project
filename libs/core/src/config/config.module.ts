import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomConfigService } from './config.service';

@Global()
@Module({
  imports: [
    // nest config 모듈 동적 import
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,

      // 환경별 설정 파일 경로 (기본값: dev)
      envFilePath: [
        `${process.cwd()}/env/${process.env.NODE_ENV || 'dev'}.env`,
      ],
    }),
  ],
  providers: [CustomConfigService],
  exports: [CustomConfigService],
})
export class CustomConfigModule {}
