# 🎯 Account Service - 계정 관리

## 📊 서비스 정보

| 속성     | 값                                     |
| -------- | -------------------------------------- |
| **포트** | 3005                                   |
| **역할** | JWT 인증, 회원가입/로그인, 사용자 관리 |
| **위치** | `apps/account/`                        |

## 🎯 핵심 기능

- **JWT 인증**: Access Token 기반 인증 시스템
- **회원가입**: 이메일/비밀번호 기반 사용자 등록
- **로그인**: JWT 토큰 발급 및 인증
- **토큰 검증**: CustomJwtAuthGuard를 통한 API 보안
- **비밀번호 보안**: bcrypt 해싱 적용
- **사용자 역할 관리**: user/admin 역할 지원

## 🌐 API 엔드포인트

```bash
# 시스템
AccountHealthCheck                  # 헬스체크

# 인증 관리
CreateAccount                       # 회원가입
SignInAccount                       # 로그인 (JWT 토큰 발급)
ValidateToken                       # JWT 토큰 검증 (내부 서비스용)
AccountInfo                         # 사용자 정보 조회 (인증 필요)
```

## 📊 데이터 모델

### 사용자 Entity (TbUserEntity)

- **테이블**: `tb_user`
- **주요 필드**: userId, name, email, password, role, isActive
- **인덱스**: idx_email (이메일 검색용)
- **관계**: comments (1:N with TbCommentEntity)
- **특징**: bcrypt 해싱, unique email, user/admin 역할

## 🔐 보안 기능

- **JWT 토큰**: 1시간 만료, Bearer 방식
- **비밀번호 해싱**: bcrypt 솔트라운드 10
- **CustomJwtAuthGuard**: Authorization 헤더 검증 (libs/common 공통 가드)
- **이메일 유니크**: 중복 가입 방지
- **계정 상태 관리**: isActive 플래그
- **환경 변수 설정**: JWT_SECRET, JWT_EXPIRES_IN
- **트랜잭션 관리**: 회원가입 시 데이터 일관성 보장

## 🔧 JWT 설정

```typescript
// env/dev.env
JWT_SECRET=dev-jwt-secret-key-2024-toy-project
JWT_EXPIRES_IN=1h

// account.module.ts
@Module({
  imports: [
    CustomConfigModule,
    DatabaseModule,
    RedisModule,
    ResponseOnlyInterceptorModule, // 🔄 응답 데이터 검증/변환만 수행
    UtilityModule,
    JwtModule.registerAsync({
      imports: [CustomConfigModule],
      inject: [CustomConfigService],
      useFactory: (configService: CustomConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: { expiresIn: configService.jwtExpiresIn },
      }),
    }),
  ],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
```

## 📋 Request/Response DTOs

### 회원가입 요청

```typescript
export class SignUpRequestDto {
  @Type(() => String) name: string; // 사용자 이름
  @Type(() => String) email: string; // 이메일 (유니크)
  @Type(() => String) password: string; // 비밀번호 (8자 이상)
}
```

### 로그인 응답 (표준 형태)

```typescript
// 마이크로서비스에서 반환하는 원본 데이터
export class SignInResponseDto {
  @Expose() @Type(() => SignUpResponseDto) user: SignUpResponseDto;
  @Expose() @Type(() => AuthTokenResponseDto) token: AuthTokenResponseDto;
}

// Gateway에서 클라이언트에게 전달하는 최종 응답
{
  "success": true,
  "data": {
    "user": {
      "userId": 1,
      "name": "김효성",
      "email": "stop70899@naver.com",
      "role": "user",
      "createdAt": "2025-09-25T00:21:44.145Z"
    },
    "token": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "tokenType": "Bearer",
      "expiresIn": 3600
    }
  }
}
```

### 토큰 응답

```typescript
export class AuthTokenResponseDto {
  @Expose() @Type(() => String) accessToken: string; // JWT 토큰
  @Expose() @Type(() => String) tokenType: string; // Bearer
  @Expose() @Type(() => Number) expiresIn: number; // 3600 (1시간)
}
```

## 🔧 개발 명령어

```bash
# 개발 실행
pnpm run start:dev:account

# 테스트
pnpm test apps/account

# Gateway를 통한 헬스체크
curl http://localhost:3000/account/health-check

# JWT 토큰 테스트
curl -X POST http://localhost:3000/account/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"홍길동","email":"test@example.com","password":"password123!"}'

curl -X POST http://localhost:3000/account/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123!"}'

# 인증 필요한 API 테스트
curl -X GET http://localhost:3000/account/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🏗️ 아키텍처 설계

### **Gateway-First 인증 패턴**

```
1. 클라이언트 → Gateway (JWT 토큰 포함 요청)
2. Gateway → CustomJwtAuthGuard (토큰 검증)
3. Gateway → Account 마이크로서비스 (검증된 사용자 정보 전달)
4. Account → Gateway → 클라이언트 (응답)
```

### **토큰 검증 위치**

- **Gateway**: `@UseGuards(CustomJwtAuthGuard)` - 외부 요청 인증
- **Account 마이크로서비스**: Guard 없음 - 순수 비즈니스 로직만

---

> 📝 **핵심 특징**: JWT 기반 인증 시스템, 마이크로서비스 간 TCP 통신, Gateway-First 보안 패턴
