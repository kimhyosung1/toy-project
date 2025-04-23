import { Module } from '@nestjs/common';
import { Test2Controller } from './test2.controller';
import { Test2Service } from './test2.service';
import { CustomConfigModule } from '@app/common/config/config.module';
import { DatabaseModule } from 'libs/database/src/database.module';
@Module({
  imports: [CustomConfigModule, DatabaseModule],
  controllers: [Test2Controller],
  providers: [Test2Service],
})
export class Test2Module {}
