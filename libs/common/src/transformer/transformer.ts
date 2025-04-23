import { applyDecorators } from '@nestjs/common';
import { Transform, TransformFnParams } from 'class-transformer';

export function NumberTransform() {
  return applyDecorators(
    Transform((params: TransformFnParams) => {
      if (!/^\d+$/.test(params.value)) {
        return params.value;
      } else return parseInt(params.value);
    }),
  );
}

export function StringTransform() {
  return applyDecorators(
    Transform((params: TransformFnParams) =>
      typeof params.value === 'string' ? params.value.trim() : params.value,
    ),
  );
}
