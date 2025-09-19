import { Test, TestingModule } from '@nestjs/testing';
import { BoardService } from '../../src/board.service';
import {
  BoardRepository,
  CommentRepository,
  DatabaseService,
} from '@app/database';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('BoardService', () => {
  let service: BoardService;

  const mockBoardRepository = {
    createBoard: jest.fn().mockResolvedValue({ boardId: 1 }),
    findAllBoards: jest.fn().mockResolvedValue([[], 0]),
    updateBoard: jest.fn().mockResolvedValue({ boardId: 1 }),
    findOneBoard: jest.fn().mockResolvedValue({ boardId: 1 }),
  };

  const mockCommentRepository = {
    createComment: jest.fn().mockResolvedValue({ commentId: 1 }),
    findCommentsByBoard: jest.fn().mockResolvedValue([[], 0]),
  };

  const mockDatabaseService = {
    runTransaction: jest.fn((callback) => callback({})),
    getConnection: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: BoardService,
          useFactory: () =>
            new BoardService(
              mockBoardRepository as any,
              mockCommentRepository as any,
              mockDatabaseService as any,
            ),
        },
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);
    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
  });

  it('서비스가 정의되어야 합니다', () => {
    expect(service).toBeDefined();
  });

  it('헬스 체크가 작동해야 합니다', () => {
    const result = service.healthCheck();
    expect(result).toBe('i am alive!!');
  });

  it('게시글을 생성할 수 있어야 합니다', async () => {
    const createData = {
      title: 'Test',
      content: 'Content',
      author: 'User',
      password: 'pass',
    };
    const result = await service.createBoard(createData);
    expect(result.boardId).toBe(1);
  });
});
