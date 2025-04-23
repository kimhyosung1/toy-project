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

      // 이 설정은 현재 작업 디렉토리 (process.cwd()) 내에 있는 env/ 폴더에서 NODE_ENV 값에 맞는 환경 파일을 찾는다.
      // envFilePath: [`${process.cwd()}/env/.${process.env.NODE_ENV}.env`],

      // 로컬실행시 현재 작업 디렉토리에서 .env 파일을 찾는다.
      envFilePath: [`${process.cwd()}/.env`],
    }),
  ],
  providers: [CustomConfigService],
  exports: [CustomConfigService],
})
export class CustomConfigModule {}
