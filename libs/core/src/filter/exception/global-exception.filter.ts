import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';

/**
 * 전역 예외 필터
 * - notification과 scheduler에서 공통으로 사용
 * - Sentry 자동 리포팅
 * - 구조화된 에러 응답
 * - 서비스별 커스터마이징 가능
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(
    private readonly serviceName: string,
    private readonly slackNotificationHandler?: (
      errorType: string,
      message: string,
      exception: any,
      context?: any,
    ) => Promise<void>,
  ) {}

  catch(exception: any, host: ArgumentsHost): any {
    const hostType = host.getType();

    // HTTP 요청인 경우
    if (hostType === 'http') {
      return this.handleHttpException(exception, host);
    }

    // 일반적인 서비스 작업 중 예외 (스케줄러 등)
    return this.handleServiceException(exception, host);
  }

  /**
   * HTTP 예외 처리
   */
  private handleHttpException(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = `${this.serviceName} 서버 내부 오류가 발생했습니다.`;
    let error = 'InternalServerError';
    let details: any = {};

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || exception.name;
        details = exceptionResponse;
      } else {
        message = exceptionResponse as string;
        error = exception.name;
      }
    } else if (exception instanceof Error) {
      message = exception.message || `${this.serviceName} 내부 오류가 발생했습니다.`;
      error = exception.name || 'InternalServerError';
      details = {
        originalError: exception.message,
        stack: exception.stack,
      };
    } else {
      message = `알 수 없는 ${this.serviceName} 오류가 발생했습니다.`;
      details = { exception };
    }

    // 로깅
    this.logError(exception, request, statusCode);

    // Sentry 리포팅 (5xx 에러만)
    if (statusCode >= 500) {
      this.reportToSentry(exception, request, {
        service: this.serviceName,
        errorType: 'HTTP_ERROR',
      });
    }

    // Slack 알림 (심각한 에러인 경우)
    if (statusCode >= 500 && this.slackNotificationHandler) {
      this.slackNotificationHandler(
        'HTTP_ERROR',
        message,
        exception,
        {
          url: request.url,
          method: request.method,
          statusCode,
        },
      ).catch((slackError) => {
        this.logger.error(
          `Slack 알림 발송 실패: ${slackError.message}`,
          slackError.stack,
        );
      });
    }

    const errorResponse = {
      success: false,
      error,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      service: this.serviceName,
      ...(process.env.NODE_ENV === 'dev' && { details }),
    };

    if (response && response.status) {
      response.status(statusCode).json(errorResponse);
    }

    return errorResponse;
  }

  /**
   * 서비스 작업 중 예외 처리 (스케줄러 등)
   */
  private handleServiceException(exception: any, host?: ArgumentsHost) {
    const message = exception?.message || exception || `알 수 없는 ${this.serviceName} 오류`;
    const serviceName = this.extractServiceName(exception);

    // 로깅
    this.logger.error(
      `${this.serviceName} 작업 중 예외 발생: ${message}`,
      exception?.stack,
      `${this.serviceName}Exception`,
    );

    // Sentry 리포팅
    this.reportToSentry(exception, null, {
      service: this.serviceName,
      errorType: 'SERVICE_ERROR',
      serviceName,
    });

    // Slack 알림
    if (this.slackNotificationHandler) {
      this.slackNotificationHandler(
        'SERVICE_ERROR',
        message,
        exception,
        {
          serviceName,
          hostType: host?.getType(),
        },
      ).catch((slackError) => {
        this.logger.error(
          `Slack 알림 발송 실패: ${slackError.message}`,
          slackError.stack,
        );
      });
    }

    // 서비스는 계속 실행되어야 하므로 예외를 throw하지 않음
    return {
      success: false,
      error: message,
      serviceName,
      service: this.serviceName,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 에러 로깅
   */
  private logError(exception: unknown, request?: Request, status?: number): void {
    let errorMessage: string;
    let errorStack: string | undefined;

    if (exception instanceof Error) {
      errorMessage = exception.message;
      errorStack = exception.stack;
    } else {
      errorMessage = String(exception);
    }

    const logContext = request
      ? `${request.method} ${request.url}`
      : `${this.serviceName} 서비스`;

    if (status && status >= 500) {
      this.logger.error(
        `${this.serviceName} 에러 [${status}] ${logContext} - ${errorMessage}`,
        errorStack,
        `${this.serviceName}ExceptionFilter`,
      );
    } else if (status && status >= 400) {
      this.logger.warn(
        `${this.serviceName} 요청 에러 [${status}] ${logContext} - ${errorMessage}`,
        `${this.serviceName}ExceptionFilter`,
      );
    } else {
      this.logger.error(
        `${this.serviceName} 예외: ${logContext} - ${errorMessage}`,
        errorStack,
        `${this.serviceName}ExceptionFilter`,
      );
    }
  }

  /**
   * Sentry에 에러 리포팅
   */
  private reportToSentry(
    exception: any,
    request?: Request,
    context?: Record<string, any>,
  ): void {
    try {
      Sentry.withScope((scope) => {
        scope.setTag('service', this.serviceName);
        scope.setLevel('error');

        if (request) {
          scope.setContext('request', {
            method: request.method,
            url: request.url,
            headers: request.headers,
            body: request.body,
            ip: request.ip,
            userAgent: request.headers['user-agent'],
          });
        }

        if (context) {
          scope.setContext('additional', context);
        }

        Sentry.captureException(exception);
      });
    } catch (sentryError) {
      this.logger.error(
        `Sentry 리포팅 실패: ${sentryError.message}`,
        sentryError.stack,
      );
    }
  }

  /**
   * 예외에서 서비스 이름 추출
   */
  private extractServiceName(exception: any): string | null {
    // 서비스 이름이 예외 객체에 포함된 경우
    if (exception?.serviceName) {
      return exception.serviceName;
    }

    // 스택 트레이스에서 서비스 이름 추출 시도
    if (exception?.stack) {
      const patterns = [
        /(\w+SchedulerService)/,
        /(\w+Service)/,
        /(\w+Controller)/,
        /(\w+Processor)/,
      ];

      for (const pattern of patterns) {
        const match = exception.stack.match(pattern);
        if (match) {
          return match[1];
        }
      }
    }

    return null;
  }
}
