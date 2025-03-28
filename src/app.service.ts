import { Injectable, Logger } from '@nestjs/common';
import { HealthCheckResponseDto } from './dto/health.dto';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name, { timestamp: true });

  getHello(): string {
    this.logger.log('Generating hello message');
    return 'Hello World!';
  }

  getHealth(): HealthCheckResponseDto {
    this.logger.log('Getting system health status');
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
