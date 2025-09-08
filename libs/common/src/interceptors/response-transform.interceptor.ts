import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { RpcException } from '@nestjs/microservices';
import { Reflector } from '@nestjs/core';
import { plainToInstance, ClassConstructor } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CHECK_RESPONSE_TYPE_KEY } from '@app/common/decorators/check-response.decorator';
import { UtilityService } from '@app/utility';

/**
 * 🔄 응답 변환 인터셉터
 *
 * 역할:
 * 1. @CheckResponseWithType(Type) 메서드만 검증/변환
 * 2. 지정된 타입으로 직접 변환 및 검증
 * 3. 실패 시 명확한 에러 메시지 제공
 */
@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private utilityService: UtilityService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const methodName = context.getHandler().name;
        const controllerName = context.getClass().name;
        const hostType = context.getType();

        // 🎯 직접 지정된 응답 타입 확인
        const responseType = this.reflector.get<ClassConstructor<any>>(
          CHECK_RESPONSE_TYPE_KEY,
          context.getHandler(),
        );

        if (!responseType) {
          // 타입이 지정되지 않으면 검증 건너뛰기
          return data;
        }

        console.log(
          `🎯 [${controllerName}.${methodName}] 응답 검증 시작 -> ${responseType.name}`,
        );

        if (!data) {
          return data;
        }

        try {
          // 🔄 class-transformer로 형변환
          const transformed = plainToInstance(responseType, data, {
            // 🛡️ excludeExtraneousValues: true
            // @Expose() 데코레이터가 있는 필드만 포함 (보안 강화)
            // 예시: SelectBoardResponse에서 boards, totalCount만 노출
            //       악의적인 password, internalData 같은 필드는 자동 제거
            excludeExtraneousValues: true,

            // 🔄 enableImplicitConversion: true
            // 자동 타입 변환 활성화 (DB에서 온 문자열을 적절한 타입으로)
            // 예시: "123" → 123 (number), "true" → true (boolean)
            //       DB의 VARCHAR totalCount를 number로 자동 변환
            enableImplicitConversion: true,
          });

          // ✅ class-validator로 유효성 검사
          const errors = validateSync(transformed);

          if (errors.length > 0) {
            console.error(
              `❌ Validation failed [${controllerName}.${methodName}]:`,
              this.utilityService.toJsonString(errors, 2),
            );

            // 🚨 AllExceptionFilter로 예외 전달
            this.throwResponseException(
              hostType,
              'RESPONSE_VALIDATION_ERROR',
              'Server response validation failed',
              {
                errors: this.utilityService.toJsonString(errors, 2),
                controller: controllerName,
                method: methodName,
                rawData: this.utilityService.toJsonString(data, 2), // 원본 데이터도 포함
              },
            );
          }

          console.log(
            `✅ [${controllerName}.${methodName}] 응답 검증/변환 완료 -> ${responseType.name}`,
          );
          return transformed;
        } catch (error) {
          console.error(
            `❌ Transform error [${controllerName}.${methodName}]:`,
            this.utilityService.toJsonString(error, 2),
          );

          // 🚨 AllExceptionFilter로 예외 전달
          this.throwResponseException(
            hostType,
            'RESPONSE_TRANSFORM_ERROR',
            'Unable to process response',
            {
              originalError: this.utilityService.toJsonString(error),
              controller: controllerName,
              method: methodName,
              fullError: this.utilityService.toJsonString(error, 2), // 전체 에러 객체 정보
            },
          );
        }
      }),
      catchError((error) => {
        // 🚨 예상치 못한 에러도 AllExceptionFilter로 전달
        return throwError(() => error);
      }),
    );
  }

  /**
   * 환경에 맞는 예외를 던져서 AllExceptionFilter로 전달
   */
  private throwResponseException(
    hostType: string,
    errorCode: string,
    message: string,
    details?: any,
  ): never {
    if (hostType === 'http') {
      throw new HttpException(
        {
          errorCode,
          message,
          details,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } else if (hostType === 'rpc') {
      throw new RpcException({
        errorCode,
        message,
        details,
        timestamp: new Date().toISOString(),
      });
    } else {
      // 기타 환경: 일반 Error로 던지기 (AllExceptionFilter에서 처리)
      throw new Error(`${errorCode}: ${message}`);
    }
  }
}
