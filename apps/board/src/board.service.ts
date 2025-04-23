import {
  CreateBoardRequest,
  SelectBoardRequest,
  UpdateBoardRequest,
  CreateBoardCommentDto,
  DeleteBoardRequest,
  SelectBoardCommentDto,
} from '@app/common/dto/board/request';
import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  BoardEntity,
  BoardRepository,
  CommentRepository,
  KeywordNotificationRepository,
} from 'libs/database/src';
import { DatabaseService } from 'libs/database/src/database.service';
import * as bcrypt from 'bcrypt';
import {
  CreateBoardResponse,
  SelectBoardModel,
  SelectBoardResponse,
  UpdateBoardResponse,
} from '@app/common/dto/board/response';
import { classValidate } from '@app/common/validate/class-validate';
import {
  CreateBoardCommentResponse,
  SelectBoardCommentModel,
  SelectBoardCommentResponse,
} from '@app/common/dto/board/response/board-comment-manage-response';
import { ProxyClientProvideService } from 'libs/proxy/src/common-proxy-client';
import { ClientProxy } from '@nestjs/microservices';
import { SOURCE_TYPE } from '@app/common';

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);

  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly commentRepository: CommentRepository,
    private readonly keywordNotificationRepository: KeywordNotificationRepository,
    private readonly databaseService: DatabaseService,
    @Inject(ProxyClientProvideService.NOTIFICATION_SERVICE)
    private notificationClient: ClientProxy,
  ) {}

  healthCheck(): string {
    return 'i am alive!!';
  }

  // 게시글 작성 - 트랜잭션 처리
  async createBoard(input: CreateBoardRequest): Promise<CreateBoardResponse> {
    return this.databaseService.runTransaction(async (entityManager) => {
      // 1. 비밀번호 해싱
      const hashedPassword = await this.hashPassword(input.password);

      const savedBoard = await this.boardRepository.createBoard(
        input.title,
        input.content,
        input.author,
        hashedPassword,
        entityManager,
      );

      // 키워드 알림 처리
      await this.checkKeywordsAndSendNotifications(
        SOURCE_TYPE.BOARD,
        savedBoard.boardId,
        input.title,
        input.content,
        entityManager,
      );

      // dto 유효성 검증
      return await classValidate(CreateBoardResponse, savedBoard);
    });
  }

  // 게시글 목록 조회 및 검색
  async findAllBoards(input: SelectBoardRequest): Promise<SelectBoardResponse> {
    const [boards, total] = await this.boardRepository.findAllBoards(
      input.page,
      input.limit,
      input.title,
      input.author,
    );

    const models = await Promise.all(
      boards.map(async (board) => {
        return await classValidate(SelectBoardModel, board);
      }),
    );

    return {
      boards: models,
      totalCount: total,
    };
  }

  // 게시글 수정 - 비밀번호 확인 후 트랜잭션 사용
  async updateBoard(input: UpdateBoardRequest): Promise<UpdateBoardResponse> {
    // 비밀번호 확인
    const isValid = await this.validatePassword(input.boardId, input.password);

    if (!isValid) {
      throw new Error('비밀번호 다시 확인해주세요.');
    }

    return this.databaseService.runTransaction(async (entityManager) => {
      const response = await this.boardRepository.updateBoard(
        input.boardId,
        input.title,
        input.content,
        entityManager,
      );

      return await classValidate(UpdateBoardResponse, response);
    });
  }

  // 게시글 삭제 - 트랜잭션 처리
  async deleteBoard(input: DeleteBoardRequest): Promise<String> {
    // 비밀번호 확인 - true: 비밀번호가 일치하는 경우 false: 비밀번호가 일치하지 않는 경우
    const isValid = await this.validatePassword(input.boardId, input.password);

    if (!isValid) {
      throw new Error('비밀번호 다시 확인해주세요.');
    }

    await this.databaseService.runTransaction(async (entityManager) => {
      const boardRepository = entityManager.getRepository(BoardEntity);
      await boardRepository.delete(input.boardId);
    });

    return '게시글 삭제 성공!!';
  }

  // 댓글 생성 - 트랜잭션 처리
  async createComment(
    input: CreateBoardCommentDto,
  ): Promise<CreateBoardCommentResponse> {
    return this.databaseService.runTransaction(async (entityManager) => {
      const savedComment = await this.commentRepository.createComment(
        input.boardId,
        input.parentId,
        input.author,
        input.content,
        entityManager,
      );

      const board = await this.boardRepository.findOneBoard(input.boardId);

      // 키워드 알림 처리
      await this.checkKeywordsAndSendNotifications(
        SOURCE_TYPE.COMMENT,
        savedComment.commentId,
        board.title,
        input.content,
        entityManager,
      );

      const response = await classValidate(
        CreateBoardCommentResponse,
        savedComment,
      );

      return response;
    });
  }

  // 댓글 목록 조회
  async findCommentsByBoard(
    input: SelectBoardCommentDto,
  ): Promise<SelectBoardCommentResponse> {
    const [comments, total] = await this.commentRepository.findCommentsByBoard(
      input.boardId,
      input.page,
      input.limit,
    );

    const validatedComments = await Promise.all(
      comments.map(async (comment) => {
        return await classValidate(SelectBoardCommentModel, comment);
      }),
    );

    return {
      comments: validatedComments,
      totalCount: total,
    };
  }

  // 비밀번호 검증 헬퍼 메서드
  private async validatePassword(
    id: number,
    password: string,
  ): Promise<boolean> {
    const boardEntity = await this.boardRepository.findOneBoard(id);

    if (!boardEntity) {
      return false;
    }

    return bcrypt.compare(password, boardEntity.password);
  }

  // 비밀번호 해시 헬퍼 메서드
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  // 키워드 검사 및 알림 전송 - 키워드 매칭만 확인하고 알림 생성은 notification 서비스로 위임
  private async checkKeywordsAndSendNotifications(
    sourceType: SOURCE_TYPE,
    sourceId: number,
    title: string,
    content: string,
    entityManager: any,
  ): Promise<void> {
    try {
      // DB 레벨에서 매칭되는 키워드만 가져오기
      const keywordMatches =
        await this.keywordNotificationRepository.findMatchingKeywords(
          title,
          content,
          entityManager,
        );

      // 키워드 매칭이 있는 경우만 알림 서비스로 전달
      if (keywordMatches.length > 0) {
        // 알림 서비스로 이벤트 전송 (비동기)
        this.notificationClient.emit('keyword.matched', {
          sourceType,
          sourceId,
          title,
          content,
          keywordMatches,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.logger.error('[알림] 키워드 매칭 검사 중 오류 발생:', error);
      // 알림 미전송이 크리티컬하지 않다면 error throw 하지않고 로그만 남기자
    }
  }
}
