# Data Models

This document describes the data models and DTOs (Data Transfer Objects) used in the Core Task Engine API.

## Overview

The API uses TypeScript interfaces and classes to define data models. For API requests and responses, we use DTOs decorated with validation and Swagger decorators.

## Common Models

### Hello Response DTO

Used for the root endpoint response.

```typescript
export class HelloResponseDto {
  @ApiProperty({
    description: 'The hello message',
    example: 'Hello World!',
  })
  message: string;
}
```

### Health Check Response DTO

Used for the health check endpoint response.

```typescript
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
```

### Pagination DTO

Used for paginated requests.

```typescript
export class PaginationDto {
  @ApiProperty({
    description: 'Page number',
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    default: 20,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;
}
```

### Pagination Meta DTO

Used for pagination metadata in responses.

```typescript
export class PaginationMetaDto {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  totalPages: number;
}
```

### Error Response DTO

Used for error responses.

```typescript
export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Bad Request',
  })
  message: string;

  @ApiProperty({
    description: 'Error type',
    example: 'ValidationError',
    required: false,
  })
  error?: string;
}
```

## Authentication Models

### Login Request DTO

Used for login requests.

```typescript
export class LoginRequestDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
```

### Login Response DTO

Used for login responses.

```typescript
export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600,
  })
  expiresIn: number;
}
```

### Refresh Token Request DTO

Used for refresh token requests.

```typescript
export class RefreshTokenRequestDto {
  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
```

## Creating New Models

When creating new data models for the API, follow these guidelines:

1. **Create a DTO class**: Define a class with appropriate fields for the data model
2. **Add validation decorators**: Use class-validator decorators to validate input
3. **Add Swagger decorators**: Use @ApiProperty to document the model properties
4. **Add type transformations**: Use class-transformer decorators for data type conversion
5. **Create separate DTOs for requests and responses**: Keep request and response models separate

### Example: Creating a Task Model

```typescript
// Task entity (internal data model)
export class Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// Task status enum
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Create Task Request DTO
export class CreateTaskDto {
  @ApiProperty({
    description: 'Task title',
    example: 'Implement new feature',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Task description',
    example: 'Implement the new authentication feature',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Task status',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
    required: false,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus = TaskStatus.PENDING;
}

// Task Response DTO
export class TaskDto {
  @ApiProperty({
    description: 'Task ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Task title',
    example: 'Implement new feature',
  })
  title: string;

  @ApiProperty({
    description: 'Task description',
    example: 'Implement the new authentication feature',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Task status',
    enum: TaskStatus,
    example: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @ApiProperty({
    description: 'Task creation date and time',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Task last update date and time',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: string;
}
``` 