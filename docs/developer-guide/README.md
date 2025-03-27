# Developer Guide

This section contains all the technical documentation for developers working on the Core Task Engine project.

## Contents

- [Getting Started](./getting-started.md) - How to set up and start working on the project
- [Coding Standards](./coding-standards.md) - Coding conventions and standards for this project
- [Environment Setup](./environment-setup.md) - How to set up different environments
- [Docker Guide](./docker-guide.md) - How to use Docker with this project
- [Troubleshooting](./troubleshooting.md) - Common issues and their solutions

## Quick Reference

### Project Structure

```
core-task-engine/
├── src/                  # Source code
│   ├── config/           # Configuration files
│   ├── dto/              # Data Transfer Objects
│   ├── main.ts           # Application entry point
│   └── app.module.ts     # Main application module
├── test/                 # Test files
├── docs/                 # Documentation
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
└── package.json          # Project dependencies
```

### Available Commands

```bash
# Development
pnpm run start:dev

# Production
pnpm run start:prod

# Tests
pnpm run test
pnpm run test:e2e

# Docker Development
./docker-deploy.sh development

# Docker Production
./docker-deploy.sh production
``` 