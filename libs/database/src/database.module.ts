import { CustomConfigService } from '@app/core/config/config.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BoardEntity, CommentEntity, TestEntity } from './entities';
import { TestRepository2 } from './common';
import { BoardRepository, CommentRepository } from './board';
import { DatabaseService } from './database.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async (
        configService: CustomConfigService,
      ): Promise<TypeOrmModuleOptions> => ({
        type: 'mysql',
        host: configService.dbHost,
        port: configService.dbPort,
        username: configService.dbUserName,
        password: configService.dbPW,
        database: configService.dbDatabase,
        entities: [TestEntity, BoardEntity, CommentEntity],
        synchronize: configService.dbSync, // 개발 환경에서만 사용, 프로덕션에서는 false로 설정
      }),
      inject: [CustomConfigService],
    }),
    TypeOrmModule.forFeature([TestEntity, BoardEntity, CommentEntity]),
  ],
  providers: [
    {
      provide: DatabaseService,
      useFactory: (dataSource: DataSource) => {
        const service = new DatabaseService(dataSource);
        return DatabaseService.createProxy(service); // Proxy 적용!
      },
      inject: [DataSource],
    },
    TestRepository2,
    BoardRepository,
    CommentRepository,
  ],
  exports: [
    TypeOrmModule,
    DatabaseService,
    TestRepository2,
    BoardRepository,
    CommentRepository,
  ],
})
export class DatabaseModule {}
