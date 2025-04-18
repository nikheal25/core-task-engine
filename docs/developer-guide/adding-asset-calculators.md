# Adding a New Asset Cost Calculator

This guide explains how to add a new asset cost calculator to the Core Task Engine. The costing module is designed to be easily extended with new asset types.

## Overview

The costing system uses a modular approach with the following components:

- **Base Calculator**: Abstract class with common functionality for all calculators
- **Asset-Specific Calculators**: Implement pricing logic for specific asset types
- **Costing Service**: Manages calculators and routes requests
- **Controller**: Exposes API endpoints for cost calculation

## Steps to Add a New Asset Calculator

Follow these steps to add support for a new asset type:

### 1. Create a New Calculator Class

Create a new file in `src/costing/calculators` named after your asset (e.g., `database-calculator.ts`):

```typescript
import { Injectable } from '@nestjs/common';
import { AssetCostRequest, CostBreakdown } from '../interfaces/costing.interface';
import { BaseCalculator } from './base-calculator';

// Define the specific fields required for this asset type
interface DatabaseSpecificFields {
  instanceSize: 'small' | 'medium' | 'large';
  storageGB: number;
  haEnabled: boolean;
  backupRetentionDays: number;
}

@Injectable()
export class DatabaseCalculator extends BaseCalculator {
  // Set the asset type identifier
  protected assetType = 'Database';
  
  // Define location-specific rates for this asset
  protected getLocationRates(): Record<string, number> {
    return {
      'US': 20000,
      'EU': 24000,
      'APAC': 18000,
      'UK': 25000,
      'LATAM': 16000,
    };
  }

  // Calculate the build cost
  protected async calculateBuildCost(
    request: AssetCostRequest,
  ): Promise<{ total: number; breakdown: CostBreakdown }> {
    const specificFields = request.specificFields as DatabaseSpecificFields;
    
    // Calculate effort-based cost using the common calculation
    const effortBasedCost = this.calculateEffortBasedBuildCost(request);
    
    // Calculate other costs specific to this asset
    const breakdown: CostBreakdown = {
      // Common effort-based cost
      effortBased: effortBasedCost,
      
      // Asset-specific costs
      baseSetup: {
        amount: 5000,
        description: 'Base database setup cost',
      },
      storage: {
        amount: specificFields.storageGB * 2,
        description: `Storage setup for ${specificFields.storageGB} GB`,
      },
      // Add more categories as needed
    };
    
    // Calculate total
    const total = this.calculateTotalFromBreakdown(breakdown);
    
    return { total, breakdown };
  }

  // Calculate the run cost
  protected async calculateRunCost(
    request: AssetCostRequest,
  ): Promise<{ total: number; breakdown: CostBreakdown; period: 'monthly' | 'yearly' }> {
    const specificFields = request.specificFields as DatabaseSpecificFields;
    const supportMultiplier = this.getSupportLevelMultiplier(request);
    
    // Calculate operational costs by component and location
    let operationalCost = 0;
    const componentDetails: string[] = [];
    
    for (const component of request.assetComponents) {
      let componentCost = 0;
      const locations: string[] = [];
      
      for (const resource of component.resourceModel) {
        // Define location-specific costs
        const locationRate = {
          'US': 500,
          'EU': 600,
          'APAC': 450,
          'UK': 650,
          'LATAM': 400,
        }[resource.location] || 500;
        
        const cost = (locationRate * resource.allocation) / 100;
        componentCost += cost;
        locations.push(resource.location);
      }
      
      operationalCost += componentCost;
      componentDetails.push(`${component.name} (${locations.join(', ')})`);
    }
    
    // Calculate breakdown
    const breakdown: CostBreakdown = {
      // Asset-specific costs
      instanceCost: {
        amount: specificFields.instanceSize === 'small' ? 100 : 
                specificFields.instanceSize === 'medium' ? 300 : 700,
        description: `Monthly instance cost for ${specificFields.instanceSize} size`,
      },
      storageCost: {
        amount: specificFields.storageGB * 0.1,
        description: `Storage cost for ${specificFields.storageGB} GB`,
      },
      haSetup: {
        amount: specificFields.haEnabled ? 200 : 0,
        description: specificFields.haEnabled ? 'High Availability setup' : 'No HA setup',
      },
      backup: {
        amount: specificFields.backupRetentionDays * 10,
        description: `Backup retention for ${specificFields.backupRetentionDays} days`,
      },
      operational: {
        amount: operationalCost,
        description: `Operational cost based on components: ${componentDetails.join(', ')}`,
      },
      support: {
        amount: 1000 * supportMultiplier,
        description: `${request.commonFields.supportLevel || 'basic'} level support`,
      },
    };
    
    // Calculate total
    const total = this.calculateTotalFromBreakdown(breakdown);
    
    return { 
      total, 
      breakdown, 
      period: 'monthly', // or 'yearly' if appropriate
    };
  }
}
```

