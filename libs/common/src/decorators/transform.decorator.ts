import { applyDecorators } from '@nestjs/common';
import { Transform, TransformFnParams } from 'class-transformer';

/**
 * 🔢 안전한 숫자 변환 데코레이터
 *
 * 처리 가능:
 * - "123" → 123
 * - "45.67" → 45.67
 * - "-10" → -10
 * - 123 → 123 (이미 숫자면 그대로)
 * - null/undefined → null/undefined (그대로)
 * - "abc" → "abc" (변환 실패 시 원본, 이후 @IsNumber()에서 검증 실패)
 */
export function NumberTransform() {
  return applyDecorators(
    Transform((params: TransformFnParams) => {
      try {
        const { value } = params;

        // null, undefined는 그대로 반환 (선택적 필드 지원)
        if (value === null || value === undefined) {
          return value;
        }

        // 이미 숫자면 그대로 반환
        if (typeof value === 'number') {
          return isNaN(value) ? value : value; // NaN도 그대로 (검증에서 걸림)
        }

        // 문자열인 경우 숫자로 변환 시도
        if (typeof value === 'string') {
          const trimmed = value.trim();

          // 빈 문자열은 그대로 반환
          if (trimmed === '') {
            return value;
          }

          // 숫자 변환 시도
          const num = Number(trimmed);

          // 변환 성공하면 숫자 반환, 실패하면 원본 반환
          return isNaN(num) ? value : num;
        }

        // 기타 타입은 그대로 반환 (검증에서 걸림)
        return value;
      } catch (error) {
        console.error('NumberTransform error:', error);
        // 에러 발생 시 원본 반환 (검증에서 걸림)
        return params.value;
      }
    }),
  );
}

/**
 * 📝 안전한 문자열 변환 데코레이터
 *
 * 처리 가능:
 * - "  hello  " → "hello"
 * - "world" → "world"
 * - 123 → "123" (숫자를 문자열로 변환)
 * - null/undefined → null/undefined (그대로)
 * - true → "true" (불린을 문자열로 변환)
 */
export function StringTransform() {
  return applyDecorators(
    Transform((params: TransformFnParams) => {
      try {
        const { value } = params;

        // null, undefined는 그대로 반환 (선택적 필드 지원)
        if (value === null || value === undefined) {
          return value;
        }

        // 이미 문자열이면 trim 후 반환
        if (typeof value === 'string') {
          return value.trim();
        }

        // 숫자, 불린 등은 문자열로 변환 후 trim
        if (typeof value === 'number' || typeof value === 'boolean') {
          return String(value).trim();
        }

        // 객체나 배열 등은 JSON 문자열로 변환 후 trim
        if (typeof value === 'object') {
          try {
            return JSON.stringify(value).trim();
          } catch {
            return String(value).trim();
          }
        }

        // 기타 타입은 String()으로 강제 변환
        return String(value).trim();
      } catch (error) {
        console.error('StringTransform error:', error);
        // 에러 발생 시 안전한 문자열 변환
        try {
          return String(params.value).trim();
        } catch {
          return params.value;
        }
      }
    }),
  );
}
