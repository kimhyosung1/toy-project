import { Test, TestingModule } from '@nestjs/testing';
import { BoardService } from '../../src/board.service';
import { BoardRepository, CommentRepository } from '@app/database/board';
import { KeywordNotificationRepository } from '@app/database/common';
import { DatabaseService } from '@app/database/database.service';
import { ClientProxy } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { SOURCE_TYPE } from '@app/common';
import { EntityManager } from 'typeorm';
import { CreateBoardRequest } from '@app/global-dto/board/request';
import { ProxyClientProvideService } from 'libs/proxy/src/common-proxy-client';
import { BoardEntity } from '@app/database/board';

jest.mock('bcrypt');

describe('BoardService', () => {
  let service: BoardService;
  let boardRepository: BoardRepository;
  let commentRepository: CommentRepository;
  let keywordNotificationRepository: KeywordNotificationRepository;
  let databaseService: DatabaseService;
  let notificationClient: ClientProxy;

  const mockBoardRepository = {
    createBoard: jest.fn(),
    findAllBoards: jest.fn(),
    updateBoard: jest.fn(),
    findOneBoard: jest.fn(),
  };

  const mockCommentRepository = {
    createComment: jest.fn(),
    findCommentsByBoard: jest.fn(),
  };

  const mockKeywordNotificationRepository = {
    findMatchingKeywords: jest.fn(),
  };

  const mockDatabaseService = {
    runTransaction: jest.fn((callback) => callback(mockEntityManager)),
  };

  const mockNotificationClient = {
    emit: jest.fn(),
  };

  const mockEntityManager = {
    getRepository: jest.fn().mockReturnValue({
      delete: jest.fn().mockResolvedValue(true),
    }),
  } as unknown as EntityManager;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        {
          provide: BoardRepository,
          useValue: mockBoardRepository,
        },
        {
          provide: CommentRepository,
          useValue: mockCommentRepository,
        },
        {
          provide: KeywordNotificationRepository,
          useValue: mockKeywordNotificationRepository,
        },
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: ProxyClientProvideService.NOTIFICATION_SERVICE,
          useValue: mockNotificationClient,
        },
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);
    boardRepository = module.get<BoardRepository>(BoardRepository);
    commentRepository = module.get<CommentRepository>(CommentRepository);
    keywordNotificationRepository = module.get<KeywordNotificationRepository>(
      KeywordNotificationRepository,
    );
    databaseService = module.get<DatabaseService>(DatabaseService);
    notificationClient = module.get<ClientProxy>(
      ProxyClientProvideService.NOTIFICATION_SERVICE,
    );
  });

  describe('healthCheck', () => {
    it('헬스 체크가 성공적으로 수행되어야 합니다', () => {
      expect(service.healthCheck()).toBe('i am alive!!');
    });
  });

  describe('createBoard', () => {
    it('게시글이 성공적으로 생성되어야 합니다', async () => {
      // 입력 데이터 준비
      const createBoardRequest: CreateBoardRequest = {
        title: '테스트 제목',
        content: '테스트 내용',
        author: '테스트 작성자',
        password: '테스트1234',
      };

      // 모의 반환값 설정
      const hashedPassword = 'hashed_password';
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const savedBoard = {
        boardId: 1,
        title: createBoardRequest.title,
        content: createBoardRequest.content,
        author: createBoardRequest.author,
        createdAt: new Date(),
      };

      mockBoardRepository.createBoard.mockResolvedValue(savedBoard);
      mockKeywordNotificationRepository.findMatchingKeywords.mockResolvedValue(
        [],
      );

      // 실행
      const result = await service.createBoard(createBoardRequest);

      // 검증
      expect(bcrypt.hash).toHaveBeenCalledWith(
        createBoardRequest.password,
        'salt',
      );
      expect(mockBoardRepository.createBoard).toHaveBeenCalledWith(
        createBoardRequest.title,
        createBoardRequest.content,
        createBoardRequest.author,
        hashedPassword,
        mockEntityManager,
      );
      expect(
        mockKeywordNotificationRepository.findMatchingKeywords,
      ).toHaveBeenCalledWith(
        createBoardRequest.title,
        createBoardRequest.content,
        mockEntityManager,
      );
      expect(result).toEqual(savedBoard);
    });

    it('키워드가 매칭되면 알림 서비스로 이벤트를 전송해야 합니다', async () => {
      // 입력 데이터 준비
      const createBoardRequest: CreateBoardRequest = {
        title: '테스트 제목',
        content: '테스트 내용',
        author: '테스트 작성자',
        password: '테스트1234',
      };

      // 모의 반환값 설정
      const hashedPassword = 'hashed_password';
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const savedBoard = {
        boardId: 1,
        title: createBoardRequest.title,
        content: createBoardRequest.content,
        author: createBoardRequest.author,
        createdAt: new Date(),
      };

      const keywordMatches = [
        { keyNotificationId: 1, userId: 1, keyword: '테스트' },
      ];

      mockBoardRepository.createBoard.mockResolvedValue(savedBoard);
      mockKeywordNotificationRepository.findMatchingKeywords.mockResolvedValue(
        keywordMatches,
      );

      // 실행
      await service.createBoard(createBoardRequest);

      // 검증
      expect(notificationClient.emit).toHaveBeenCalledWith(
        'keyword.matched',
        expect.objectContaining({
          sourceType: SOURCE_TYPE.BOARD,
          sourceId: savedBoard.boardId,
          title: savedBoard.title,
          content: savedBoard.content,
          keywordMatches,
        }),
      );
    });
  });

  describe('findAllBoards', () => {
    it('게시글 목록을 성공적으로 조회해야 합니다', async () => {
      // 모의 데이터 준비
      const page = 1;
      const limit = 10;
      const title = '테스트';
      const author = '작성자';

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

      const totalCount = 2;
      mockBoardRepository.findAllBoards.mockResolvedValue([boards, totalCount]);

      // 실행
      const result = await service.findAllBoards({
        page,
        limit,
        title,
        author,
      });

      // 검증
      expect(mockBoardRepository.findAllBoards).toHaveBeenCalledWith(
        page,
        limit,
        title,
        author,
      );
      expect(result.boards).toHaveLength(2);
      expect(result.totalCount).toBe(totalCount);
    });
  });

  describe('updateBoard', () => {
    it('유효한 비밀번호로 게시글을 성공적으로 수정해야 합니다', async () => {
      // 입력 데이터 준비
      const updateBoardRequest = {
        boardId: 1,
        title: '수정된 제목',
        content: '수정된 내용',
        password: '테스트1234',
      };

      // 모의 반환값 설정
      const board = {
        boardId: 1,
        password: 'hashed_password',
      };

      mockBoardRepository.findOneBoard.mockResolvedValue(board);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const updatedBoard = {
        boardId: 1,
        title: updateBoardRequest.title,
        content: updateBoardRequest.content,
        author: '테스트 작성자',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBoardRepository.updateBoard.mockResolvedValue(updatedBoard);

      // 실행
      const result = await service.updateBoard(updateBoardRequest);

      // 검증
      expect(mockBoardRepository.findOneBoard).toHaveBeenCalledWith(
        updateBoardRequest.boardId,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        updateBoardRequest.password,
        board.password,
      );
      expect(mockBoardRepository.updateBoard).toHaveBeenCalledWith(
        updateBoardRequest.boardId,
        updateBoardRequest.title,
        updateBoardRequest.content,
        mockEntityManager,
      );
      expect(result).toEqual(updatedBoard);
    });

    it('비밀번호가 유효하지 않은 경우 오류를 발생시켜야 합니다', async () => {
      // 입력 데이터 준비
      const updateBoardRequest = {
        boardId: 1,
        title: '수정된 제목',
        content: '수정된 내용',
        password: '틀린비밀번호',
      };

      // 모의 반환값 설정
      const board = {
        boardId: 1,
        password: 'hashed_password',
      };

      mockBoardRepository.findOneBoard.mockResolvedValue(board);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // 실행 및 오류 검증
      await expect(service.updateBoard(updateBoardRequest)).rejects.toThrow(
        '비밀번호 다시 확인해주세요.',
      );
    });
  });

  describe('deleteBoard', () => {
    it('유효한 비밀번호로 게시글을 성공적으로 삭제해야 합니다', async () => {
      // 입력 데이터 준비
      const deleteBoardRequest = {
        boardId: 1,
        password: '테스트1234',
      };

      // 모의 반환값 설정
      const board = {
        boardId: 1,
        password: 'hashed_password',
      };

      mockBoardRepository.findOneBoard.mockResolvedValue(board);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // 실행
      const result = await service.deleteBoard(deleteBoardRequest);

      // 검증
      expect(mockBoardRepository.findOneBoard).toHaveBeenCalledWith(
        deleteBoardRequest.boardId,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        deleteBoardRequest.password,
        board.password,
      );
      expect(mockEntityManager.getRepository).toHaveBeenCalledWith(BoardEntity);
      expect(
        mockEntityManager.getRepository(BoardEntity).delete,
      ).toHaveBeenCalledWith(deleteBoardRequest.boardId);
      expect(result).toBe('게시글 삭제 성공!!');
    });

    it('비밀번호가 유효하지 않은 경우 오류를 발생시켜야 합니다', async () => {
      // 입력 데이터 준비
      const deleteBoardRequest = {
        boardId: 1,
        password: '틀린비밀번호',
      };

      // 모의 반환값 설정
      const board = {
        boardId: 1,
        password: 'hashed_password',
      };

      mockBoardRepository.findOneBoard.mockResolvedValue(board);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // 실행 및 오류 검증
      await expect(service.deleteBoard(deleteBoardRequest)).rejects.toThrow(
        '비밀번호 다시 확인해주세요.',
      );
    });
  });

  describe('createComment', () => {
    it('댓글을 성공적으로 생성해야 합니다', async () => {
      // 입력 데이터 준비
      const createCommentDto = {
        boardId: 1,
        parentId: null,
        author: '댓글 작성자',
        content: '댓글 내용',
      };

      // 모의 반환값 설정
      const savedComment = {
        commentId: 1,
        boardId: createCommentDto.boardId,
        parentId: createCommentDto.parentId,
        author: createCommentDto.author,
        content: createCommentDto.content,
        createdAt: new Date(),
      };

      const board = {
        boardId: 1,
        title: '게시글 제목',
      };

      mockCommentRepository.createComment.mockResolvedValue(savedComment);
      mockBoardRepository.findOneBoard.mockResolvedValue(board);
      mockKeywordNotificationRepository.findMatchingKeywords.mockResolvedValue(
        [],
      );

      // 실행
      const result = await service.createComment(createCommentDto);

      // 검증
      expect(mockCommentRepository.createComment).toHaveBeenCalledWith(
        createCommentDto.boardId,
        createCommentDto.parentId,
        createCommentDto.author,
        createCommentDto.content,
        mockEntityManager,
      );
      expect(mockBoardRepository.findOneBoard).toHaveBeenCalledWith(
        createCommentDto.boardId,
      );
      expect(
        mockKeywordNotificationRepository.findMatchingKeywords,
      ).toHaveBeenCalledWith(
        board.title,
        createCommentDto.content,
        mockEntityManager,
      );
      expect(result).toEqual(savedComment);
    });
  });

  describe('findCommentsByBoard', () => {
    it('게시글에 대한 댓글 목록을 성공적으로 조회해야 합니다', async () => {
      // 모의 데이터 준비
      const boardId = 1;
      const page = 1;
      const limit = 10;

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

      const totalCount = 2;
      mockCommentRepository.findCommentsByBoard.mockResolvedValue([
        comments,
        totalCount,
      ]);

      // 실행
      const result = await service.findCommentsByBoard({
        boardId,
        page,
        limit,
      });

      // 검증
      expect(mockCommentRepository.findCommentsByBoard).toHaveBeenCalledWith(
        boardId,
        page,
        limit,
      );
      expect(result.comments).toHaveLength(2);
      expect(result.totalCount).toBe(totalCount);
    });
  });
});
