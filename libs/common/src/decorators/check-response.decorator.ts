import { SetMetadata } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';

/**
 * 🎯 응답 검증 데코레이터들
 *
 * 사용법:
 * @CheckResponseWithType(CreateBoardResponse)
 * async createBoard(): Promise<CreateBoardResponse> {
 *   // CreateBoardResponse로 자동 검증/변환
 * }
 */

export const CHECK_RESPONSE_TYPE_KEY = 'check_response_type';

// 메서드에 직접 타입 지정
export const CheckResponseWithType = <T>(responseType: ClassConstructor<T>) => {
  return (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) => {
    SetMetadata(CHECK_RESPONSE_TYPE_KEY, responseType)(
      target,
      propertyKey,
      descriptor,
    );
  };
};
