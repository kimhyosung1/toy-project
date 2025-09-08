// @Expose() 데코레이터 시뮬레이션

console.log("=== @Expose() 데코레이터의 역할 ===\n");

// 시나리오: DB에서 가져온 원본 데이터 (민감한 정보 포함)
const dbData = {
  boardId: 1,
  title: "게시글 제목",
  content: "게시글 내용", 
  author: "작성자",
  password: "hashed_password_123", // 👈 민감한 정보!
  adminNotes: "관리자 메모",      // 👈 내부 정보!
  createdAt: "2024-01-01",
  totalCount: 10
};

console.log("1. DB에서 가져온 원본 데이터:");
console.log(JSON.stringify(dbData, null, 2));

// excludeExtraneousValues: false인 경우 (기본값)
console.log("\n2. excludeExtraneousValues: false (모든 필드 포함):");
const resultWithoutExclude = { ...dbData };
console.log(JSON.stringify(resultWithoutExclude, null, 2));
console.log("❌ 문제: password, adminNotes도 클라이언트에 전송됨!");

// excludeExtraneousValues: true + @Expose()인 경우
console.log("\n3. excludeExtraneousValues: true + @Expose() (안전한 방식):");
const exposedFields = ["boardId", "title", "content", "author", "createdAt", "totalCount"];
const resultWithExpose = {};
exposedFields.forEach(field => {
  if (dbData[field] !== undefined) {
    resultWithExpose[field] = dbData[field];
  }
});
console.log(JSON.stringify(resultWithExpose, null, 2));
console.log("✅ 안전: @Expose()로 명시된 필드만 포함됨!");

