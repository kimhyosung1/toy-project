import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@Controller('health')
@ApiTags('Health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: '헬스체크 API' })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  @Get('ping')
  @ApiOperation({ summary: 'Ping API' })
  ping() {
    return { pong: true, time: Date.now() };
  }

  @Get('status')
  @ApiOperation({ summary: '상태 확인 API' })
  status() {
    return {
      service: 'gateway',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
