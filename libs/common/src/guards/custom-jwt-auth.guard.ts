import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * 커스텀 JWT 토큰 기반 인증 가드
 * 순수한 JWT 검증만 수행하는 공통 가드
 *
 * 각 앱에서 JwtModule과 함께 사용
 * 프로젝트 요구사항에 맞게 커스터마이징된 가드
 */
@Injectable()
export class CustomJwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(CustomJwtAuthGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      // Authorization 헤더에서 토큰 추출
      const token = this.extractTokenFromHeader(request);

      if (!token) {
        this.logger.warn('토큰이 제공되지 않음');
        throw new UnauthorizedException('인증 토큰이 필요합니다');
      }

      // JWT 토큰 검증 및 사용자 정보 추출
      const payload = await this.jwtService.verifyAsync(token);

      // 기본적인 payload 검증
      if (!payload.userId || !payload.email) {
        throw new UnauthorizedException('토큰에 필수 정보가 없습니다');
      }

      // request 객체에 사용자 정보 저장 (컨트롤러에서 사용 가능)
      request.user = payload;

      this.logger.log(`인증 성공: ${payload.email} (ID: ${payload.userId})`);

      return true;
    } catch (error) {
      this.logger.error(`인증 실패: ${error.message}`);
      throw new UnauthorizedException(
        error.message || '유효하지 않은 토큰입니다',
      );
    }
  }

  /**
   * Authorization 헤더에서 Bearer 토큰 추출
   * @param request HTTP 요청 객체
   * @returns JWT 토큰 (Bearer 제외) 또는 undefined
   */
  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      return undefined;
    }

    return token;
  }
}
