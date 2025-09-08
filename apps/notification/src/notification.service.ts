import { Injectable, Logger } from '@nestjs/common';
import { KeywordNotificationRepository } from '@app/database/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { RedisQueueName, SOURCE_TYPE } from '@app/common/constants';

// 알림 생성을 위한 DTO 타입 정의
export interface NotificationCreateInput {
  title: string;
  content?: string;
  author: string;
  sourceType: SOURCE_TYPE;
  sourceId: number;
  keywords: string[];
  createdAt?: Date;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly keywordNotificationRepository: KeywordNotificationRepository,
    @InjectQueue(RedisQueueName.KEYWORD_NOTIFICATIONS)
    private readonly notificationsQueue: Queue,
  ) {}

  healthCheck(): string {
    return 'i am alive!!';
  }

  /**
   * 키워드 매치 처리 및 알림 큐 작업 추가
   * Board 서비스에서 키워드 매칭 이벤트를 받아 처리
   */
  async addKeywordMatchesQueue(
    sourceType: SOURCE_TYPE,
    sourceId: number,
    title: string,
    content: string,
    keywordMatches: any[],
    timestamp: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `[알림] ${keywordMatches.length}개의 키워드 매치 처리 시작`,
      );

      // 각 키워드 매치를 개별 알림 작업으로 큐에 추가
      const queuePromises = keywordMatches.map((keywordMatch) => {
        // 큐에 알림 작업 추가
        return this.notificationsQueue.add(
          `${keywordMatch.author}-notification-${sourceType}`,
          {
            title,
            content,
            sourceType,
            sourceId,
            matchedKeywords: keywordMatch,
            timestamp: timestamp || new Date().toISOString(),
          },
        );
      });

      // 모든 큐 작업 추가 요청을 병렬로 처리하되 완료를 기다리지 않음 (비동기)
      Promise.all(queuePromises)
        .then((results) => {
          this.logger.log(
            `[알림] 모든 알림 큐 작업 추가 완료 (총 ${results.length}개)`,
          );
        })
        .catch((error) => {
          this.logger.error(
            `[알림] 큐 작업 추가 중 오류: ${error.message}`,
            error.stack,
          );
        });
    } catch (error) {
      this.logger.error(
        `[알림] 큐 작업 초기화 중 오류: ${error.message}`,
        error.stack,
      );
    }
  }
}
