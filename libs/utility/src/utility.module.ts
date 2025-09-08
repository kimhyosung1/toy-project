import { Module, Global } from '@nestjs/common';
import { UtilityService } from './services/utility.service';

/**
 * 🛠️ 유틸리티 모듈
 *
 * 전역적으로 사용되는 공통 유틸리티 기능들을 제공합니다.
 * @Global 데코레이터를 사용하여 전역 모듈로 설정되어 있어
 * 다른 모듈에서 imports 없이 바로 사용할 수 있습니다.
 */
@Global()
@Module({
  providers: [UtilityService],
  exports: [UtilityService],
})
export class UtilityModule {}
