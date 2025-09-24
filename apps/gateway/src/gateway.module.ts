import { CustomConfigModule } from '@app/core/config/config.module';
import { CustomConfigService } from '@app/core/config/config.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GatewayController } from './gateway.controller';
import {
  BOARD_FACTORY,
  NOTIFICATION_FACTORY,
  TEST2_FACTORY,
  SCHEDULER_FACTORY,
  ACCOUNT_FACTORY,
} from 'libs/proxy/src/common-proxy-client';
import { BoardController } from './board.controller';
import { AccountController } from './account.controller';
import { HealthController } from './health.controller';
import { UtilityModule } from '@app/utility';
import { CustomJwtAuthGuard } from '@app/common';

@Module({
  imports: [
    CustomConfigModule,
    UtilityModule, // 🛠️ UtilityService 전역 사용
    // JWT 설정 (Gateway에서 토큰 검증용)
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
  controllers: [
    GatewayController,
    BoardController,
    AccountController,
    HealthController,
  ],
  providers: [
    TEST2_FACTORY,
    BOARD_FACTORY,
    NOTIFICATION_FACTORY,
    SCHEDULER_FACTORY,
    ACCOUNT_FACTORY,
    CustomJwtAuthGuard, // JWT 인증 가드
  ],
})
export class GatewayModule {}
