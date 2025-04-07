# Core Task Engine Documentation

Welcome to the Core Task Engine documentation. This documentation is designed to help both developers and business stakeholders understand the costing system.

## Documentation Structure

The documentation is divided into three main sections:

### [Developer Guide](./developer-guide/README.md)

The Developer Guide provides technical information for developers working on the project:

- [Getting Started](./developer-guide/getting-started.md)
- [Adding Asset Calculators](./developer-guide/adding-asset-calculators.md)
- [Coding Standards](./developer-guide/coding-standards.md)
- [Commit Standards](./developer-guide/commit-standards.md)
- [Environment Setup](./developer-guide/environment-setup.md)
- [Docker Guide](./developer-guide/docker-guide.md)
- [Troubleshooting](./developer-guide/troubleshooting.md)

### [Costing System](./costing-architecture.md)

Documentation related to the asset costing system:

- [Costing Architecture](./costing-architecture.md)
- [Resource Model Design](./costing-architecture.md#resource-model)
- [Cost Calculation Methodology](./costing-architecture.md#cost-calculation-methodology)

### [API Documentation](./api-documentation/README.md)

The API Documentation provides details about the APIs and business logic:

- [API Overview](./api-documentation/api-overview.md)
- [Endpoints](./api-documentation/endpoints.md)
- [Authentication](./api-documentation/authentication.md)
- [Data Models](./api-documentation/data-models.md)

## Available Asset Types

The system currently supports the following asset types:

- **ATR**: Advanced transaction routing system
- **Q++**: Query processing and analytics platform

For information on how to add support for new asset types, see the [Adding Asset Calculators](./developer-guide/adding-asset-calculators.md) guide.

## Quick Links

- [Project Repository](https://github.com/yourusername/core-task-engine)
- [Swagger UI](http://localhost:3000/api/docs) (when running locally)
- [Costing API Example](./costing-architecture.md#sample-requestresponse) 