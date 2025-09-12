# SWC 빌드 가이드

## 성능 비교 결과

### 기존 TypeScript 컴파일러

- 빌드 시간: **3.306초** (2110ms webpack)
- CPU 사용률: 150%

### SWC 컴파일러

- 빌드 시간: **2.874초** (1671ms webpack)
- CPU 사용률: 166%
- **성능 향상: 약 13% 빠름**

## 사용 방법

### 개발 서버 실행 (SWC 자동 적용)

```bash
# 모든 개발 스크립트가 자동으로 SWC 사용
pnpm run start:dev:board        # Board 앱 개발 서버 (SWC)
pnpm run start:dev:gateway      # Gateway 앱 개발 서버 (SWC)
pnpm run start:dev:notification # Notification 앱 개발 서버 (SWC)
pnpm run start:dev:debug:test2  # Test2 앱 개발 서버 (SWC)
pnpm run start:dev              # 기본 개발 서버 (SWC)
```

### 개별 앱 빌드

```bash
# SWC 사용
pnpm run build:swc gateway
pnpm run build:swc board
pnpm run build:swc notification
pnpm run build:swc test2

# 기존 방식
pnpm run build gateway
pnpm run build board
```

### 전체 앱 빌드

```bash
# SWC로 모든 앱 빌드
pnpm run build:all:swc

# 기존 방식으로 모든 앱 빌드
pnpm run build:all
```

## 주요 설정

### .swcrc 설정

- TypeScript 데코레이터 지원
- Path mapping 설정 (모노레포 지원)
- ES2021 타겟
- CommonJS 모듈 시스템
- 소스맵 생성

### nest-cli.json 설정

- 모든 애플리케이션에 SWC 빌더 설정
- 기존 webpack 설정 유지

## 권장사항

1. **개발 환경**: 모든 `start:dev:*` 명령어가 자동으로 SWC 사용 (빠른 핫 리로드)
2. **프로덕션 빌드**: `build:all:swc` 사용으로 빌드 시간 단축
3. **CI/CD**: SWC 빌드로 배포 파이프라인 속도 향상

## 개발 서버 성능 향상

### Board 앱 개발 서버 예시

- **기존**: `pnpm run start:dev:board` (TypeScript 컴파일러)
- **현재**: `pnpm run start:dev:board` (SWC 자동 적용)
- **빌드 시간**: 483ms (매우 빠름!)
- **핫 리로드**: 더욱 빠른 코드 변경 감지

## 주의사항

- 첫 빌드 시 SWC 캐시 생성으로 약간 느릴 수 있음
- 복잡한 타입 변환이 필요한 경우 기존 방식 사용 고려
- 데코레이터 메타데이터가 중요한 NestJS 기능은 정상 작동 확인됨
