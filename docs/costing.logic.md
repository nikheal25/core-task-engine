# Asset Costing System Implementation

This document provides an overview of how the asset costing system is implemented in the Core Task Engine.

> **Note:** This document is intended for developers who want to understand the implementation details. For an architectural overview, see [Costing Architecture](./costing-architecture.md). For instructions on adding new asset types, see [Adding Asset Calculators](./developer-guide/adding-asset-calculators.md).

## Implementation Overview

The costing system follows a modular design pattern with the following components:

### Base Calculator

The `BaseCalculator` abstract class provides common functionality:

```typescript
export abstract class BaseCalculator implements CostCalculator {
  protected abstract assetType: string;
  protected abstract calculateBuildCost(request: AssetCostRequest): Promise<{
    total: number;
    breakdown: CostBreakdown;
  }>;
  protected abstract calculateRunCost(request: AssetCostRequest): Promise<{
    total: number;
    breakdown: CostBreakdown;
    period: 'monthly' | 'yearly';
  }>;
  protected abstract getLocationRates(): Record<string, number>;
  
  // ... implementation of common functionality
}
```

Key features:
- Validation of resource allocations (must total 100%)
- Calculation of effort-based build costs
- Utility methods for calculating totals from breakdowns
- Common multipliers for deployment type and support level

### Asset-Specific Calculators

Each asset type has its own calculator that extends the `BaseCalculator`:

```typescript
@Injectable()
export class AtrCalculator extends BaseCalculator {
  protected assetType = 'ATR';
  
  protected getLocationRates(): Record<string, number> {
    return {
      'US': 25000,
      'EU': 30000,
      'APAC': 22000,
      'UK': 32000,
      'LATAM': 20000,
    };
  }
  
  // ... implementation of asset-specific calculations
}
```

Asset-specific calculators implement:
- Location-specific rates
- Build cost calculations
- Run cost calculations
- Asset-specific logic for different features and options

### Costing Service

The service manages calculator registration and routing:

```typescript
@Injectable()
export class CostingService {
  private calculators: Map<string, CostCalculator> = new Map();

  registerCalculator(calculator: CostCalculator): void {
    this.calculators.set(calculator.getAssetType(), calculator);
  }

  getCalculator(assetType: string): CostCalculator {
    const calculator = this.calculators.get(assetType);
    if (!calculator) {
      throw new NotFoundException(`No calculator found for asset type: ${assetType}`);
    }
    return calculator;
  }

  // ... other service methods
}
```

### Request/Response Flow

1. The client submits a cost calculation request
2. The controller validates the request data
3. The service finds the appropriate calculator
4. The calculator performs the calculations
5. The response is formatted and returned

## Location-Based Resource Model

The resource model follows a location-based approach:

```typescript
export interface ResourceAllocation {
  location: string;
  allocation: number;
}
```

This allows for:
- Different rates by location
- Allocation of resources across multiple locations
- Calculation of effort-based costs

## Cost Breakdown

Both build and run costs include detailed breakdowns:

```typescript
export interface CostBreakdown {
  [category: string]: {
    amount: number;
    description: string;
  };
}
```

This provides:
- Transparency in cost calculation
- Itemized costs for different aspects
- Descriptive information about each cost category

## Common Calculations

### Effort-Based Build Cost

One of the key shared calculations is the effort-based build cost, which is calculated based on:
- Resource allocations across locations
- Location-specific rates
- Total allocation must equal 100%

```typescript
protected calculateEffortBasedBuildCost(request: AssetCostRequest): {
  amount: number;
  description: string;
} {
  const locationRates = this.getLocationRates();
  let totalCost = 0;
  const locationDetails: string[] = [];

  for (const resource of request.resourceModel) {
    const rate = locationRates[resource.location] || this.getDefaultRate();
    const cost = (rate * resource.allocation) / 100;
    totalCost += cost;
    locationDetails.push(`${resource.location} (${resource.allocation}%)`);
  }

  return {
    amount: totalCost,
    description: `Effort-based build cost for locations: ${locationDetails.join(', ')}`,
  };
}
```

### Multipliers

Common multipliers are implemented for deployment types and support levels:

```typescript
protected getDeploymentTypeMultiplier(request: AssetCostRequest): number {
  const { deploymentType } = request.commonFields;
  switch (deploymentType) {
    case 'onPremise': return 1.2;
    case 'cloud': return 1.0;
    case 'hybrid': return 1.3;
    case 'managed': return 1.5;
    default: return 1.0;
  }
}
```

## Testing Strategy

The system includes comprehensive tests:
- Unit tests for each calculator
- Service tests for routing logic
- Controller tests for API endpoints
- Custom utilities to test protected methods

## Extending the System

For instructions on adding new asset types, see [Adding Asset Calculators](./developer-guide/adding-asset-calculators.md).
