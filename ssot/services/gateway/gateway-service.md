# 🎯 Gateway Service - API 게이트웨이

## 📊 서비스 정보

| 속성     | 값                                 |
| -------- | ---------------------------------- |
| **포트** | 3000                               |
| **역할** | 외부 요청 라우팅, 서비스 간 프록시 |
| **위치** | `apps/gateway/`                    |

## 🎯 핵심 기능

- **API 라우팅**: 외부 요청을 적절한 마이크로서비스로 전달
- **프록시 기능**: TCP 기반 내부 서비스 통신 중계
- **표준 응답 변환**: 모든 응답을 `{success: boolean, data: any}` 형태로 통일
- **JWT 인증**: CustomJwtAuthGuard를 통한 토큰 검증
- **헬스체크**: 모든 서비스의 상태 모니터링
- **Swagger**: API 문서화 및 테스트 인터페이스

## 🌐 API 엔드포인트

```bash
# Gateway 자체
GET /health-check                   # Gateway 헬스체크

# 서비스 헬스체크 (프록시)
GET /board/health-check             # Board Service 헬스체크
GET /notification/health-check      # Notification Service 헬스체크
GET /scheduler/health-check         # Scheduler Service 헬스체크
GET /account/health-check           # Account Service 헬스체크

# 계정 관리 (Account Service 프록시)
GET /account/health-check           # Account Service 상태 확인
POST /account/signup                # 회원가입 (이메일/비밀번호)
POST /account/signin                # 로그인 (JWT 토큰 발급)
GET /account/profile                # 사용자 정보 조회 (Bearer 토큰 필요)
POST /account/validate-token        # JWT 토큰 검증 (내부 서비스용)
```

## 📊 데이터 모델

```typescript
// Gateway는 데이터를 직접 저장하지 않고 프록시 역할만 수행
// 모든 데이터 요청을 해당 마이크로서비스로 전달

// Gateway 모듈 구성 (2025.09.25 업데이트)
@Module({
  imports: [
    CustomConfigModule,
    UtilityModule,
    StandardOnlyInterceptorModule, // 🎯 표준 응답 형태 변환
    JwtModule.registerAsync({
      imports: [CustomConfigModule],
      inject: [CustomConfigService],
      useFactory: (configService: CustomConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: { expiresIn: configService.jwtExpiresIn },
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
    CustomJwtAuthGuard,
  ],
})
export class GatewayModule {}
```

## 🔄 응답 변환 프로세스

```
1. 클라이언트 요청 → Gateway
2. Gateway → 마이크로서비스 (TCP 통신)
3. 마이크로서비스 → Gateway (원본 데이터)
4. StandardResponseInterceptor → 표준 형태 변환
5. Gateway → 클라이언트 ({success: boolean, data: any})
```

## 🔧 개발 명령어

```bash
# 개발 실행
pnpm run start:dev:gateway

# 테스트
pnpm test apps/gateway

# 헬스체크 (직접)
curl http://localhost:3000/health-check

# Swagger 문서
curl http://localhost:3000/api
```

---

> 📝 **핵심 특징**: CommonProxyClient 기반 TCP 통신, Swagger API 문서화, 중앙집중식 라우팅
