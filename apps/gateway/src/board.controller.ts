import {
  Controller,
  Get,
  Inject,
  Req,
  Post,
  Delete,
  Put,
} from '@nestjs/common';
import {
  CommonProxyClient,
  ProxyClientProvideService,
  CustomMessagePatterns,
} from 'libs/proxy/src/common-proxy-client';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
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
import {
  CreateBoardCommentResponse,
  SelectBoardCommentResponse,
} from '@app/common/dto/board/response/board-comment-manage-response';
import { CommentEntity } from '@app/database';

@Controller('boards')
@ApiTags('Board')
export class BoardController extends CommonProxyClient {
  constructor(
    @Inject(ProxyClientProvideService.BOARD_SERVICE)
    protected BoardClient: ClientProxy,
  ) {
    super();
  }

  @Post()
  @ApiOperation({ summary: '게시글 작성 API' })
  @ApiBody({ type: CreateBoardRequest })
  @ApiOkResponse({ type: CreateBoardResponse })
  async createBoard(@Req() req: Request) {
    return this.requestRedirect(
      CustomMessagePatterns.CreateBoard,
      this.BoardClient,
      req,
    );
  }

  @Get()
  @ApiOperation({ summary: '게시글 목록 API' })
  @ApiQuery({ type: SelectBoardRequest })
  @ApiOkResponse({ type: SelectBoardResponse })
  async findAllBoards(@Req() req: Request) {
    return this.requestRedirect(
      CustomMessagePatterns.FindAllBoards,
      this.BoardClient,
      req,
    );
  }

  @Put(':boardId')
  @ApiOperation({ summary: '게시글 수정 API' })
  @ApiParam({ name: 'boardId', type: Number })
  @ApiBody({ type: UpdateBoardRequest })
  @ApiOkResponse({ type: UpdateBoardResponse })
  async updateBoard(@Req() req: Request) {
    return this.requestRedirect(
      CustomMessagePatterns.UpdateBoard,
      this.BoardClient,
      req,
    );
  }

  @Delete(':boardId')
  @ApiOperation({ summary: '게시글 삭제 API' })
  @ApiParam({ name: 'boardId', type: Number })
  @ApiBody({ type: DeleteBoardRequest })
  @ApiOkResponse({ type: String })
  async deleteBoard(@Req() req: Request) {
    return this.requestRedirect(
      CustomMessagePatterns.DeleteBoard,
      this.BoardClient,
      req,
    );
  }

  @Post(':boardId/comments')
  @ApiOperation({ summary: '댓글 작성 API' })
  @ApiParam({ name: 'boardId', type: Number })
  @ApiBody({ type: CreateBoardCommentDto })
  @ApiOkResponse({ type: CreateBoardCommentResponse })
  async createComment(@Req() req: Request) {
    return this.requestRedirect(
      CustomMessagePatterns.CreateComment,
      this.BoardClient,
      req,
    );
  }

  @Get(':boardId/comments')
  @ApiOperation({ summary: '댓글 목록 API' })
  @ApiParam({ name: 'boardId', type: Number })
  @ApiQuery({ type: SelectBoardCommentDto })
  @ApiOkResponse({ type: SelectBoardCommentResponse })
  async findCommentsByBoard(@Req() req: Request) {
    return this.requestRedirect(
      CustomMessagePatterns.FindCommentsByBoard,
      this.BoardClient,
      req,
    );
  }
}
