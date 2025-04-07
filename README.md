# Core Task Engine

## Overview

Core Task Engine is a microservices-based application built with NestJS that provides costing calculations for various company assets. It allows clients to obtain detailed build and run cost breakdowns for different asset types.

## Features

- **Asset Costing**: Calculate detailed cost breakdowns for various company assets
- **Multiple Asset Support**: Calculate costs for ATR, Q++, and other asset types
- **Location-Based Costing**: Support for different cost structures based on geographical locations
- **Extensible Architecture**: Easily add new asset types without changing the core system
- **REST API**: Simple API endpoints for cost calculation
- **Validation**: Automatic validation of request payloads
- **Testing**: Comprehensive test coverage

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm/pnpm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourcompany/core-task-engine.git
cd core-task-engine

# Install dependencies
pnpm install
```

### Running the Application

```bash
# Development mode
pnpm run start:dev

# Production mode
pnpm run start:prod
```

The application will be available at `http://localhost:3000` (or the port defined in your environment variables).

### API Documentation

Swagger UI is available when running the application:

```
http://localhost:3000/api/docs
```

## Costing API

### Calculating Asset Costs

To calculate costs for an asset, send a POST request to the `/costing` endpoint:

```bash
curl -X POST http://localhost:3000/costing \
  -H "Content-Type: application/json" \
  -d '{
    "assetType": "ATR",
    "commonFields": {
      "deploymentType": "cloud",
      "supportLevel": "standard"
    },
    "resourceModel": [
      {
        "location": "US",
        "allocation": 60
      },
      {
        "location": "EU",
        "allocation": 40
      }
    ],
    "specificFields": {
      "complexity": "medium",
      "licenseCount": 25,
      "hasCustomComponents": true
    }
  }'
```

### Getting Available Asset Types

To get a list of all available asset types, send a GET request to the `/costing/asset-types` endpoint:

```bash
curl -X GET http://localhost:3000/costing/asset-types
```

## Documentation

Comprehensive documentation is available in the `docs` directory:

### Developer Guides

- [Adding New Asset Calculators](./docs/developer-guide/adding-asset-calculators.md) - How to add new asset types
- [Coding Standards](./docs/developer-guide/coding-standards.md) - Code style and formatting guidelines
- [Environment Setup](./docs/developer-guide/environment-setup.md) - Setting up your development environment
- [Getting Started](./docs/developer-guide/getting-started.md) - First steps for development

### Architecture and Design

- [Costing Architecture](./docs/costing-architecture.md) - Overview of the costing system design

## Testing

```bash
# Run unit tests
pnpm run test

# Run tests with coverage
pnpm run test:cov

# Run end-to-end tests
pnpm run test:e2e
```

## Docker Support

This project includes Docker support for easy deployment.

```bash
# Build and run with Docker
docker-compose up

# Run in production mode
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

For more details, see the [Docker Guide](./docs/developer-guide/docker-guide.md).

## Project Structure

```
/
├── src/
│   ├── costing/                  # Costing module
│   │   ├── calculators/          # Asset-specific calculators
│   │   ├── dto/                  # Data Transfer Objects
│   │   ├── interfaces/           # Interfaces and types
│   │   ├── services/             # Services
│   │   ├── test/                 # Tests
│   │   ├── costing.controller.ts # Controller
│   │   └── costing.module.ts     # Module definition
│   └── app.module.ts             # Main application module
├── docs/                         # Documentation
│   ├── developer-guide/          # Developer guides
│   └── assets/                   # Documentation assets
└── test/                         # End-to-end tests
```

## Commit Standards

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) format. For more details, see the [Commit Standards](./docs/developer-guide/commit-standards.md) document.

## License

This project is proprietary software and is not publicly licensed.
