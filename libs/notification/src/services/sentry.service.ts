import { Injectable, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';

/**
 * 간단한 Sentry 에러 리포팅 서비스
 * 최소한의 기능만 제공
 */
@Injectable()
export class SentryService {
  private readonly logger = new Logger(SentryService.name);
  private readonly isEnabled: boolean;

  constructor() {
    this.isEnabled = this.initSentry();
  }

  /**
   * Sentry 초기화
   */
  private initSentry(): boolean {
    try {
      const environment = process.env.NODE_ENV || 'dev';
      const dsn =
        environment === 'production'
          ? process.env.SENTRY_DSN_PRODUCTION
          : process.env.SENTRY_DSN_DEV;

      if (!dsn) {
        this.logger.warn('Sentry DSN이 설정되지 않았습니다.');
        return false;
      }

      Sentry.init({
        dsn,
        environment,
        tracesSampleRate: 0.1,
      });

      return true;
    } catch (error) {
      this.logger.error('Sentry 초기화 실패:', error.message);
      return false;
    }
  }

  /**
   * 🚨 에러 리포팅
   */
  async reportError(error: Error | string, context?: any): Promise<boolean> {
    if (!this.isEnabled) {
      this.logger.warn('Sentry가 비활성화되어 있습니다.');
      return false;
    }

    try {
      const errorObj = typeof error === 'string' ? new Error(error) : error;

      if (context) {
        Sentry.withScope((scope) => {
          scope.setContext('additional', context);
          Sentry.captureException(errorObj);
        });
      } else {
        Sentry.captureException(errorObj);
      }

      return true;
    } catch (err) {
      this.logger.error('Sentry 에러 리포팅 실패:', err.message);
      return false;
    }
  }

  /**
   * 📝 메시지 리포팅
   */
  async reportMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'info',
  ): Promise<boolean> {
    if (!this.isEnabled) {
      return false;
    }

    try {
      Sentry.captureMessage(message, level);
      return true;
    } catch (error) {
      this.logger.error('Sentry 메시지 리포팅 실패:', error.message);
      return false;
    }
  }
}
