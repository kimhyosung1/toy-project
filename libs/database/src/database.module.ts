import { CustomConfigService } from '@app/common/config/config.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  TestEntity,
  BoardEntity,
  CommentEntity,
  KeywordNotificationEntity,
} from './entities';
import {
  TestRepository2,
  BoardRepository,
  CommentRepository,
  KeywordNotificationRepository,
} from './repositories';
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
        entities: [
          TestEntity,
          BoardEntity,
          CommentEntity,
          KeywordNotificationEntity,
        ],
        synchronize: configService.dbSync, // 개발 환경에서만 사용, 프로덕션에서는 false로 설정
      }),
      inject: [CustomConfigService],
    }),
    TypeOrmModule.forFeature([
      TestEntity,
      BoardEntity,
      CommentEntity,
      KeywordNotificationEntity,
    ]),
  ],
  providers: [
    DatabaseService,
    TestRepository2,
    BoardRepository,
    CommentRepository,
    KeywordNotificationRepository,
  ],
  exports: [
    TypeOrmModule,
    DatabaseService,
    TestRepository2,
    BoardRepository,
    CommentRepository,
    KeywordNotificationRepository,
  ],
})
export class DatabaseModule {}
