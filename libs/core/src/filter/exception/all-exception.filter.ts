import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';

/**
 * 모든 예외를 처리하는 전역 필터
 * custom exception 하고싶으면 여기서 수정
 */
@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    console.log('예외 발생시 커스텀하게 반환할래 말래?');

    // HTTP 상태 코드 결정 (간단히)
    let statusCode = 500;
    if (exception instanceof HttpException) {
      statusCode = exception?.getStatus();
    }

    const responseObj = {
      statusCode: statusCode || 500,
      timestamp: new Date().toISOString(),
      path: request.url,
      message:
        exception?.message || exception || '서버 내부 오류가 발생했습니다.',
    };

    console.log(responseObj);
    return responseObj;
  }
}
