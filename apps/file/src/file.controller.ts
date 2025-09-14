import { Controller } from '@nestjs/common';
import { FileService } from './file.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CustomMessagePatterns } from '@app/proxy/common-proxy-client';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  // 헬스 체크
  @MessagePattern(CustomMessagePatterns.FileHealthCheck)
  healthCheck(): string {
    return this.fileService.healthCheck();
  }
}
