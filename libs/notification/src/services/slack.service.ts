import { Injectable, Logger } from '@nestjs/common';

/**
 * 간단한 Slack 알림 서비스
 * 최소한의 기능만 제공
 */
@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);
  private readonly webhookUrl: string;

  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL || '';
  }

  /**
   * 📱 간단한 메시지 전송
   */
  async sendMessage(message: string, channel?: string): Promise<boolean> {
    if (!this.webhookUrl) {
      this.logger.warn('Slack webhook URL이 설정되지 않았습니다.');
      return false;
    }

    try {
      const payload = {
        text: message,
        channel: channel || '#general',
        username: 'Bot',
        icon_emoji: ':robot_face:',
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      this.logger.error('Slack 메시지 전송 실패:', error.message);
      return false;
    }
  }

  /**
   * 🚨 에러 메시지 전송
   */
  async sendError(message: string, context?: any): Promise<boolean> {
    const errorMessage = `🚨 **에러 발생**\n\`\`\`${message}\`\`\``;
    if (context) {
      const contextStr = JSON.stringify(context, null, 2);
      return this.sendMessage(
        `${errorMessage}\n**컨텍스트:**\n\`\`\`${contextStr}\`\`\``,
        '#errors',
      );
    }
    return this.sendMessage(errorMessage, '#errors');
  }

  /**
   * ✅ 성공 메시지 전송
   */
  async sendSuccess(message: string): Promise<boolean> {
    return this.sendMessage(`✅ ${message}`, '#general');
  }

  /**
   * ⚠️ 경고 메시지 전송
   */
  async sendWarning(message: string): Promise<boolean> {
    return this.sendMessage(`⚠️ ${message}`, '#warnings');
  }
}
