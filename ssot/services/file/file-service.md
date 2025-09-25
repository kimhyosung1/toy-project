# 🎯 File Service - 파일 관리

## 📊 서비스 정보

| 속성     | 값                                     |
| -------- | -------------------------------------- |
| **포트** | 3003                                   |
| **역할** | 기본 서비스 구조 (향후 파일 관리 예정) |
| **위치** | `apps/file/`                           |

## 🎯 핵심 기능

- **헬스체크**: 서비스 상태 확인
- **기본 구조**: DatabaseService 연결 준비
- **향후 확장**: 파일 관리 기능 추가 예정
- **표준 응답**: Gateway에서 `{success: boolean, data: any}` 형태로 변환

## 🔧 모듈 구성 (2025.09.25 업데이트)

```typescript
@Module({
  imports: [
    CustomConfigModule,
    DatabaseModule,
    RedisModule,
    ResponseOnlyInterceptorModule, // 🔄 응답 데이터 검증/변환만 수행
    UtilityModule,
  ],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
```

## 🌐 API 엔드포인트

```bash
# 시스템
FileHealthCheck                     # 헬스체크
```

## 📊 데이터 모델

### 기본 구조

- **FileService**: DatabaseService 연결, 헬스체크 구현
- **FileController**: TCP 메시지 패턴 기반 컨트롤러
- **MessagePattern**: `CustomMessagePatterns.FileHealthCheck` 사용
- **향후 확장**: 파일 업로드/다운로드 기능 추가 예정

## 🔧 개발 명령어

```bash
# 개발 실행
pnpm run start:dev:file

# 테스트
pnpm test apps/file

# 헬스체크 (직접)
# 현재 Gateway에 file 헬스체크 라우팅 없음
```

---

> 📝 **핵심 특징**: 기본 헬스체크 구현, DatabaseService 연결 준비
