import { Expose, Type } from 'class-transformer';
import { IsBoolean } from 'class-validator';

/**
 * 📋 표준 API 응답 DTO
 *
 * 모든 API 응답의 일관된 형태를 정의
 */
export class StandardResponseDto<T = any> {
  /**
   * 응답 성공 여부
   */
  @Expose()
  @IsBoolean()
  success: boolean;

  /**
   * 실제 응답 데이터
   */
  @Expose()
  data: T;

  constructor(success: boolean, data: T) {
    this.success = success;
    this.data = data;
  }

  /**
   * 성공 응답 생성 헬퍼 메서드
   */
  static success<T>(data: T): StandardResponseDto<T> {
    return new StandardResponseDto(true, data);
  }

  /**
   * 실패 응답 생성 헬퍼 메서드
   */
  static failure<T>(data: T): StandardResponseDto<T> {
    return new StandardResponseDto(false, data);
  }
}
