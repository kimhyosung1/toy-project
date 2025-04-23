import { ClassTransformOptions, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

// comment: todo:: 모든 반환마다 classValidate 함수를 사용하기 번거롭기에 응답 처리시 사용하도록 변경 필요

// 제네릭 타입을 이용해 클래스의 validate 체크로직
export async function classValidate<T extends object>(
  cls: new () => T,
  plain: any,
): Promise<T> {
  const instance = plainToInstance(cls, plain);
  const errors = await validate(instance);

  //todo:: 예외처리에대한 정책을 세워 정제된 예외 던지기
  if (errors.length > 0) {
    throw errors;
  }
  return instance;
}
