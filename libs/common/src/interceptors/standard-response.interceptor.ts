import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * 📋 표준 응답 형태 인터셉터
 *
 * 모든 API 응답을 일관된 형태로 변환:
 * {
 *   success: true | false,
 *   data: any
 * }
 */
@Injectable()
export class StandardResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // 이미 표준 형태인 경우 그대로 반환
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // 에러 응답인 경우 (AllExceptionFilter에서 생성된 응답)
        if (
          data &&
          typeof data === 'object' &&
          ('statusCode' in data || 'error' in data || 'message' in data)
        ) {
          return {
            success: false,
            data: data,
          };
        }

        // 일반 성공 응답을 표준 형태로 변환
        return {
          success: true,
          data: data,
        };
      }),
    );
  }
}
