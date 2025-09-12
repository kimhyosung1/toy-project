import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class SchedulerValidationPipe implements PipeTransform<any> {
  constructor(
    private readonly options: {
      transform?: boolean;
      whitelist?: boolean;
      forbidNonWhitelisted?: boolean;
    } = {},
  ) {}

  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object, {
      whitelist: this.options.whitelist ?? true,
      forbidNonWhitelisted: this.options.forbidNonWhitelisted ?? true,
      transform: this.options.transform ?? true,
    });

    if (errors.length > 0) {
      const errorMessages = this.formatErrors(errors);
      throw new BadRequestException({
        message: '스케줄러 입력 데이터 검증 실패',
        errors: errorMessages,
        timestamp: new Date().toISOString(),
      });
    }

    return this.options.transform ? object : value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: any[]): string[] {
    return errors.map((error) => {
      const constraints = error.constraints;
      if (constraints) {
        return Object.values(constraints).join(', ');
      }
      return '유효하지 않은 값입니다.';
    });
  }
}
