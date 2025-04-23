import { Repository, EntityManager } from 'typeorm';
import { TestEntity } from '../entities/test.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TestRepository2 {
  constructor(
    @InjectRepository(TestEntity)
    private readonly testRepository: Repository<TestEntity>,
  ) {}

  async Test2HealthCheck() {
    return await this.testRepository.findOneBy({ id: 1 });
  }
}
