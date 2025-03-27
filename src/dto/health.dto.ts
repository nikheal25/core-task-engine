import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckResponseDto {
  @ApiProperty({
    description: 'The status of the application',
    example: 'ok',
  })
  status: string;

  @ApiProperty({
    description: 'The uptime of the application in seconds',
    example: 12345,
  })
  uptime: number;

  @ApiProperty({
    description: 'The timestamp of when the health check was performed',
    example: '2023-01-01T00:00:00.000Z',
  })
  timestamp: string;
} 