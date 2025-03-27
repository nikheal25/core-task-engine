# API Documentation

This section contains the documentation for the Core Task Engine APIs and business logic.

## Contents

- [API Overview](./api-overview.md) - Overview of the API design and principles
- [Endpoints](./endpoints.md) - Detailed documentation of all API endpoints
- [Authentication](./authentication.md) - Authentication mechanisms and security
- [Data Models](./data-models.md) - Data models and DTOs used in the APIs

## Quick Reference

### Base URL

- Development: `http://localhost:3000`
- Staging: `https://staging-api.example.com`
- Production: `https://api.example.com`

### Authentication

Most endpoints require authentication using a Bearer token:

```
Authorization: Bearer <your_token>
```

### Current API Version

The current API version is `v1`.

### Interactive Documentation

When the application is running, you can access the interactive Swagger documentation at:

- Development: `http://localhost:3000/api/docs`
- Staging: `https://staging-api.example.com/api/docs`

Note: Swagger UI is disabled in production for security reasons. 