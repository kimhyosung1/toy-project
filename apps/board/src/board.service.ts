import {
  CreateBoardRequest,
  SelectBoardRequest,
  UpdateBoardRequest,
  CreateBoardCommentDto,
  DeleteBoardRequest,
  SelectBoardCommentDto,
} from '@app/global-dto/board/request';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { BoardEntity, BoardRepository, CommentRepository } from '@app/database';
import { DatabaseService } from '@app/database';
import * as bcrypt from 'bcrypt';
import {
  CreateBoardResponse,
  SelectBoardModel,
  SelectBoardResponse,
  UpdateBoardResponse,
} from '@app/global-dto/board/response';
import {
  CreateBoardCommentResponse,
  SelectBoardCommentModel,
  SelectBoardCommentResponse,
} from '@app/global-dto/board/response/board-comment-manage-response';

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);

  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly commentRepository: CommentRepository,
    private readonly databaseService: DatabaseService,
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

      // 👈 인터셉터가 자동으로 CreateBoardResponse로 변환/검증함.
      return savedBoard;
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

    const res = {
      boards: boards,
      totalCount: total,
    };

    // 👈 인터셉터가 자동으로 SelectBoardResponse로 변환/검증함
    return res;
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

      // 👈 인터셉터가 자동으로 UpdateBoardResponse로 변환/검증함
      return response;
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

      // 👈 인터셉터가 자동으로 CreateBoardCommentResponse로 변환/검증함
      return savedComment;
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

    // 👈 인터셉터가 자동으로 SelectBoardCommentResponse로 변환/검증함
    return {
      comments: comments,
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
}
