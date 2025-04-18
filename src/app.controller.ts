import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { HelloResponseDto } from './dto/hello.dto';
import { HealthCheckResponseDto } from './dto/health.dto';

@ApiTags('App')
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name, { timestamp: true });

  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get hello message' })
  @ApiResponse({
    status: 200,
    description: 'Returns a hello message',
    type: HelloResponseDto,
  })
  getHello(): HelloResponseDto {
    this.logger.log('Processing hello request');
    return { message: this.appService.getHello() };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Health check response',
    type: HealthCheckResponseDto,
  })
  healthCheck(): HealthCheckResponseDto {
    this.logger.log('Performing health check');
    return this.appService.getHealth();
  }
}
