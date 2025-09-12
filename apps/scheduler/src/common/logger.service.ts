import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class SchedulerLoggerService implements LoggerService {
  private readonly logger: winston.Logger;
  private readonly context: string = 'SchedulerService';

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({ stack: true }),
        winston.format.printf(
          ({ timestamp, level, message, stack, context }) => {
            const logContext = context || this.context;
            const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${logContext}] ${message}`;
            return stack ? `${logMessage}\n${stack}` : logMessage;
          },
        ),
      ),
      defaultMeta: { context: this.context },
      transports: [
        // 콘솔 출력
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        // 일반 로그 파일 (일별 로테이션)
        new DailyRotateFile({
          filename: 'logs/scheduler-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          level: 'info',
        }),
        // 에러 로그 파일 (일별 로테이션)
        new DailyRotateFile({
          filename: 'logs/scheduler-error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
          level: 'error',
        }),
      ],
    });

    // 개발 환경에서는 더 자세한 로그
    if (process.env.NODE_ENV === 'dev') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.prettyPrint(),
          ),
        }),
      );
    }
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

  // 스케줄러 전용 메서드들
  logSchedulerStart(schedulerName: string, cronExpression: string) {
    this.logger.info(`🕒 스케줄러 시작: ${schedulerName} (${cronExpression})`, {
      context: 'SchedulerStart',
      schedulerName,
      cronExpression,
    });
  }

  logSchedulerComplete(schedulerName: string, duration: number, result?: any) {
    this.logger.info(`✅ 스케줄러 완료: ${schedulerName} (${duration}ms)`, {
      context: 'SchedulerComplete',
      schedulerName,
      duration,
      result,
    });
  }

  logSchedulerError(schedulerName: string, error: Error, duration?: number) {
    this.logger.error(`❌ 스케줄러 오류: ${schedulerName} - ${error.message}`, {
      context: 'SchedulerError',
      schedulerName,
      error: error.stack,
      duration,
    });
  }

  logDatabaseOperation(operation: string, table: string, result?: any) {
    this.logger.info(`🗄️  DB 작업: ${operation} on ${table}`, {
      context: 'DatabaseOperation',
      operation,
      table,
      result,
    });
  }

  logDatabaseError(operation: string, table: string, error: Error) {
    this.logger.error(
      `💥 DB 오류: ${operation} on ${table} - ${error.message}`,
      {
        context: 'DatabaseError',
        operation,
        table,
        error: error.stack,
      },
    );
  }
}
