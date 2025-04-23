import { Controller, Req } from '@nestjs/common';
import { BoardService } from './board.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CustomMessagePatterns } from '@app/proxy/common-proxy-client';
import {
  CreateBoardCommentDto,
  CreateBoardRequest,
  DeleteBoardRequest,
  SelectBoardCommentDto,
  SelectBoardRequest,
  UpdateBoardRequest,
} from '@app/common/dto/board/request';
import {
  CreateBoardResponse,
  SelectBoardResponse,
  UpdateBoardResponse,
} from '@app/common/dto/board/response';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  // 헬스 체크
  @MessagePattern(CustomMessagePatterns.BoardHealthCheck)
  healthCheck(): string {
    return this.boardService.healthCheck();
  }

  // 게시글 작성 API
  @MessagePattern(CustomMessagePatterns.CreateBoard)
  async createBoard(
    @Payload() input: CreateBoardRequest,
  ): Promise<CreateBoardResponse> {
    return this.boardService.createBoard(input);
  }

  // 게시글 목록 API
  @MessagePattern(CustomMessagePatterns.FindAllBoards)
  async findAllBoards(input: SelectBoardRequest): Promise<SelectBoardResponse> {
    return this.boardService.findAllBoards(input);
  }

  // 게시글 수정 API
  @MessagePattern(CustomMessagePatterns.UpdateBoard)
  async updateBoard(input: UpdateBoardRequest): Promise<UpdateBoardResponse> {
    return this.boardService.updateBoard(input);
  }

  // 게시글 삭제 API
  @MessagePattern(CustomMessagePatterns.DeleteBoard)
  async deleteBoard(input: DeleteBoardRequest): Promise<String> {
    return this.boardService.deleteBoard(input);
  }

  // 댓글 목록 API
  @MessagePattern(CustomMessagePatterns.FindCommentsByBoard)
  async findCommentsByBoard(input: SelectBoardCommentDto) {
    return this.boardService.findCommentsByBoard(input);
  }

  // 댓글 작성 API
  @MessagePattern(CustomMessagePatterns.CreateComment)
  async createComment(input: CreateBoardCommentDto) {
    return this.boardService.createComment(input);
  }
}
