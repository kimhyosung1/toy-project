import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class NotificationLoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor(private context: string = 'NotificationService') {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss.SSS',
        }),
        winston.format.errors({ stack: true }),
        winston.format.printf(
          ({ timestamp, level, message, context, stack }) => {
            const contextStr = context ? `[${context}] ` : '';
            const stackStr = stack ? `\n${stack}` : '';
            return `${timestamp} [${level.toUpperCase()}] ${contextStr}${message}${stackStr}`;
          },
        ),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        new DailyRotateFile({
          filename: 'logs/notification-service-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
        new DailyRotateFile({
          filename: 'logs/notification-error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
        }),
      ],
    });
  }

  log(message: any, context?: string) {
    this.logger.info(message, { context: context || this.context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, {
      context: context || this.context,
      stack: trace,
    });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context: context || this.context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, { context: context || this.context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, { context: context || this.context });
  }

  /**
   * 알림 요청 로깅
   */
  logNotificationRequest(type: string, recipient: string, data?: any) {
    this.logger.info('알림 요청 처리 시작', {
      context: this.context,
      type,
      recipient,
      data: JSON.stringify(data),
    });
  }

  /**
   * 알림 완료 로깅
   */
  logNotificationComplete(type: string, recipient: string, duration: number) {
    this.logger.info('알림 요청 처리 완료', {
      context: this.context,
      type,
      recipient,
      duration: `${duration}ms`,
    });
  }

  /**
   * 알림 에러 로깅
   */
  logNotificationError(
    type: string,
    recipient: string,
    error: Error,
    duration?: number,
  ) {
    this.logger.error('알림 요청 처리 실패', {
      context: this.context,
      type,
      recipient,
      error: error.message,
      stack: error.stack,
      duration: duration ? `${duration}ms` : undefined,
    });
  }

  /**
   * HTTP API 요청 로깅
   */
  logHttpRequest(method: string, url: string, ip: string, userAgent?: string) {
    this.logger.info('HTTP API 요청', {
      context: this.context,
      method,
      url,
      ip,
      userAgent,
    });
  }

  /**
   * 큐 작업 로깅
   */
  logQueueOperation(operation: string, jobId: string, data?: any) {
    this.logger.info('큐 작업 처리', {
      context: this.context,
      operation,
      jobId,
      data: data ? JSON.stringify(data) : undefined,
    });
  }
}
