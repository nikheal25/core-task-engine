# Costing System Architecture

This document provides an overview of the Core Task Engine's costing system architecture.

## System Overview

The costing system is designed to calculate build and run costs for various company assets. The system supports different asset types (like ATR, Q++, etc.) with a pluggable architecture that makes it easy to add new asset calculators.

![Costing System Architecture](./assets/costing-architecture.png)

## Components

### Core Components

1. **Costing Controller**: Exposes REST endpoints for cost calculation operations
2. **Costing Service**: Manages calculators and routes requests to the appropriate calculator
3. **Base Calculator**: Abstract class that implements common functionality for all calculators
4. **Asset-Specific Calculators**: Implement pricing logic for specific asset types

### Supporting Components

1. **Interfaces**: Define contracts for requests, responses, and calculators
2. **DTOs**: Provide validation and structure for API requests/responses
3. **Examples**: Sample payloads and responses for documentation and testing

## Request Flow

1. Client sends a cost calculation request to the `/costing` endpoint
2. The controller validates the request against the `CostRequestDto`
3. The service identifies the appropriate calculator based on the `assetType` field
4. The calculator validates the resource allocations (ensuring they total 100%)
5. The calculator performs asset-specific build and run cost calculations
6. The response is formatted and returned to the client

## Resource Model

The resource model follows a component-based approach with location-based allocations:

```json
"assetComponents": [
  {
    "name": "Frontend",
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
  },
  {
    "name": "Backend",
    "resourceModel": [
      {
        "location": "US",
        "allocation": 70
      },
      {
        "location": "APAC",
        "allocation": 30
      }
    ]
  }
]
```

Key characteristics:
- Assets are broken down into components (e.g., Frontend, Backend)
- Each component has a resource model with location allocations
- For each component, allocations must total 100%
- Different locations have different cost rates

## Common Fields

All assets share common fields that affect their pricing:

```json
"commonFields": {
  "deploymentType": "cloud",
  "region": "americas",
  "supportLevel": "standard"
}
```

## Asset-Specific Fields

Each asset type defines its own specific fields required for cost calculation:

```json
"specificFields": {
  "complexity": "medium",
  "licenseCount": 25,
  "hasCustomComponents": true
}
```

## Cost Calculation Methodology

### Build Cost

Build costs typically include:
1. **Effort-based costs**: Calculated based on resource allocations and location rates
2. **Base setup costs**: Fixed costs for initial setup
3. **Asset-specific costs**: Costs related to special features or requirements

### Run Cost

Run costs typically include:
1. **Operational costs**: Based on resource allocations and location
2. **Support costs**: Based on support level
3. **Licensing costs**: Based on licenses or users
4. **Maintenance costs**: Based on complexity or other factors

## Extending the System

The system is designed to be easily extended with new asset types. For detailed instructions on adding a new asset calculator, see the [Adding Asset Calculators](./developer-guide/adding-asset-calculators.md) guide.

## Sample Request/Response

### Request

```json
{
  "assetType": "ATR",
  "commonFields": {
    "deploymentType": "cloud",
    "region": "americas",
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
}
```

### Response

```json
{
  "assetType": "ATR",
  "buildCost": {
    "total": 41000,
    "currency": "USD",
    "breakdown": {
      "baseBuild": {
        "amount": 10000,
        "description": "Base build cost for medium complexity"
      },
      "effortBased": {
        "amount": 27000,
        "description": "Effort-based build cost for locations: US (60%), EU (40%)"
      },
      "deployment": {
        "amount": 2000,
        "description": "Deployment setup cost"
      },
      "licensing": {
        "amount": 12500,
        "description": "License setup for 25 licenses"
      },
      "customization": {
        "amount": 8000,
        "description": "Custom components development"
      }
    }
  },
  "runCost": {
    "total": 4240,
    "currency": "USD",
    "period": "monthly",
    "breakdown": {
      "license": {
        "amount": 2500,
        "description": "Monthly license fee for 25 licenses"
      },
      "support": {
        "amount": 1200,
        "description": "Support cost with standard level"
      },
      "operational": {
        "amount": 640,
        "description": "Operational cost based on locations: US, EU"
      },
      "maintenance": {
        "amount": 1000,
        "description": "Maintenance cost for medium complexity"
      }
    }
  },
  "estimationDate": "2023-04-07T05:20:00.000Z"
}
``` 