### 2. Register the New Calculator in the Module

Update `src/costing/costing.module.ts` to include your new calculator:

```typescript
import { Module, OnModuleInit } from '@nestjs/common';
import { CostingController } from './costing.controller';
import { CostingService } from './services/costing.service';
import { AtrCalculator } from './calculators/atr-calculator';
import { QPlusPlusCalculator } from './calculators/q-plus-plus-calculator';
import { DatabaseCalculator } from './calculators/database-calculator'; // Add import

@Module({
  controllers: [CostingController],
  providers: [
    CostingService,
    AtrCalculator,
    QPlusPlusCalculator,
    DatabaseCalculator, // Add to providers
  ],
  exports: [CostingService],
})
export class CostingModule implements OnModuleInit {
  constructor(
    private readonly costingService: CostingService,
    private readonly atrCalculator: AtrCalculator,
    private readonly qPlusPlusCalculator: QPlusPlusCalculator,
    private readonly databaseCalculator: DatabaseCalculator, // Add to constructor
  ) {}

  onModuleInit() {
    // Register all calculators
    this.costingService.registerCalculator(this.atrCalculator);
    this.costingService.registerCalculator(this.qPlusPlusCalculator);
    this.costingService.registerCalculator(this.databaseCalculator); // Register the new calculator
  }
}
```

### 3. Add Example Payload and Response

Add examples to `src/costing/examples/costing-example.ts`:

```typescript
/**
 * Example payload for Database asset costing
 */
export const databaseCostingExample = {
  assetType: 'Database',
  commonFields: {
    deploymentType: 'cloud',
    region: 'us-east-1',
    supportLevel: 'standard'
  },
  assetComponents: [
    {
      name: 'Database',
      resourceModel: [
        {
          location: 'US',
          allocation: 70
        },
        {
          location: 'EU',
          allocation: 30
        }
      ],
      specificFields: {
        instanceSize: 'medium',
        storageGB: 500,
        haEnabled: true,
        backupRetentionDays: 7
      }
    }
  ]
};
```

### 4. Add Tests for the New Calculator

Create a test file in `src/costing/test/database-calculator.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseCalculator } from '../calculators/database-calculator';
import { DeploymentType, SupportLevel } from '../dto/cost-request.dto';
import { AssetCostRequest } from '../interfaces/costing.interface';

describe('DatabaseCalculator', () => {
  let calculator: DatabaseCalculator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseCalculator],
    }).compile();

    calculator = module.get<DatabaseCalculator>(DatabaseCalculator);
  });

  it('should be defined', () => {
    expect(calculator).toBeDefined();
  });

  it('should return the correct asset type', () => {
    expect(calculator.getAssetType()).toBe('Database');
  });

  it('should calculate costs for a valid request', async () => {
    const request = {
      assetType: 'Database',
      commonFields: {
        deploymentType: 'cloud',
        supportLevel: 'standard',
      },
      assetComponents: [
        {
          name: 'Database',
          resourceModel: [
            { location: 'US', allocation: 100 },
          ],
          specificFields: {
            instanceSize: 'medium',
            storageGB: 500,
            haEnabled: true,
            backupRetentionDays: 7,
          },
        }
      ]
    } as AssetCostRequest;

    const result = await calculator.calculateCosts(request);
    
    expect(result).toBeDefined();
    expect(result.assetType).toBe('Database');
    expect(result.buildCost).toBeDefined();
    expect(result.buildCost.total).toBeGreaterThan(0);
    expect(result.buildCost.breakdown.effortBased).toBeDefined();
    
    expect(result.runCost).toBeDefined();
    expect(result.runCost.total).toBeGreaterThan(0);
    expect(result.runCost.period).toBe('monthly');
    expect(result.runCost.breakdown.instanceCost).toBeDefined();
    expect(result.runCost.breakdown.storageCost).toBeDefined();
  });
});
```

### 5. Update Service Tests (Optional)

You may want to update the costing service tests to include your new calculator.

## Validation

All asset calculators use the common validation logic provided by the BaseCalculator:

1. Validates that the asset type matches
2. Ensures resource allocations add up to 100%
3. Formats responses with standardized structure

## Extending Functionality

If you need to add functionality that applies to all calculators:

1. Add the functionality to the BaseCalculator class
2. Update the CostCalculator interface if necessary
3. Implement the functionality in your asset-specific calculators

## Best Practices

- Follow the resource allocation pattern for location-based costing
- Use the effort-based cost calculation where appropriate
- Keep asset-specific calculations in the appropriate calculator
- Maintain consistent naming conventions for cost breakdown categories
- Document the meaning of each cost category
- Add tests for new calculators
- Add example payloads to help users understand the requirements 