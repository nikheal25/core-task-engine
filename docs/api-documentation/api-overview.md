# API Overview

This document provides an overview of the Core Task Engine API.

## API Design Principles

The Core Task Engine API follows these design principles:

1. **RESTful Architecture**: The API follows REST principles with resources, HTTP methods, and appropriate status codes.

2. **JSON Format**: All requests and responses use JSON format.

3. **Versioning**: API versioning is handled through the URL path (e.g., `/api/v1/resource`).

4. **Authentication**: Secured endpoints use JWT bearer tokens for authentication.

5. **Consistent Error Handling**: All errors follow a standard format.

6. **Documentation**: All endpoints are documented with Swagger.

7. **Validation**: Input validation is performed using built-in NestJS validation.

## Base URL

The base URL for the API depends on the environment:

- Local/Development: `http://localhost:3000`
- Staging: `https://staging-api.example.com`
- Production: `https://api.example.com`

## Request Format

API requests should be formatted as follows:

```
Method: HTTP_METHOD
URL: /path/to/resource
Headers:
  Content-Type: application/json
  Authorization: Bearer <JWT_TOKEN> (if authentication is required)
Body: {
  "property1": "value1",
  "property2": "value2"
}
```

## Response Format

Successful responses follow this format:

```json
{
  "data": {
    // Response data
  },
  "meta": {
    // Metadata (pagination, etc.)
  }
}
```

Error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Error type"
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - The request was successful |
| 201 | Created - The resource was successfully created |
| 204 | No Content - The request was successful but no content is returned |
| 400 | Bad Request - The request was invalid |
| 401 | Unauthorized - Authentication failed |
| 403 | Forbidden - The client doesn't have permission |
| 404 | Not Found - The resource was not found |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error - Something went wrong on the server |

## Authentication

Most API endpoints require authentication using JWT bearer tokens:

```
Authorization: Bearer <your_token>
```

## Rate Limiting

The API implements rate limiting to prevent abuse. The current limits are:

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Pagination

For endpoints that return multiple resources, pagination is supported using the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 20, max: 100)

Example:
```
GET /api/v1/tasks?page=2&limit=50
```

## Filtering and Sorting

For endpoints that return multiple resources, filtering and sorting are supported:

- Filtering: `filter[field]=value`
- Sorting: `sort=field` (ascending) or `sort=-field` (descending)

Example:
```
GET /api/v1/tasks?filter[status]=completed&sort=-createdAt
```

## API Health Check

The API provides a health check endpoint to verify that the service is running:

```
GET /health
```

Response:
```json
{
  "status": "ok",
  "uptime": 12345,
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## Interactive Documentation

Interactive API documentation is available through Swagger UI:

- Local/Development: `http://localhost:3000/api/docs`
- Staging: `https://staging-api.example.com/api/docs` 