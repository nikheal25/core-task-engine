# Developer Guide

This section contains all the technical documentation for developers working on the Core Task Engine project.

## Contents

- [Getting Started](./getting-started.md) - How to set up and start working on the project
- [Adding Asset Calculators](./adding-asset-calculators.md) - How to add new asset types to the costing system
- [Coding Standards](./coding-standards.md) - Coding conventions and standards for this project
- [Commit Standards](./commit-standards.md) - Commit message conventions and validation
- [Environment Setup](./environment-setup.md) - How to set up different environments
- [Docker Guide](./docker-guide.md) - How to use Docker with this project
- [Troubleshooting](./troubleshooting.md) - Common issues and their solutions

## Quick Reference

### Project Structure

```
core-task-engine/
├── src/                     # Source code
│   ├── costing/             # Costing module
│   │   ├── calculators/     # Asset-specific calculators
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── interfaces/      # Interfaces and types
│   │   ├── services/        # Services
│   │   ├── test/            # Unit tests
│   │   ├── examples/        # Example payloads
│   │   ├── costing.module.ts  # Costing module definition
│   │   └── costing.controller.ts # Costing API controller
│   ├── config/              # Configuration files
│   ├── main.ts              # Application entry point
│   └── app.module.ts        # Main application module
├── test/                    # E2E test files
├── docs/                    # Documentation
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Docker Compose configuration
└── package.json             # Project dependencies
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

## Costing System

The Core Task Engine currently implements a costing system for calculating build and run costs for various company assets. Key components include:

### Asset Calculators

Asset calculators implement the cost calculation logic for specific asset types:

- [AtrCalculator](../../src/costing/calculators/atr-calculator.ts) - Calculator for ATR assets
- [QPlusPlusCalculator](../../src/costing/calculators/q-plus-plus-calculator.ts) - Calculator for Q++ assets

See [Adding Asset Calculators](./adding-asset-calculators.md) for instructions on implementing new calculators.

### API Endpoints

The costing API exposes endpoints for calculating costs and retrieving available asset types:

- `POST /costing` - Calculate costs for a specific asset
- `GET /costing/asset-types` - Get a list of available asset types

### Testing

Every component of the costing system should have corresponding tests:

- Calculator tests
- Service tests
- Controller tests
- End-to-end tests

For examples, see the existing tests in the [test directory](../../src/costing/test/). 