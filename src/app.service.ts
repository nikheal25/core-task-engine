import { Injectable } from '@nestjs/common';
import { HealthCheckResponseDto } from './dto/health.dto';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getHealth(): HealthCheckResponseDto {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
