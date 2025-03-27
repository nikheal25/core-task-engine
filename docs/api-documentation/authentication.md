# Authentication

This document describes the authentication mechanisms used in the Core Task Engine API.

## Overview

The Core Task Engine API uses JWT (JSON Web Token) based authentication. Protected endpoints require a valid JWT token to be included in the Authorization header.

## Authentication Flow

1. **Login**: The client sends credentials (username/password) to the authentication endpoint
2. **Token Generation**: The server validates the credentials and returns a JWT token
3. **Token Usage**: The client includes the token in the Authorization header for subsequent requests
4. **Token Validation**: The server validates the token for each protected request
5. **Token Refresh**: When the token expires, the client can use a refresh token to get a new access token

## Endpoints

### Login

```
POST /auth/login
```

Authenticates a user and returns access and refresh tokens.

**Request Body**

```json
{
  "username": "user@example.com",
  "password": "password123"
}
```

**Response**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

**Status Codes**

- `200 OK`: Success
- `401 Unauthorized`: Invalid credentials

### Refresh Token

```
POST /auth/refresh
```

Issues a new access token using a refresh token.

**Request Body**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

**Status Codes**

- `200 OK`: Success
- `401 Unauthorized`: Invalid or expired refresh token

## Token Format

The JWT token contains the following claims:

- `sub`: The subject (user ID)
- `username`: The username of the authenticated user
- `roles`: The roles assigned to the user
- `iat`: The time the token was issued
- `exp`: The time the token expires

Example JWT payload:

```json
{
  "sub": "1234567890",
  "username": "user@example.com",
  "roles": ["user"],
  "iat": 1516239022,
  "exp": 1516242622
}
```

## Using Authentication in Requests

To access protected endpoints, include the access token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Example with curl:

```bash
curl -X GET \
  http://localhost:3000/protected \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

## Token Expiration and Refresh

Access tokens have a short lifespan (typically 1 hour) for security reasons. When an access token expires, use the refresh token to obtain a new access token without requiring the user to log in again.

## Error Handling

Authentication errors return a 401 Unauthorized status code with an error message:

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid token"
}
```

## Security Considerations

- All authentication requests should be made over HTTPS
- Refresh tokens should be stored securely (HttpOnly cookies are recommended)
- Access tokens should be stored in memory when possible
- Implement token revocation for logout functionality

## Testing Authentication

For testing purposes, you can use the Swagger UI to authenticate:

1. Navigate to the Swagger UI at `/api/docs`
2. Click the "Authorize" button
3. Enter your access token
4. Click "Authorize" to apply the token to all requests

## Implementing Authentication in Client Applications

### Example: Using Authentication in a React Application

```javascript
// Login function
async function login(username, password) {
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  const data = await response.json();
  
  // Store tokens
  localStorage.setItem('refreshToken', data.refreshToken);
  sessionStorage.setItem('accessToken', data.accessToken);
  
  return data;
}

// Making authenticated requests
async function fetchProtectedResource() {
  const token = sessionStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:3000/protected', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (response.status === 401) {
    // Token expired, try to refresh
    await refreshToken();
    return fetchProtectedResource();
  }
  
  return response.json();
}

// Refreshing the token
async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('http://localhost:3000/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });
  
  if (!response.ok) {
    // Refresh failed, redirect to login
    throw new Error('Session expired');
  }
  
  const data = await response.json();
  sessionStorage.setItem('accessToken', data.accessToken);
  
  return data;
}
``` 