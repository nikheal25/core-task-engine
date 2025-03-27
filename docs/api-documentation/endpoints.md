# API Endpoints

This document provides detailed information about the available API endpoints in the Core Task Engine.

## Root Endpoint

### Get Hello Message

```
GET /
```

Returns a hello message to verify that the API is working.

**Response**

```json
{
  "message": "Hello World!"
}
```

**Status Codes**

- `200 OK`: Success

## Health Check

### Get Health Status

```
GET /health
```

Returns the current health status of the API.

**Response**

```json
{
  "status": "ok",
  "uptime": 12345,
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

**Status Codes**

- `200 OK`: Success

## Protected Resources

### Get Protected Resource

```
GET /protected
```

Example of a protected endpoint that requires authentication.

**Authentication Required**: Yes (Bearer Token)

**Response**

```json
{
  "message": "This is a protected resource"
}
```

**Status Codes**

- `200 OK`: Success
- `401 Unauthorized`: Missing or invalid authentication token

## Adding New Endpoints

When adding new endpoints to the API, follow these steps:

1. Create a new controller in the appropriate module or create a new module if needed
2. Use Swagger decorators to document the endpoint
3. Implement proper validation using DTOs
4. Follow the standard response format
5. Add tests for the new endpoint
6. Update this documentation

### Example: Adding a New Endpoint

Here's an example of how to add a new endpoint to retrieve tasks:

```typescript
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TaskService } from './task.service';
import { TaskDto } from './dto/task.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns a list of tasks',
    type: [TaskDto],
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token',
  })
  async getTasks(@Query() paginationDto: PaginationDto): Promise<TaskDto[]> {
    return this.taskService.findAll(paginationDto);
  }
}
```

Then update this documentation with the new endpoint details:

```markdown
## Tasks

### Get All Tasks

```
GET /tasks
```

Returns a paginated list of tasks.

**Authentication Required**: Yes (Bearer Token)

**Query Parameters**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response**

```json
{
  "data": [
    {
      "id": "123",
      "title": "Task 1",
      "description": "Description of task 1",
      "status": "pending",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "id": "124",
      "title": "Task 2",
      "description": "Description of task 2",
      "status": "completed",
      "createdAt": "2023-01-02T00:00:00.000Z",
      "updatedAt": "2023-01-02T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

**Status Codes**

- `200 OK`: Success
- `401 Unauthorized`: Missing or invalid authentication token
``` 