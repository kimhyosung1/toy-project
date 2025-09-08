import { Injectable, Logger } from '@nestjs/common';

/**
 * 🛠️ 유틸리티 서비스
 *
 * 공통적으로 사용되는 유틸리티 기능들을 제공합니다.
 * - 데이터 변환
 * - 문자열 처리
 * - 날짜/시간 처리
 * - 검증 기능
 * - 암호화/해시 기능
 */
@Injectable()
export class UtilityService {
  private readonly logger = new Logger(UtilityService.name);

  /**
   * 🔄 데이터 변환 관련 메서드들
   */

  /**
   * 객체를 안전하게 JSON 문자열로 변환
   * 순환 참조, 함수, undefined 등을 안전하게 처리
   */
  toJsonString(obj: any, indent?: number): string {
    if (obj === null || obj === undefined) {
      return 'null';
    }

    if (typeof obj === 'string') {
      return obj;
    }

    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return String(obj);
    }

    try {
      // 순환 참조 방지를 위한 replacer 함수
      const seen = new WeakSet();
      const replacer = (key: string, value: any) => {
        // 함수는 문자열로 변환
        if (typeof value === 'function') {
          return `[Function: ${value.name || 'anonymous'}]`;
        }

        // undefined는 null로 변환
        if (value === undefined) {
          return 'undefined';
        }

        // 순환 참조 체크
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular Reference]';
          }
          seen.add(value);
        }

        // Error 객체 특별 처리
        if (value instanceof Error) {
          return {
            name: value.name,
            message: value.message,
            stack: value.stack,
            ...value, // 추가 프로퍼티들도 포함
          };
        }

        // Date 객체 처리
        if (value instanceof Date) {
          return value.toISOString();
        }

        // RegExp 객체 처리
        if (value instanceof RegExp) {
          return value.toString();
        }

        return value;
      };

      return JSON.stringify(obj, replacer, indent);
    } catch (error) {
      // JSON.stringify 실패 시 안전한 폴백
      try {
        return `[Object: ${obj.constructor?.name || 'Unknown'}] - JSON.stringify failed: ${error.message}`;
      } catch {
        return '[Object: Unstringifiable]';
      }
    }
  }

  /**
   * JSON 문자열을 객체로 안전하게 파싱
   */
  parseJsonString<T = any>(jsonString: string, defaultValue?: T): T | null {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      this.logger.warn(`JSON 파싱 실패: ${error.message}`, { jsonString });
      return defaultValue || null;
    }
  }

  /**
   * 📝 문자열 처리 관련 메서드들
   */

  /**
   * 문자열을 카멜케이스로 변환
   */
  toCamelCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }

  /**
   * 문자열 마스킹 (개인정보 보호)
   */
  maskString(
    str: string,
    visibleStart: number = 2,
    visibleEnd: number = 2,
    maskChar: string = '*',
  ): string {
    if (!str || str.length <= visibleStart + visibleEnd) {
      return str;
    }

    const start = str.substring(0, visibleStart);
    const end = str.substring(str.length - visibleEnd);
    const middle = maskChar.repeat(str.length - visibleStart - visibleEnd);

    return start + middle + end;
  }

  /**
   * 📅 날짜/시간 처리 관련 메서드들
   */

  /**
   * 현재 타임스탬프 반환 (ISO 형식)
   */
  getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * 날짜를 한국 시간대로 변환
   */
  toKoreanTime(date: Date = new Date()): string {
    return date.toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  /**
   * ✅ 검증 관련 메서드들
   */

  /**
   * 이메일 형식 검증
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 🔐 암호화/해시 관련 메서드들
   */

  /**
   * 랜덤 문자열 생성
   */
  generateRandomString(
    length: number = 10,
    includeNumbers: boolean = true,
    includeSymbols: boolean = false,
  ): string {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    if (includeNumbers) {
      chars += '0123456789';
    }

    if (includeSymbols) {
      chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    }

    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  /**
   * 🔧 기타 유틸리티 메서드들
   */

  /**
   * 객체에서 null/undefined 값 제거
   */
  removeNullValues<T extends Record<string, any>>(obj: T): Partial<T> {
    const result: any = {};

    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (value !== null && value !== undefined) {
        result[key] = value;
      }
    });

    return result as Partial<T>;
  }

  /**
   * 지연 실행 (Promise 기반)
   */
  async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 재시도 로직
   */
  async retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 1000,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `재시도 ${attempt}/${maxAttempts} 실패: ${error.message}`,
        );

        if (attempt < maxAttempts) {
          await this.delay(delayMs * attempt); // 지수적 백오프
        }
      }
    }

    throw lastError;
  }
}
