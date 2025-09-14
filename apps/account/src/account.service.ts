import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '@app/database';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  healthCheck(): string {
    return 'Account service is alive!!';
  }
}
