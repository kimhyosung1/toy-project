import { Test, TestingModule } from '@nestjs/testing';
import { BoardController } from '../../src/board.controller';
import { BoardService } from '../../src/board.service';

describe('BoardController', () => {
  let controller: BoardController;

  const mockBoardService = {
    healthCheck: jest.fn().mockReturnValue('i am alive!!'),
    createBoard: jest.fn().mockResolvedValue({ boardId: 1 }),
    findAllBoards: jest.fn().mockResolvedValue({ boards: [], totalCount: 0 }),
    updateBoard: jest.fn().mockResolvedValue({ boardId: 1 }),
    deleteBoard: jest.fn().mockResolvedValue('삭제 성공'),
    createComment: jest.fn().mockResolvedValue({ commentId: 1 }),
    findCommentsByBoard: jest
      .fn()
      .mockResolvedValue({ comments: [], totalCount: 0 }),
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
  });

  it('컨트롤러가 정의되어야 합니다', () => {
    expect(controller).toBeDefined();
  });

  it('헬스 체크가 작동해야 합니다', () => {
    const result = controller.healthCheck();
    expect(result).toBe('i am alive!!');
  });

  it('게시글을 생성할 수 있어야 합니다', async () => {
    const createData = {
      title: 'Test',
      content: 'Content',
      author: 'User',
      password: 'pass',
    };
    const result = await controller.createBoard(createData);
    expect(result.boardId).toBe(1);
  });
});
