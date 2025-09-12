export interface SlackErrorNotification {
  errorType: string;
  message: string;
  serviceName?: string;
  schedulerName?: string;
  timestamp: string;
  environment: string;
  service: string;
  stack?: string;
  additionalData?: Record<string, any>;
}

export interface SlackStatusNotification {
  serviceName: string;
  status: 'started' | 'stopped' | 'restarted' | 'completed';
  message?: string;
  additionalData?: Record<string, any>;
}

export interface SentryErrorContext {
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  user?: {
    id?: string;
    username?: string;
    email?: string;
  };
  level?: 'error' | 'warning' | 'info' | 'debug';
}
