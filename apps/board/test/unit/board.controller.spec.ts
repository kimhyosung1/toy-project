import { Test, TestingModule } from '@nestjs/testing';
import { BoardController } from '../../src/board.controller';
import { BoardService } from '../../src/board.service';
import {
  CreateBoardRequest,
  UpdateBoardRequest,
  DeleteBoardRequest,
  SelectBoardRequest,
  CreateBoardCommentDto,
  SelectBoardCommentDto,
} from '@app/global-dto/board/request';

describe('BoardController', () => {
  let controller: BoardController;
  let service: BoardService;

  // 서비스 모킹
  const mockBoardService = {
    healthCheck: jest.fn(),
    createBoard: jest.fn(),
    findAllBoards: jest.fn(),
    updateBoard: jest.fn(),
    deleteBoard: jest.fn(),
    findCommentsByBoard: jest.fn(),
    createComment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardController],
      providers: [
        {
          provide: BoardService,
          useValue: mockBoardService,
        },
      ],
    }).compile();

    controller = module.get<BoardController>(BoardController);
    service = module.get<BoardService>(BoardService);

    // 모킹된 함수 초기화
    jest.clearAllMocks();
  });

  describe('healthCheck', () => {
    it('서비스의 healthCheck 함수를 호출하고 결과를 반환해야 합니다', () => {
      // 준비
      const expectedResult = 'i am alive!!';
      mockBoardService.healthCheck.mockReturnValue(expectedResult);

      // 실행
      const result = controller.healthCheck();

      // 검증
      expect(service.healthCheck).toHaveBeenCalled();
      expect(result).toBe(expectedResult);
    });
  });

  describe('createBoard', () => {
    it('서비스의 createBoard 함수를 호출하고 결과를 반환해야 합니다', async () => {
      // 준비
      const input: CreateBoardRequest = {
        title: '테스트 제목',
        content: '테스트 내용',
        author: '테스트 작성자',
        password: '테스트1234',
      };

      const expectedResult = {
        boardId: 1,
        title: input.title,
        content: input.content,
        author: input.author,
        createdAt: new Date(),
      };

      mockBoardService.createBoard.mockResolvedValue(expectedResult);

      // 실행
      const result = await controller.createBoard(input);

      // 검증
      expect(service.createBoard).toHaveBeenCalledWith(input);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAllBoards', () => {
    it('서비스의 findAllBoards 함수를 호출하고 결과를 반환해야 합니다', async () => {
      // 준비
      const input: SelectBoardRequest = {
        page: 1,
        limit: 10,
        title: '테스트',
        author: '작성자',
      };

      const boards = [
        {
          boardId: 1,
          title: '테스트 제목 1',
          content: '테스트 내용 1',
          author: '작성자',
          createdAt: new Date(),
        },
        {
          boardId: 2,
          title: '테스트 제목 2',
          content: '테스트 내용 2',
          author: '작성자',
          createdAt: new Date(),
        },
      ];

      const expectedResult = {
        boards,
        totalCount: 2,
      };

      mockBoardService.findAllBoards.mockResolvedValue(expectedResult);

      // 실행
      const result = await controller.findAllBoards(input);

      // 검증
      expect(service.findAllBoards).toHaveBeenCalledWith(input);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateBoard', () => {
    it('서비스의 updateBoard 함수를 호출하고 결과를 반환해야 합니다', async () => {
      // 준비
      const input: UpdateBoardRequest = {
        boardId: 1,
        title: '수정된 제목',
        content: '수정된 내용',
        password: '테스트1234',
      };

      const expectedResult = {
        boardId: input.boardId,
        title: input.title,
        content: input.content,
        updatedAt: new Date(),
      };

      mockBoardService.updateBoard.mockResolvedValue(expectedResult);

      // 실행
      const result = await controller.updateBoard(input);

      // 검증
      expect(service.updateBoard).toHaveBeenCalledWith(input);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deleteBoard', () => {
    it('서비스의 deleteBoard 함수를 호출하고 결과를 반환해야 합니다', async () => {
      // 준비
      const input: DeleteBoardRequest = {
        boardId: 1,
        password: '테스트1234',
      };

      const expectedResult = '게시글 삭제 성공!!';
      mockBoardService.deleteBoard.mockResolvedValue(expectedResult);

      // 실행
      const result = await controller.deleteBoard(input);

      // 검증
      expect(service.deleteBoard).toHaveBeenCalledWith(input);
      expect(result).toBe(expectedResult);
    });
  });

  describe('findCommentsByBoard', () => {
    it('서비스의 findCommentsByBoard 함수를 호출하고 결과를 반환해야 합니다', async () => {
      // 준비
      const input: SelectBoardCommentDto = {
        boardId: 1,
        page: 1,
        limit: 10,
      };

      const comments = [
        {
          commentId: 1,
          boardId: 1,
          parentId: null,
          author: '댓글 작성자 1',
          content: '댓글 내용 1',
          createdAt: new Date(),
        },
        {
          commentId: 2,
          boardId: 1,
          parentId: null,
          author: '댓글 작성자 2',
          content: '댓글 내용 2',
          createdAt: new Date(),
        },
      ];

      const expectedResult = {
        comments,
        totalCount: 2,
      };

      mockBoardService.findCommentsByBoard.mockResolvedValue(expectedResult);

      // 실행
      const result = await controller.findCommentsByBoard(input);

      // 검증
      expect(service.findCommentsByBoard).toHaveBeenCalledWith(input);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('createComment', () => {
    it('서비스의 createComment 함수를 호출하고 결과를 반환해야 합니다', async () => {
      // 준비
      const input: CreateBoardCommentDto = {
        boardId: 1,
        parentId: null,
        author: '댓글 작성자',
        content: '댓글 내용',
      };

      const expectedResult = {
        commentId: 1,
        boardId: input.boardId,
        parentId: input.parentId,
        author: input.author,
        content: input.content,
        createdAt: new Date(),
      };

      mockBoardService.createComment.mockResolvedValue(expectedResult);

      // 실행
      const result = await controller.createComment(input);

      // 검증
      expect(service.createComment).toHaveBeenCalledWith(input);
      expect(result).toEqual(expectedResult);
    });
  });
});
