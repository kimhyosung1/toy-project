import { Injectable, NotFoundException } from '@nestjs/common';
import { TbBoardEntity } from '../entities/tb-board.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  FindOptionsWhere,
  ILike,
  Like,
  Repository,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { TbCommentEntity } from '../entities';

@Injectable()
export class BoardRepository {
  constructor(
    @InjectRepository(TbBoardEntity)
    private readonly repository: Repository<TbBoardEntity>,
  ) {}

  async createBoard(
    title: string,
    content: string,
    author: string,
    hashedPassword: string,
    entityManager?: EntityManager,
  ): Promise<TbBoardEntity> {
    const transactionRepo = entityManager
      ? entityManager.getRepository(TbBoardEntity)
      : this.repository;

    const board = transactionRepo.create({
      title: title,
      content: content,
      author: author,
      password: hashedPassword,
    });
    return await transactionRepo.save(board);
  }

  async findAllBoards(
    page: number = 1,
    limit: number = 10,
    title?: string,
    author?: string,
  ): Promise<[TbBoardEntity[], number]> {
    /* comment: 아래 쿼리를 의도한 orm 코드 생성
      SELECT id, title, author, created_at, updated_at
      FROM tb_board
      WHERE title LIKE '%게시판%' AND author LIKE '%홍길동%'
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    */
    /* comment: 풀스캔 검색을 사용했는데.. 데이터 형태와 크기, 상황에따라 검색 조건을 어떻게 할지 고려 필요 */

    const whereConditions: FindOptionsWhere<TbBoardEntity>[] = [];

    if (title) {
      whereConditions.push({ title: ILike(`%${title}%`) });
    }
    if (author) {
      whereConditions.push({ author: ILike(`%${author}%`) });
    }

    // 배열이 비어있으면 모든 게시글 가져오기
    const where = whereConditions.length > 0 ? whereConditions : {};

    return this.repository.findAndCount({
      select: [
        'boardId',
        'title',
        'author',
        'content',
        'createdAt',
        'updatedAt',
      ],
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findOneBoard(boardId: number): Promise<TbBoardEntity | null> {
    const board = await this.repository.findOne({
      where: { boardId: boardId },
    });

    if (!board) {
      throw new Error(`게시글 ID ${boardId}를 찾을 수 없습니다.`);
    }

    return board;
  }

  async updateBoard(
    boardId: number,
    title: string,
    content: string,
    entityManager?: EntityManager,
  ): Promise<TbBoardEntity> {
    const transactionRepo = entityManager
      ? entityManager.getRepository(TbBoardEntity)
      : this.repository;

    const board = await transactionRepo.findOne({
      where: { boardId: boardId },
    });

    if (!board) {
      throw new Error(`게시글 ID ${boardId}를 찾을 수 없습니다.`);
    }

    await transactionRepo.update(boardId, {
      title,
      content,
    });

    return transactionRepo.findOne({
      where: { boardId: boardId },
    });
  }

  async deleteBoard(
    boardId: number,
    entityManager?: EntityManager,
  ): Promise<void> {
    const transactionRepo = entityManager
      ? entityManager.getRepository(TbBoardEntity)
      : this.repository;

    const board = await transactionRepo.findOne({
      where: { boardId: boardId },
    });

    if (!board) {
      throw new Error(`게시글 ID ${boardId}를 찾을 수 없습니다.`);
    }

    await transactionRepo.delete(boardId);
  }

  async validatePassword(boardId: number, password: string): Promise<boolean> {
    const board = await this.repository.findOne({
      where: { boardId },
      select: ['password'],
    });

    if (!board) {
      return false;
    }

    // true: 비밀번호가 일치하는 경우 false: 비밀번호가 일치하지 않는 경우
    return bcrypt.compare(password, board.password);
  }
}
