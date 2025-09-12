import { CustomConfigService } from '@app/core/config/config.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ALL_ENTITIES } from './entities';
import { ALL_REPOSITORIES } from './repositories';
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
        entities: [...ALL_ENTITIES],
        synchronize: configService.dbSync, // 개발 환경에서만 사용, 프로덕션에서는 false로 설정
      }),
      inject: [CustomConfigService],
    }),
    TypeOrmModule.forFeature([...ALL_ENTITIES]),
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
    ...ALL_REPOSITORIES,
  ],
  exports: [TypeOrmModule, DatabaseService, ...ALL_REPOSITORIES],
})
export class DatabaseModule {}
