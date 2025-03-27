import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { HelloResponseDto } from './dto/hello.dto';
import { HealthCheckResponseDto } from './dto/health.dto';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get hello message' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns a hello message',
    type: HelloResponseDto,
  })
  getHello(): HelloResponseDto {
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
    return this.appService.getHealth();
  }
}
