# Docker Guide

This guide explains how to use Docker with the Core Task Engine project.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine
- [Docker Compose](https://docs.docker.com/compose/install/) installed on your machine

## Docker Setup Overview

The project includes Docker configuration for various environments:

- `Dockerfile` - Multi-stage build definition for development, staging, and production
- `docker-compose.yml` - Base Docker Compose configuration
- `docker-compose.override.yml` - Development-specific overrides
- `docker-compose.staging.yml` - Staging-specific overrides
- `docker-compose.prod.yml` - Production-specific overrides
- `docker-deploy.sh` - Helper script for deploying with Docker

## Using the Deployment Script

The simplest way to use Docker with this project is through the deployment script:

```bash
# Run in development mode
./docker-deploy.sh development

# Run in staging mode
./docker-deploy.sh staging

# Run in production mode
./docker-deploy.sh production
```

## Manual Docker Commands

If you prefer to run Docker commands manually:

### Development Environment

```bash
# Start development environment
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop containers
docker-compose down

# Rebuild containers
docker-compose up --build
```

### Staging Environment

```bash
# Start staging environment
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d

# Stop staging environment
docker-compose -f docker-compose.yml -f docker-compose.staging.yml down
```

### Production Environment

```bash
# Start production environment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Stop production environment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
```

## Building Images Manually

```bash
# Build development image
docker build -t core-task-engine:dev --target development .

# Build staging image
docker build -t core-task-engine:staging --target staging .

# Build production image
docker build -t core-task-engine:prod --target production .
```

## Working with the Containerized Application

Once your containers are running:

- The API will be available at `http://localhost:3000`
- The Swagger UI will be available at `http://localhost:3000/api/docs`

### Viewing Logs

```bash
# View logs
docker-compose logs

# View logs for a specific service
docker-compose logs api

# Follow logs
docker-compose logs -f
```

### Executing Commands Inside the Container

```bash
# Get a shell inside the container
docker-compose exec api sh

# Run tests inside the container
docker-compose exec api pnpm run test

# Run a specific command
docker-compose exec api <command>
```

## Docker Configuration Files

### Dockerfile Structure

Our `Dockerfile` uses a multi-stage build approach:

1. Development stage: Includes all dependencies, source code, and builds the application
2. Staging stage: Uses the build from the development stage with only production dependencies
3. Production stage: Similar to staging, but with production-specific optimizations

### Environment Variables

Docker containers use the environment variables defined in:

- `.env.development` for development
- `.env.staging` for staging
- `.env.production` for production

## Troubleshooting Docker Issues

### Container Won't Start

1. Check if the port is already in use:
   ```bash
   lsof -i :3000
   ```

2. Check Docker logs:
   ```bash
   docker-compose logs
   ```

### Slow Performance

On macOS and Windows, Docker uses a VM which can affect performance. Consider:

- Increasing Docker resources in Docker Desktop
- Using volume mounting selectively
- Using a bind mount for development 