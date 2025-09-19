# 🤖 AI 개발자 완전 가이드

> **Nest.js SP 기반 시스템에서 AI와 효율적으로 협업하는 완전한 가이드**

---

# 📖 목차

1. [AI 협업 기본 원칙](#-ai-협업-기본-원칙)
2. [질문 템플릿 및 워크플로우](#-질문-템플릿-및-워크플로우)
3. [테스트 코드 작성 가이드](#-테스트-코드-작성-가이드)
4. [서비스별 개발 가이드](#-서비스별-개발-가이드)
5. [체크리스트 및 도구](#-체크리스트-및-도구)

---

# 🎯 AI 협업 기본 원칙

## 1. SSOT(Single Source of Truth) 기반 작업

- 모든 질문과 요청에 `ssot` 키워드를 포함하면 AI가 프로젝트 문서를 기반으로 정확한 답변을 제공합니다
- 코드와 문서 간 95% 이상의 일치율을 유지합니다

## 2. 구체적이고 단계별 질문

- 복잡한 작업은 여러 단계로 나누어 질문하세요
- AI가 각 단계를 체계적으로 처리할 수 있도록 합니다

## 3. SP 기반 시스템 특화 개발

### **현재 시스템 아키텍처**

- 📦 **DB 로직**: 저장 프로시저(SP)에 집중 → 비즈니스 로직은 DB에 있음
- 🔗 **앱 로직**: 써드파티 API 연동 위주 → 연동/변환/오케스트레이션이 주 역할
- 🎯 **개발 대상**: **"비즈니스 로직"이 아닌 "연동 안정성"에 집중**

---

# 📝 질문 템플릿 및 워크플로우

## 🔧 개발 작업 요청

```
ssot [서비스명] [구체적인 작업 설명]

예시:
- ssot board "게시글 좋아요 기능 추가해줘"
- ssot gateway "새로운 API 엔드포인트 라우팅 설정해줘"
- ssot database "사용자 테이블에 프로필 이미지 컬럼 추가해줘"
```

## 🔍 문제 해결 요청

```
ssot [서비스명] "현재 문제: [문제 설명], 해결 방법 알려줘"

예시:
- ssot notification "슬랙 알림이 안 보내져, 설정 확인하고 수정해줘"
- ssot docker "컨테이너가 계속 재시작돼, 로그 확인하고 문제 해결해줘"
```

## 📚 코드 리뷰 요청

```
ssot "다음 코드 리뷰해줘: [파일 경로], 개선점 알려줘"

예시:
- ssot "apps/board/src/board.service.ts 코드 리뷰하고 성능 개선점 알려줘"
```

## 🧪 테스트 코드 요청

```
ssot "AI_DEVELOPMENT_GUIDE.md 참고해서 [서비스명] 테스트 코드 작성해줘"

예시:
- ssot "AI_DEVELOPMENT_GUIDE.md 참고해서 PaymentService 테스트 코드 작성해줘"
- ssot "AI_DEVELOPMENT_GUIDE.md 기준으로 통합 테스트 추가해줘"
```

## 🚀 개발 워크플로우

### 1. 작업 시작 전

```bash
# 1. 현재 상태 확인
git status

# 2. AI에게 작업 계획 요청
"ssot [서비스명] [작업 내용] 단계별로 계획 세워줘"
```

### 2. 개발 중 (한 번에 모든 것 처리)

```bash
# ✅ 권장: 기능 구현 + 테스트 + 문서를 한 번에 요청
"ssot board 게시글 좋아요 기능 추가해줘"

# AI가 자동으로 수행하는 작업:
# 1. Entity, Repository, Service, Controller 구현
# 2. AI_DEVELOPMENT_GUIDE.md 기준 테스트 코드 작성 (SP 특화)
# 3. 01_UPDATE_GUIDE.md 예시 따라 SSOT 문서 업데이트
```

### 3. 작업 완료 후 검증

```bash
# 1. 필요시 추가 테스트 요청
"ssot AI_DEVELOPMENT_GUIDE.md 참고해서 추가 엣지 케이스 테스트 작성해줘"

# 2. SSOT 문서 검증 (AI가 자동으로 했지만 확인)
"ssot 01_UPDATE_GUIDE.md 체크리스트 기준으로 문서 업데이트 검증해줘"

# 3. 최종 검토
"ssot 전체 코드 일관성 검토하고 문제점 알려줘"
```

### 📋 AI가 자동으로 수행해야 하는 SSOT 업데이트 체크리스트

**AI는 로직 구현 후 반드시 다음을 확인하고 업데이트:**

- [ ] **00_COMPLETE_GUIDE.md**: 새 API 엔드포인트 추가
- [ ] **services/[서비스명]/[서비스명]-service.md**: API 목록 업데이트
- [ ] **operations/database/schema.md**: 새 테이블/관계 추가
- [ ] **01_UPDATE_GUIDE.md**: 업데이트 예시와 일치하는지 검증

**💡 중요**: AI는 단순히 기능만 구현하는 것이 아니라, **SSOT 문서의 일관성 유지**까지 책임져야 합니다!

---

# 🧪 테스트 코드 작성 가이드

## 📋 시스템 특징 및 테스트 방향성

### **⚠️ 중요: 일반적인 테스트와 다른 점**

```typescript
// ❌ 일반 시스템에서 하는 테스트 (우리는 이렇게 하면 안됨)
describe('UserService', () => {
  it('사용자 생성 시 비즈니스 규칙을 검증해야 합니다', () => {
    // 비즈니스 로직이 SP에 있어서 의미없음
  });
});

// ✅ SP 기반 시스템에서 해야 하는 테스트
describe('UserService', () => {
  it('SP 호출 파라미터가 올바르게 전달되어야 합니다', () => {});
  it('써드파티 API 응답을 내부 형식으로 올바르게 변환해야 합니다', () => {});
  it('SP 오류 시 적절한 예외 처리를 해야 합니다', () => {});
  it('API 타임아웃 시 재시도 로직이 작동해야 합니다', () => {});
});
```

## 🎯 테스트 피라미드 (SP 기반 시스템 특화)

```
        /\
       /  \
      / E2E \ (20%) - 실제 DB + Sandbox API
     /______\
    /        \
   / 통합테스트 \ (50%) - SP Mock + API Mock
  /__________\
 /            \
/ 단위테스트  \ (30%) - 변환/검증 로직만
/______________\
```

**🔑 핵심**: 일반 시스템(단위70%→통합20%→E2E10%)과 다르게 **통합 테스트가 50%**를 차지

## 📚 필수 테스트 템플릿

### **1. 단위 테스트 템플릿 (30%)**

**대상**: 데이터 변환, 검증, 유틸리티 함수만

```typescript
// ✅ 단위 테스트 기본 템플릿
describe('DataTransformService', () => {
  let service: DataTransformService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [DataTransformService],
    }).compile();

    service = module.get<DataTransformService>(DataTransformService);
  });

  describe('transformApiResponse', () => {
    it('써드파티 API 응답을 내부 형식으로 변환해야 합니다', () => {
      // Given
      const apiResponse = {
        external_id: '12345',
        status_code: 'SUCCESS',
        data: { amount: 1000, currency: 'KRW' },
      };

      // When
      const result = service.transformApiResponse(apiResponse);

      // Then
      expect(result).toEqual({
        id: '12345',
        status: 'success',
        amount: 1000,
        currency: 'KRW',
      });
    });

    it('잘못된 API 응답에 대해 기본값을 설정해야 합니다', () => {
      const invalidResponse = { external_id: null };
      const result = service.transformApiResponse(invalidResponse);

      expect(result.id).toBe('UNKNOWN');
      expect(result.status).toBe('failed');
    });
  });

  describe('validatePaymentData', () => {
    it('유효한 결제 데이터를 통과시켜야 합니다', () => {
      const validData = { amount: 1000, currency: 'KRW' };
      expect(() => service.validatePaymentData(validData)).not.toThrow();
    });

    it('유효하지 않은 결제 데이터에 대해 오류를 발생시켜야 합니다', () => {
      const invalidData = { amount: -1000 };

      expect(() => service.validatePaymentData(invalidData)).toThrow(
        '결제 금액은 0보다 커야 합니다',
      );
    });
  });
});
```

### **2. 통합 테스트 템플릿 (50%) ⭐ 가장 중요**

**대상**: SP 호출 + API 연동 전체 플로우

```typescript
// ✅ 통합 테스트 기본 템플릿 (가장 중요!)
describe('PaymentService Integration', () => {
  let service: PaymentService;
  let spMock: jest.SpyInstance;
  let apiMock: jest.SpyInstance;
  let databaseService: DatabaseService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: DatabaseService,
          useValue: {
            callStoredProcedure: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    httpService = module.get<HttpService>(HttpService);

    // Mock 설정
    spMock = jest.spyOn(databaseService, 'callStoredProcedure');
    apiMock = jest.spyOn(httpService, 'post');
  });

  describe('processPayment', () => {
    it('결제 처리 전체 플로우가 성공해야 합니다', async () => {
      // Given - SP 응답 Mock
      spMock.mockResolvedValue({
        payment_id: 'PAY_001',
        amount: 10000,
        status: 'PENDING',
        merchant_id: 'MERCHANT001',
      });

      // Given - API 응답 Mock
      apiMock.mockResolvedValue({
        data: {
          transaction_id: 'TXN123',
          status: 'SUCCESS',
          payment_key: 'KEY123',
        },
      });

      // When
      const result = await service.processPayment({
        amount: 10000,
        merchantId: 'MERCHANT001',
      });

      // Then - SP 호출 검증
      expect(spMock).toHaveBeenCalledWith('sp_create_payment', {
        amount: 10000,
        merchant_id: 'MERCHANT001',
      });

      // Then - API 호출 검증
      expect(apiMock).toHaveBeenCalledWith('/api/payment', {
        payment_id: 'PAY_001',
        amount: 10000,
      });

      // Then - 결과 검증
      expect(result.paymentId).toBe('PAY_001');
      expect(result.transactionId).toBe('TXN123');
    });

    it('SP 오류 시 적절한 예외 처리를 해야 합니다', async () => {
      // Given - SP 오류
      spMock.mockRejectedValue(new Error('SP_CONNECTION_ERROR'));

      // When & Then
      await expect(
        service.processPayment({
          amount: 10000,
          merchantId: 'MERCHANT001',
        }),
      ).rejects.toThrow('결제 정보 생성 중 오류가 발생했습니다');

      // API는 호출되지 않아야 함
      expect(apiMock).not.toHaveBeenCalled();
    });

    it('외부 API 장애 시 SP 상태 업데이트를 해야 합니다', async () => {
      // Given - SP 성공
      spMock.mockResolvedValue({
        payment_id: 'PAY_001',
        amount: 10000,
        status: 'PENDING',
      });

      // Given - API 장애
      apiMock.mockRejectedValue(new Error('API_TIMEOUT'));

      // When & Then
      await expect(
        service.processPayment({
          amount: 10000,
          merchantId: 'MERCHANT001',
        }),
      ).rejects.toThrow('결제 처리 중 오류가 발생했습니다');

      // SP 상태 업데이트 확인
      expect(spMock).toHaveBeenLastCalledWith('sp_update_payment_status', {
        payment_id: 'PAY_001',
        status: 'FAILED',
        error_message: 'API_TIMEOUT',
      });
    });

    it('API 재시도 로직이 작동해야 합니다', async () => {
      // Given
      spMock.mockResolvedValue({ payment_id: 'PAY_001' });

      // API 첫 번째 호출 실패, 두 번째 성공
      apiMock
        .mockRejectedValueOnce(new Error('TEMPORARY_ERROR'))
        .mockResolvedValueOnce({
          data: { transaction_id: 'TXN123', status: 'SUCCESS' },
        });

      // When
      const result = await service.processPayment({
        amount: 10000,
        merchantId: 'MERCHANT001',
      });

      // Then
      expect(apiMock).toHaveBeenCalledTimes(2);
      expect(result.transactionId).toBe('TXN123');
    });
  });
});
```

### **3. E2E 테스트 템플릿 (20%)**

**대상**: 실제 DB + Sandbox API 사용

```typescript
// ✅ E2E 테스트 기본 템플릿
describe('Payment API (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // 실제 환경 설정
    process.env.NODE_ENV = 'test';
    process.env.PAYMENT_API_URL = 'https://sandbox.payment-api.com';
    process.env.DB_HOST = 'localhost';

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /payments', () => {
    it('전체 결제 플로우가 성공해야 합니다', async () => {
      // 실제 SP 호출 + 실제 Sandbox API 호출
      const response = await request(app.getHttpServer())
        .post('/payments')
        .send({
          amount: 1000,
          merchantId: 'TEST_MERCHANT',
          currency: 'KRW',
        })
        .expect(201);

      expect(response.body).toHaveProperty('paymentId');
      expect(response.body).toHaveProperty('transactionId');
      expect(response.body.status).toBe('SUCCESS');
    });

    it('잘못된 요청에 대해 400 오류를 반환해야 합니다', async () => {
      await request(app.getHttpServer())
        .post('/payments')
        .send({
          amount: -1000, // 잘못된 금액
          merchantId: 'TEST_MERCHANT',
        })
        .expect(400);
    });
  });
});
```

## 🛠️ 필수 테스트 유틸리티

### **SP 테스트 유틸리티**

```typescript
// test/utils/sp-test-utils.ts
export class StoredProcedureTestUtils {
  /**
   * SP 호출 결과 Mock 생성
   */
  static mockSpResult(procedureName: string, result: any) {
    return jest
      .spyOn(DatabaseService.prototype, 'callStoredProcedure')
      .mockImplementation((spName: string, params: any) => {
        if (spName === procedureName) {
          return Promise.resolve(result);
        }
        return Promise.reject(new Error(`Unmocked SP: ${spName}`));
      });
  }

  /**
   * SP 파라미터 검증 헬퍼
   */
  static expectSpCalledWith(
    spy: jest.SpyInstance,
    spName: string,
    expectedParams: any,
  ) {
    expect(spy).toHaveBeenCalledWith(spName, expectedParams);
  }
}
```

### **써드파티 API Mock 팩토리**

```typescript
// test/utils/third-party-mock.ts
export class ThirdPartyMockFactory {
  /**
   * 결제 API Mock
   */
  static createPaymentApiMock() {
    return {
      processPayment: jest.fn().mockResolvedValue({
        transaction_id: 'TXN_123456',
        status: 'SUCCESS',
        amount: 10000,
      }),

      refundPayment: jest.fn().mockResolvedValue({
        refund_id: 'REF_123456',
        status: 'COMPLETED',
      }),
    };
  }

  /**
   * SMS API Mock
   */
  static createSmsApiMock() {
    return {
      sendSms: jest.fn().mockResolvedValue({
        message_id: 'SMS_123456',
        status: 'SENT',
      }),
    };
  }
}
```

## 🎯 AI가 따라야 할 테스트 작성 규칙

### **1. 테스트 우선순위**

1. **High Priority**: 결제, 인증, 보안 (돈/데이터 관련)
2. **Medium Priority**: 알림, 로깅, 파일 처리 (사용자 경험)
3. **Low Priority**: 단순 조회, 헬스체크 (비즈니스 크리티컬하지 않음)

### **2. 필수 테스트 케이스 체크리스트**

**모든 서비스는 다음을 테스트해야 함:**

- [ ] **SP 호출 테스트**

  - [ ] 정상 파라미터로 SP 호출
  - [ ] SP 오류 시 예외 처리
  - [ ] SP 응답 데이터 변환

- [ ] **써드파티 API 테스트**

  - [ ] 정상 API 호출
  - [ ] API 타임아웃 처리
  - [ ] API 오류 응답 처리
  - [ ] 재시도 로직 (필요시)

- [ ] **데이터 변환 테스트**

  - [ ] 외부 → 내부 형식 변환
  - [ ] 내부 → 외부 형식 변환
  - [ ] 잘못된 데이터 처리

- [ ] **전체 플로우 테스트**
  - [ ] 성공 케이스 전체 플로우
  - [ ] 각 단계별 실패 시나리오

### **3. AAA 패턴 준수**

```typescript
it('결제 처리가 성공해야 합니다', async () => {
  // Given (준비)
  const paymentData = { amount: 10000, merchantId: 'M001' };
  spMock.mockResolvedValue({ payment_id: 'PAY_001' });
  apiMock.mockResolvedValue({ transaction_id: 'TXN_001' });

  // When (실행)
  const result = await service.processPayment(paymentData);

  // Then (검증)
  expect(spMock).toHaveBeenCalledWith('sp_create_payment', {
    amount: 10000,
    merchant_id: 'M001',
  });
  expect(result.transactionId).toBe('TXN_001');
});
```

## 📊 커버리지 목표

| 영역                        | 목표 커버리지 | 주요 테스트 대상                  |
| --------------------------- | ------------- | --------------------------------- |
| **데이터 변환/검증 로직**   | 90%+          | 입력값 변환, 응답 파싱, 검증 함수 |
| **써드파티 연동 로직**      | 80%+          | API 호출, 에러 처리, 재시도 로직  |
| **SP 호출 래퍼**            | 70%+          | 파라미터 전달, 결과 매핑          |
| **비즈니스 오케스트레이션** | 85%+          | 여러 SP/API 조합 로직             |

## 🚀 AI 테스트 생성 가이드

### **AI가 테스트 코드를 생성할 때 반드시 확인할 것들**

1. **✅ SP 기반 시스템인지 확인**

   - 코드에 `callStoredProcedure` 또는 DB 프로시저 호출이 있는가?
   - 비즈니스 로직이 앱 코드보다 DB에 더 많이 있는가?

2. **✅ 테스트 종류 결정**

   ```typescript
   // 데이터 변환/검증 함수 → 단위 테스트
   if (함수가 순수함수 && 외부 의존성 없음) {
     return '단위 테스트 템플릿 사용';
   }

   // SP + API 조합 로직 → 통합 테스트 (가장 중요!)
   if (SP호출 && API호출) {
     return '통합 테스트 템플릿 사용';
   }

   // 전체 HTTP 플로우 → E2E 테스트
   if (HTTP요청_전체플로우) {
     return 'E2E 테스트 템플릿 사용';
   }
   ```

3. **✅ Mock 전략 적용**

   - SP 호출은 항상 Mock
   - 외부 API 호출도 항상 Mock (단위/통합 테스트에서)
   - E2E에서만 실제 Sandbox API 사용

4. **✅ 필수 테스트 케이스 포함**
   - 성공 케이스
   - SP 오류 케이스
   - API 오류 케이스
   - 데이터 변환 케이스

---

# 🏗️ 서비스별 개발 가이드

## 서비스별 주요 키워드

| 서비스           | 키워드                          | 주요 작업                  |
| ---------------- | ------------------------------- | -------------------------- |
| **Gateway**      | `gateway`, `라우팅`, `프록시`   | API 라우팅, 미들웨어 설정  |
| **Board**        | `board`, `게시글`, `댓글`       | CRUD 작업, 비즈니스 로직   |
| **Notification** | `notification`, `알림`, `slack` | 알림 시스템, 외부 연동     |
| **Account**      | `account`, `사용자`, `인증`     | 사용자 관리, 권한 처리     |
| **File**         | `file`, `파일`, `업로드`        | 파일 관리, 스토리지        |
| **Scheduler**    | `scheduler`, `스케줄`, `배치`   | 정기 작업, 백그라운드 처리 |
| **Database**     | `database`, `entity`, `스키마`  | DB 설계, 마이그레이션      |
| **Docker**       | `docker`, `컨테이너`, `배포`    | 환경 설정, 배포            |

## ✅ 좋은 질문 예시

### 🎯 구체적이고 명확한 질문

```
✅ "ssot board 게시글 목록에 페이지네이션 추가하고, 한 페이지에 20개씩 보이도록 해줘"
✅ "ssot notification 에러 발생 시 슬랙 #error 채널로 자동 알림 보내는 기능 만들어줘"
✅ "ssot database User 엔티티에 이메일 인증 상태 컬럼 추가하고 관련 마이그레이션 생성해줘"
✅ "ssot AI_DEVELOPMENT_GUIDE.md 참고해서 PaymentService 통합 테스트 작성해줘"
```

### ❌ 피해야 할 질문

```
❌ "뭔가 안돼요"  # 너무 모호함
❌ "전체 시스템 다시 만들어줘"  # 범위가 너무 넓음
❌ "board 수정"  # 구체적이지 않음
❌ "테스트 코드 만들어줘" # SP 기반 시스템 특성을 고려하지 않음
```

## 🎨 고급 활용 팁

### 1. 컨텍스트 유지

- 연관된 작업들은 같은 대화에서 계속 진행하세요
- AI가 이전 작업 내용을 기억하고 일관성 있게 작업합니다

### 2. 코드 스타일 유지

```
"ssot 기존 코드 스타일에 맞춰서 구현해줘"
"ssot 프로젝트의 네이밍 컨벤션 따라서 작성해줘"
"ssot AI_DEVELOPMENT_GUIDE.md 테스트 템플릿 사용해서 작성해줘"
```

### 3. 에러 해결

```
"ssot 다음 에러 해결해줘: [에러 메시지]"
"ssot 린트 에러 모두 수정해줘"
```

### 4. 성능 최적화

```
"ssot [서비스명] 성능 최적화 방법 알려주고 구현해줘"
"ssot database 쿼리 성능 개선 방법 제안해줘"
```

---

# 📋 체크리스트 및 도구

## 📋 개발 체크리스트

개발 시 다음 사항들을 AI에게 확인 요청하세요:

- [ ] 코드 스타일 일관성
- [ ] 에러 처리 적절성
- [ ] 보안 취약점 검토
- [ ] 테스트 코드 작성 (SP 기반 시스템 특화)
- [ ] 문서 업데이트
- [ ] 타입 안전성 확보
- [ ] 성능 고려사항
- [ ] SP 호출 파라미터 검증
- [ ] 써드파티 API 연동 안정성

## 🔧 자주 사용하는 명령어

```bash
# 개발 환경 실행
pnpm run start:dev:[서비스명]

# 테스트 실행
pnpm test apps/[서비스명]
pnpm run test:unit
pnpm run test:integration
pnpm run test:e2e

# 린트 검사
pnpm run lint

# 빌드
pnpm run build:all

# Docker 환경
./docker.sh dev
```

## 🎉 핵심 메시지 (AI가 반드시 기억해야 할 것)

### **SP 기반 시스템의 4가지 핵심 질문**

1. ✅ **SP 호출이 올바른 파라미터로 되는가?**
2. ✅ **외부 API 장애 시 적절히 처리하는가?**
3. ✅ **데이터 변환이 정확히 되는가?**
4. ✅ **전체 플로우가 끊어지지 않는가?**

### **AI 테스트 생성 최종 체크리스트**

- [ ] **테스트 종류가 올바른가?** (단위30% / 통합50% / E2E20%)
- [ ] **SP/API Mock이 제대로 설정되었는가?**
- [ ] **성공/실패 케이스가 모두 포함되었는가?**
- [ ] **AAA 패턴을 따르고 있는가?**
- [ ] **테스트 이름이 명확한가?**
- [ ] **어떤 플로우를 테스트하는지 명확한가?**

---

**💡 AI를 위한 핵심 메시지**:

1. **`ssot` 키워드 필수**: AI가 프로젝트 상황을 정확히 파악하고 더 정확한 도움을 제공할 수 있습니다!

2. **SP 기반 시스템 특화**: "비즈니스 로직 테스트"가 아니라 **"연동 안정성 테스트"**에 집중하세요!

3. **통합 테스트(50%) 우선**: 가장 중요한 테스트 유형입니다.

4. **완전한 워크플로우**:

   ```bash
   "ssot board 게시글 좋아요 기능 추가해줘"
   ```

   → AI가 자동으로 **구현 + 테스트 + SSOT 문서 업데이트** 모두 처리

5. **SSOT 문서 업데이트 필수**:
   - **01_UPDATE_GUIDE.md** 예시 따라 문서 갱신
   - **00_COMPLETE_GUIDE.md** API 엔드포인트 추가
   - **schema.md** 테이블 관계 업데이트

**🎯 AI는 단순 구현이 아닌 "프로젝트 전체 일관성 유지"까지 책임집니다!**
