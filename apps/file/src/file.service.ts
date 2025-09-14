import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '@app/database';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  healthCheck(): string {
    return 'File service is alive!!';
  }
}
