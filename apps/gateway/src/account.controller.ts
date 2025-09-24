import {
  Controller,
  Get,
  Post,
  Inject,
  Req,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  CommonProxyClient,
  ProxyClientProvideService,
  CustomMessagePatterns,
} from 'libs/proxy/src/common-proxy-client';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import {
  SignUpRequestDto,
  SignInRequestDto,
} from '@app/global-dto/account/request';
import {
  SignUpResponseDto,
  SignInResponseDto,
} from '@app/global-dto/account/response';
import { CustomJwtAuthGuard } from '@app/common';

@Controller('account')
@ApiTags('Account')
export class AccountController extends CommonProxyClient {
  constructor(
    @Inject(ProxyClientProvideService.ACCOUNT_SERVICE)
    protected AccountClient: ClientProxy,
  ) {
    super();
  }

  @Get('health-check')
  @ApiOperation({ summary: 'Account Service Health Check API' })
  @ApiOkResponse({ type: String })
  public accountHealthCheck(@Req() req: Request) {
    return this.requestRedirect(
      CustomMessagePatterns.AccountHealthCheck,
      this.AccountClient,
      req,
    );
  }

  @Post('signup')
  @ApiOperation({ summary: '회원가입 API' })
  @ApiBody({ type: SignUpRequestDto })
  @ApiOkResponse({
    type: SignUpResponseDto,
    description: '회원가입 성공',
  })
  @ApiUnauthorizedResponse({ description: '이미 존재하는 이메일' })
  public signUp(@Req() req: Request) {
    return this.requestRedirect(
      CustomMessagePatterns.CreateAccount,
      this.AccountClient,
      req,
    );
  }

  @Post('signin')
  @ApiOperation({ summary: '로그인 API' })
  @ApiBody({ type: SignInRequestDto })
  @ApiOkResponse({
    type: SignInResponseDto,
    description: '로그인 성공',
  })
  @ApiUnauthorizedResponse({ description: '이메일 또는 비밀번호 불일치' })
  public signIn(@Req() req: Request) {
    return this.requestRedirect(
      CustomMessagePatterns.SignInAccount,
      this.AccountClient,
      req,
    );
  }

  @Get('profile')
  @UseGuards(CustomJwtAuthGuard) // 🔐 JWT 토큰 검증
  @ApiOperation({ summary: '사용자 정보 조회 API (인증 필요)' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: '사용자 정보 조회 성공' })
  @ApiUnauthorizedResponse({ description: '인증 토큰 없음 또는 유효하지 않음' })
  public getProfile(@Req() req: Request) {
    // CustomJwtAuthGuard에서 검증된 사용자 정보를 마이크로서비스로 전달
    const userData = req.user as any; // JWT payload에서 추출된 사용자 정보

    return this.requestRedirect(
      CustomMessagePatterns.AccountInfo,
      this.AccountClient,
      { ...req.params, ...req.query, ...req.body, userId: userData.userId },
    );
  }

  @Post('validate-token')
  @ApiOperation({ summary: 'JWT 토큰 검증 API (내부 서비스용)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'JWT 토큰',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiOkResponse({ description: '토큰 검증 성공' })
  @ApiUnauthorizedResponse({ description: '유효하지 않은 토큰' })
  public validateToken(@Req() req: Request) {
    return this.requestRedirect(
      CustomMessagePatterns.ValidateToken,
      this.AccountClient,
      req,
    );
  }
}
