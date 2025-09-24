import { Controller } from '@nestjs/common';
import { AccountService } from './account.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CustomMessagePatterns } from '@app/proxy/common-proxy-client';
import {
  SignUpRequestDto,
  SignInRequestDto,
} from '@app/global-dto/account/request';
import {
  SignUpResponseDto,
  SignInResponseDto,
} from '@app/global-dto/account/response';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  // 헬스 체크
  @MessagePattern(CustomMessagePatterns.AccountHealthCheck)
  healthCheck(): string {
    return this.accountService.healthCheck();
  }

  // 회원가입
  @MessagePattern(CustomMessagePatterns.CreateAccount)
  async signUp(
    @Payload() signUpDto: SignUpRequestDto,
  ): Promise<SignUpResponseDto> {
    return await this.accountService.signUp(signUpDto);
  }

  // 로그인
  @MessagePattern(CustomMessagePatterns.SignInAccount)
  async signIn(
    @Payload() signInDto: SignInRequestDto,
  ): Promise<SignInResponseDto> {
    return await this.accountService.signIn(signInDto);
  }

  // 토큰 검증 (다른 서비스에서 사용)
  @MessagePattern(CustomMessagePatterns.ValidateToken)
  async validateToken(@Payload() data: { token: string }): Promise<any> {
    return await this.accountService.validateToken(data.token);
  }

  // 사용자 정보 조회 (Gateway에서 토큰 검증 후 호출됨)
  @MessagePattern(CustomMessagePatterns.AccountInfo)
  async getAccountInfo(@Payload() data: { userId: number }): Promise<any> {
    // Gateway에서 이미 JWT 토큰 검증을 마친 사용자 정보로 처리
    // 마이크로서비스는 비즈니스 로직에만 집중
    return {
      message: '인증된 사용자 정보 조회 성공',
      userId: data.userId,
    };
  }
}
