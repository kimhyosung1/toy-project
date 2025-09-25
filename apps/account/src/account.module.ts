import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { DatabaseModule } from '@app/database';
import { CustomConfigModule } from '@app/core/config/config.module';
import { CustomConfigService } from '@app/core/config/config.service';
import { RedisModule } from '@app/core/redis';
import { ResponseOnlyInterceptorModule } from '@app/common';
import { UtilityModule } from '@app/utility';

@Module({
  imports: [
    CustomConfigModule,
    DatabaseModule,
    RedisModule,
    ResponseOnlyInterceptorModule, // 🔄 응답 데이터 검증/변환만 수행
    UtilityModule, // 🛠️ UtilityService 전역 사용
    // JWT 설정
    JwtModule.registerAsync({
      imports: [CustomConfigModule],
      inject: [CustomConfigService],
      useFactory: (configService: CustomConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: {
          expiresIn: configService.jwtExpiresIn,
        },
      }),
    }),
  ],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService], // 다른 모듈에서 사용할 수 있도록 export
})
export class AccountModule {}
