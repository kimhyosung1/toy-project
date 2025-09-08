# UserFlow - 익명 게시판 및 키워드 알림 시스템

## 🔄 전체 사용자 플로우

### 1. 게시글 관련 플로우

#### 1.1 게시글 작성 플로우
```
사용자 → Gateway → Board Service → Database
    ↓
키워드 매칭 체크 → Notification Service → Redis Queue
```

**단계별 플로우:**
1. 사용자가 게시글 작성 요청 (제목, 내용, 작성자명, 비밀번호)
2. Gateway Service에서 요청 수신
3. Board Service로 요청 전달
4. 입력 데이터 유효성 검증 (class-validator)
5. 비밀번호 해시 처리 (bcrypt)
6. 데이터베이스에 게시글 저장 (트랜잭션)
7. 키워드 매칭 체크 실행
8. 매칭된 키워드가 있으면 Notification Service로 이벤트 전송
9. Redis Queue에 알림 작업 추가
10. 성공 응답 반환

#### 1.2 게시글 목록 조회 플로우
```
사용자 → Gateway → Board Service → Database → 응답
```

**단계별 플로우:**
1. 사용자가 게시글 목록 요청 (페이지, 검색 조건)
2. Gateway Service에서 요청 수신
3. Board Service로 요청 전달
4. 검색 조건에 따라 데이터베이스 쿼리 실행
5. 페이징 처리된 결과 반환
6. DTO 변환 및 유효성 검증
7. 게시글 목록 응답

#### 1.3 게시글 수정 플로우
```
사용자 → Gateway → Board Service → 비밀번호 검증 → Database → 응답
```

**단계별 플로우:**
1. 사용자가 게시글 수정 요청 (게시글 ID, 수정 내용, 비밀번호)
2. Gateway Service에서 요청 수신
3. Board Service로 요청 전달
4. 기존 게시글 조회
5. 입력된 비밀번호와 저장된 해시 비교 (bcrypt.compare)
6. 비밀번호 일치 시 게시글 수정 (트랜잭션)
7. 비밀번호 불일치 시 에러 응답
8. 성공 응답 반환

#### 1.4 게시글 삭제 플로우
```
사용자 → Gateway → Board Service → 비밀번호 검증 → Database → 응답
```

**단계별 플로우:**
1. 사용자가 게시글 삭제 요청 (게시글 ID, 비밀번호)
2. Gateway Service에서 요청 수신
3. Board Service로 요청 전달
4. 기존 게시글 조회
5. 입력된 비밀번호와 저장된 해시 비교
6. 비밀번호 일치 시 게시글 삭제 (트랜잭션, CASCADE로 댓글도 삭제)
7. 비밀번호 불일치 시 에러 응답
8. 성공 응답 반환

### 2. 댓글 관련 플로우

#### 2.1 댓글 작성 플로우
```
사용자 → Gateway → Board Service → Database
    ↓
키워드 매칭 체크 → Notification Service → Redis Queue
```

**단계별 플로우:**
1. 사용자가 댓글 작성 요청 (게시글 ID, 내용, 작성자명, 부모댓글 ID)
2. Gateway Service에서 요청 수신
3. Board Service로 요청 전달
4. 입력 데이터 유효성 검증
5. 게시글 존재 여부 확인
6. 댓글 데이터베이스에 저장 (트랜잭션)
7. 게시글 정보 조회 (키워드 매칭용)
8. 키워드 매칭 체크 실행
9. 매칭된 키워드가 있으면 Notification Service로 이벤트 전송
10. Redis Queue에 알림 작업 추가
11. 성공 응답 반환

#### 2.2 댓글 목록 조회 플로우
```
사용자 → Gateway → Board Service → Database → 응답
```

**단계별 플로우:**
1. 사용자가 댓글 목록 요청 (게시글 ID, 페이지 정보)
2. Gateway Service에서 요청 수신
3. Board Service로 요청 전달
4. 게시글별 댓글 조회 (페이징 처리)
5. 계층형 구조로 댓글 정렬
6. DTO 변환 및 유효성 검증
7. 댓글 목록 응답

### 3. 키워드 알림 플로우

#### 3.1 키워드 매칭 및 알림 생성 플로우
```
게시글/댓글 작성 → 키워드 검사 → 매칭 결과 → 알림 큐 → 알림 처리
```

**단계별 플로우:**
1. 게시글 또는 댓글 작성 완료
2. Board Service에서 키워드 매칭 체크 실행
3. 제목과 내용에서 등록된 키워드 검색
4. 매칭된 키워드가 있으면 Notification Service로 이벤트 전송
5. Notification Service에서 키워드 매치 이벤트 수신
6. 매칭된 키워드별로 개별 알림 작업 생성
7. Redis Queue에 알림 작업 추가
8. Queue Processor에서 알림 작업 처리
9. 실제 알림 전송 (현재는 로그만 출력)

### 4. 서비스 간 통신 플로우

#### 4.1 MSA 통신 패턴
```
Gateway Service (HTTP) ↔ Board Service (TCP)
                      ↕
                 Notification Service (TCP)
                      ↕
                  Redis Queue
```

**통신 방식:**
- **HTTP**: 사용자 ↔ Gateway Service
- **TCP**: Gateway ↔ 각 마이크로서비스
- **Event**: Board Service → Notification Service (키워드 매칭)
- **Queue**: Notification Service ↔ Redis

### 5. 에러 처리 플로우

#### 5.1 일반적인 에러 처리
```
에러 발생 → 서비스별 에러 핸들링 → 로그 기록 → 사용자 응답
```

**에러 유형별 처리:**
1. **유효성 검증 에러**: class-validator에서 400 에러 반환
2. **비밀번호 불일치**: 401 에러 반환
3. **데이터 없음**: 404 에러 반환
4. **서버 에러**: 500 에러 반환 및 로그 기록
5. **키워드 알림 에러**: 로그만 기록 (크리티컬하지 않음)

### 6. 데이터 흐름도

#### 6.1 게시글 생성 시 데이터 흐름
```
[사용자 입력] → [Gateway] → [Board Service]
                                ↓
[비밀번호 해시] → [DB 저장] → [키워드 체크]
                                ↓
[Notification Service] → [Redis Queue] → [알림 처리]
```

#### 6.2 조회 시 데이터 흐름
```
[사용자 요청] → [Gateway] → [Board Service]
                                ↓
[DB 조회] → [DTO 변환] → [유효성 검증] → [응답]
```

### 7. 트랜잭션 관리 플로우

#### 7.1 게시글 작성 트랜잭션
```
BEGIN TRANSACTION
  ↓
게시글 저장
  ↓
키워드 체크 (별도 트랜잭션)
  ↓
COMMIT/ROLLBACK
```

#### 7.2 댓글 작성 트랜잭션
```
BEGIN TRANSACTION
  ↓
댓글 저장
  ↓
게시글 정보 조회
  ↓
키워드 체크 (별도 트랜잭션)
  ↓
COMMIT/ROLLBACK
```

### 8. 성능 최적화 플로우

#### 8.1 페이징 처리
```
[페이지 요청] → [OFFSET/LIMIT 계산] → [인덱스 활용 조회] → [결과 반환]
```

#### 8.2 키워드 매칭 최적화
```
[텍스트 입력] → [DB 레벨 키워드 매칭] → [매칭된 키워드만 반환] → [알림 생성]
```

### 9. 헬스체크 플로우

#### 9.1 서비스별 헬스체크
```
Gateway → "gateway api response test"
Gateway → Test2 Service → "i am alive!!"
Gateway → Board Service → "i am alive!!"
Gateway → Notification Service → "i am alive!!"
```
