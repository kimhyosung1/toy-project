import { Injectable } from '@nestjs/common';
import { TbCommentEntity } from '../entities/tb-comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, IsNull, Repository } from 'typeorm';
import { TbBoardEntity } from '../entities';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectRepository(TbCommentEntity)
    private readonly repository: Repository<TbCommentEntity>,
  ) {}

  async createComment(
    boardId: number,
    parentId: number,
    author: string,
    content: string,
    entityManager?: EntityManager,
  ): Promise<TbCommentEntity> {
    const emFlag = entityManager ? true : false;

    const commentRepository = emFlag
      ? entityManager.getRepository(TbCommentEntity)
      : this.repository;

    const boardRepository = emFlag
      ? entityManager.getRepository(TbBoardEntity)
      : this.repository;

    const board = await boardRepository.findOne({
      where: { boardId: boardId },
    });

    if (!board) {
      throw new Error(`게시글 ID ${boardId}를 찾을 수 없습니다.`);
    }

    // 2. 부모 댓글 존재 확인 (대댓글인 경우)
    if (parentId) {
      const parentComment = await commentRepository.findOne({
        where: { commentId: parentId },
      });

      if (!parentComment) {
        throw new Error(`부모 댓글 ID ${parentId}를 찾을 수 없습니다.`);
      }
    }

    // 3. 댓글 생성
    const comment = commentRepository.create({
      boardId: boardId,
      parentId: parentId || null,
      content: content,
      author: author,
    });

    return await commentRepository.save(comment);
  }

  // 게시글에 속한 댓글 찾기
  async findCommentsByBoard(
    boardId: number,
    page: number,
    limit: number,
  ): Promise<[TbCommentEntity[], number]> {
    // 1. 모든 최상위 댓글 조회 (parentId가 null인 댓글)
    const [rootComments, total] = await this.repository.findAndCount({
      where: { boardId, parentId: IsNull() },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 2. 최상위 댓글의 ID 목록 추출
    const rootIds = rootComments.map((comment) => comment.commentId);

    // 3. 해당 최상위 댓글들의 자식 댓글 조회
    const childComments = await this.repository.find({
      where: { boardId, parentId: In(rootIds) },
      order: { createdAt: 'DESC' },
    });

    // 4. 부모-자식 관계 구성
    rootComments.forEach((root) => {
      root.children = childComments.filter(
        (child) => child.parentId === root.commentId,
      );
    });

    // 기존 반환 형식을 유지
    return [rootComments, total];
  }
}
