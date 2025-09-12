import {
  ValidationPipe as NestValidationPipe,
  ArgumentMetadata,
  BadRequestException,
  ValidationPipeOptions,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export class NotificationValidationPipe extends NestValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: false,
      validationError: {
        target: false,
        value: false,
      },
      exceptionFactory: (errors) => {
        const errorMessages = errors.map((error) => {
          const constraints = Object.values(error.constraints || {});
          return {
            field: error.property,
            messages: constraints,
            value: error.value,
          };
        });

        return new BadRequestException({
          message: '요청 데이터 검증 실패',
          errors: errorMessages,
          statusCode: 400,
        });
      },
      ...options,
    });
  }

  async transform(value: any, { metatype, type }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // 알림 특화 변환 로직
    if (type === 'body') {
      // 알림 메시지 전처리
      if (value.message) {
        value.message = this.sanitizeMessage(value.message);
      }

      // 이메일 주소 정규화
      if (value.email) {
        value.email = value.email.toLowerCase().trim();
      }

      // 전화번호 정규화
      if (value.phone) {
        value.phone = this.normalizePhoneNumber(value.phone);
      }
    }

    return super.transform(value, { metatype, type });
  }

  protected toValidate(metatype: any): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  /**
   * 알림 메시지 정리 (XSS 방지, 특수문자 처리)
   */
  private sanitizeMessage(message: string): string {
    if (!message || typeof message !== 'string') return message;

    return message
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // script 태그 제거
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // iframe 태그 제거
      .replace(/javascript:/gi, '') // javascript: 프로토콜 제거
      .slice(0, 2000); // 메시지 길이 제한
  }

  /**
   * 전화번호 정규화
   */
  private normalizePhoneNumber(phone: string): string {
    if (!phone || typeof phone !== 'string') return phone;

    return phone.replace(/[^0-9+]/g, '').slice(0, 15); // 숫자와 + 기호만 허용
  }
}
