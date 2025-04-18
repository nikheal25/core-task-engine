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
    "assetComponents": [
      {
        "name": "Main Component",
        "resourceModel": [
          {
            "location": "US",
            "allocation": 60
          },
          {
            "location": "EU",
            "allocation": 40
          }
        ]
      }
    ],
    "specificFields": {
      "complexity": "medium",
      "licenseCount": 25,
      "hasCustomComponents": true
    }
  }'
```