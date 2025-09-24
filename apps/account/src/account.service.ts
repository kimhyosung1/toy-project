import {
  Injectable,
  Logger,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '@app/database';
import { TbUserEntity } from '@app/database';
import {
  SignUpRequestDto,
  SignInRequestDto,
} from '@app/global-dto/account/request';
import {
  SignUpResponseDto,
  SignInResponseDto,
  AuthTokenResponseDto,
} from '@app/global-dto/account/response';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  healthCheck(): string {
    return 'Account service is alive!!';
  }

  /**
   * 회원가입
   * @param signUpDto 회원가입 정보
   * @returns 생성된 사용자 정보
   */
  async signUp(signUpDto: SignUpRequestDto): Promise<SignUpResponseDto> {
    return await this.databaseService.runTransaction(async (manager) => {
      // 이메일 중복 체크
      const existingUser = await manager.findOne(TbUserEntity, {
        where: { email: signUpDto.email },
      });

      if (existingUser) {
        throw new ConflictException('이미 존재하는 이메일입니다');
      }

      // 비밀번호 해싱
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(signUpDto.password, saltRounds);

      // 사용자 생성
      const user = manager.create(TbUserEntity, {
        name: signUpDto.name,
        email: signUpDto.email,
        password: hashedPassword,
        role: 'user',
        isActive: true,
      });

      const savedUser = await manager.save(user);

      this.logger.log(
        `새 사용자 생성: ${savedUser.email} (ID: ${savedUser.userId})`,
      );

      return {
        userId: savedUser.userId,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        createdAt: savedUser.createdAt,
      };
    });
  }

  /**
   * 로그인
   * @param signInDto 로그인 정보
   * @returns 사용자 정보와 JWT 토큰
   */
  async signIn(signInDto: SignInRequestDto): Promise<SignInResponseDto> {
    return await this.databaseService.runTransaction(async (manager) => {
      // 사용자 조회
      const user = await manager.findOne(TbUserEntity, {
        where: { email: signInDto.email },
      });

      if (!user) {
        throw new UnauthorizedException(
          '이메일 또는 비밀번호가 올바르지 않습니다',
        );
      }

      // 계정 활성화 상태 확인
      if (!user.isActive) {
        throw new UnauthorizedException('비활성화된 계정입니다');
      }

      // 비밀번호 검증
      const isPasswordValid = await bcrypt.compare(
        signInDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException(
          '이메일 또는 비밀번호가 올바르지 않습니다',
        );
      }

      // JWT 토큰 생성
      const token = await this.generateToken(user);

      this.logger.log(`사용자 로그인: ${user.email} (ID: ${user.userId})`);

      return {
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      };
    });
  }

  /**
   * JWT 토큰 생성
   * @param user 사용자 엔티티
   * @returns JWT 토큰 정보
   */
  private async generateToken(
    user: TbUserEntity,
  ): Promise<AuthTokenResponseDto> {
    const payload = {
      sub: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const expiresIn = 3600; // 1시간
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
    };
  }

  /**
   * JWT 토큰 검증 및 사용자 정보 추출
   * @param token JWT 토큰 (Bearer 제외)
   * @returns 사용자 정보
   */
  async validateToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token);

      // 사용자 존재 여부 및 활성화 상태 확인
      const user = await this.databaseService.runTransaction(
        async (manager) => {
          return await manager.findOne(TbUserEntity, {
            where: { userId: payload.sub, isActive: true },
          });
        },
      );

      if (!user) {
        throw new UnauthorizedException(
          '사용자를 찾을 수 없거나 비활성화된 계정입니다',
        );
      }

      return {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    } catch (error) {
      this.logger.error(`JWT 토큰 검증 실패: ${error.message}`);
      throw new UnauthorizedException('유효하지 않은 토큰입니다');
    }
  }
}
