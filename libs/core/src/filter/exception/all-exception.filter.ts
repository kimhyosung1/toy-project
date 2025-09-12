import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { RpcException } from '@nestjs/microservices';
import { Request, Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { UtilityService } from '@app/utility';
import { Inject, Optional } from '@nestjs/common';

/**
 * 모든 예외를 처리하는 전역 필터
 * HTTP, RPC, 마이크로서비스 환경 모두에서 작동합니다.
 * 인터셉터, 서비스, 컨트롤러 등 어디서든 발생하는 모든 예외를 처리합니다.
 */
@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost?: HttpAdapterHost,
    @Optional() private readonly utilityService?: UtilityService,
  ) {}

  catch(exception: any, host: ArgumentsHost): any {
    const hostType = host.getType();

    // RPC 호출이 Gateway로 전파되어 HTTP로 다시 처리되는 경우 구분
    const isRpcErrorPropagated =
      hostType === 'http' && exception instanceof RpcException;

    // HTTP 환경 (게이트웨이, HTTP API)
    if (hostType === 'http') {
      return this.handleHttpException(exception, host);
    }

    // RPC 환경 (마이크로서비스 간 통신)
    if (hostType === 'rpc') {
      return this.handleRpcException(exception, host);
    }

    // WS 환경 (웹소켓) - 필요한 경우
    if (hostType === 'ws') {
      return this.handleWsException(exception, host);
    }

    // 기본 처리
    console.error('❌ 처리되지 않은 예외 타입:', hostType, exception);
    return this.createErrorResponse(exception);
  }

  /**
   * HTTP 예외 처리 (게이트웨이, REST API)
   */
  private handleHttpException(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '서버 내부 오류가 발생했습니다.';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any)?.message || message;
    } else if (exception instanceof RpcException) {
      // RPC 예외를 HTTP로 변환
      const rpcError = exception.getError();
      message =
        typeof rpcError === 'string'
          ? rpcError
          : (rpcError as any)?.message || message;
      statusCode = this.mapRpcErrorToHttpStatus(rpcError);
    } else {
      message = exception?.message || exception || message;
    }

    const responseObj = {
      success: false,
      statusCode,
      timestamp: new Date().toISOString(),
      path: request?.url || 'unknown',
      message,
    };

    // RPC에서 전파된 경우와 순수 HTTP 에러 구분
    const isFromRpc = exception instanceof RpcException;
    console.log(
      `📤 [HTTP] ${isFromRpc ? '(RPC 에러 변환)' : '(HTTP 직접 에러)'} 응답:`,
      responseObj,
    );

    if (this.httpAdapterHost?.httpAdapter && response) {
      this.httpAdapterHost.httpAdapter.reply(response, responseObj, statusCode);
    }

    return responseObj;
  }

  /**
   * RPC 예외 처리 (마이크로서비스)
   */
  private handleRpcException(
    exception: any,
    host: ArgumentsHost,
  ): Observable<any> {
    const ctx = host.switchToRpc();
    const data = ctx.getData();

    let errorCode = 'INTERNAL_ERROR';
    let message = '서버 내부 오류가 발생했습니다.';

    if (exception instanceof RpcException) {
      const rpcError = exception.getError();
      if (typeof rpcError === 'object' && (rpcError as any)?.errorCode) {
        errorCode = (rpcError as any).errorCode;
        message = (rpcError as any).message || message;
      } else {
        message = typeof rpcError === 'string' ? rpcError : message;
      }
    } else if (exception instanceof HttpException) {
      errorCode = this.mapHttpStatusToRpcError(exception.getStatus());
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any)?.message || message;
    } else {
      message = exception?.message || exception || message;
    }

    const errorResponse = {
      success: false,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      data: data || null,
    };

    console.log('📤 [RPC] (마이크로서비스 에러) 응답:', errorResponse);

    return throwError(() => errorResponse);
  }

  /**
   * WebSocket 예외 처리
   */
  private handleWsException(exception: any, host: ArgumentsHost) {
    console.log('🔌 WebSocket 예외 처리:', exception);

    const errorResponse = this.createErrorResponse(exception);
    console.log('📤 WS 응답:', errorResponse);

    return errorResponse;
  }

  /**
   * 기본 에러 응답 생성
   */
  private createErrorResponse(exception: any) {
    return {
      success: false,
      errorCode: 'INTERNAL_ERROR',
      message:
        exception?.message || exception || '서버 내부 오류가 발생했습니다.',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * RPC 에러를 HTTP 상태 코드로 매핑
   */
  private mapRpcErrorToHttpStatus(rpcError: any): number {
    if (typeof rpcError === 'object' && rpcError?.errorCode) {
      switch (rpcError.errorCode) {
        case 'NOT_FOUND':
          return HttpStatus.NOT_FOUND;
        case 'VALIDATION_ERROR':
          return HttpStatus.BAD_REQUEST;
        case 'UNAUTHORIZED':
          return HttpStatus.UNAUTHORIZED;
        case 'BUSINESS_ERROR':
          return HttpStatus.CONFLICT;
        default:
          return HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * HTTP 상태를 RPC 에러 코드로 매핑
   */
  private mapHttpStatusToRpcError(status: number): string {
    switch (status) {
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.BAD_REQUEST:
        return 'VALIDATION_ERROR';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.CONFLICT:
        return 'BUSINESS_ERROR';
      default:
        return 'INTERNAL_ERROR';
    }
  }
}
