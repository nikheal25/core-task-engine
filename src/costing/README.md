# Effort-Based Costing System

## Overview

The effort-based costing system allows for calculating asset costs based on:
1. Resource allocation across locations
2. Complexity levels
3. Predetermined effort hours
4. Location-specific blend rates

This approach provides more accurate cost estimates by considering the actual effort required for each component based on its complexity and the cost of resources in different locations.

## Architecture

The system follows a clear separation of concerns:

1. **Base Calculator**: Contains the core calculation logic in `BaseCalculator`
   - Provides common algorithms for cost calculation
   - Does not retrieve or store data
   - Accepts blend rates and effort hours as parameters
   - Makes no assumptions about how data is obtained

2. **Asset-Specific Calculators**: Implement asset-specific logic
   - Each asset type has its own calculator (e.g., `AtrCalculator`)
   - Responsible for retrieving blend rates and effort hours
   - Retrieves data (either from hardcoded values or from a database)
   - Passes data to the BaseCalculator for calculation
   - Can add asset-specific costs and adjustments

## Key Components

### Complexity Levels

The system supports five complexity levels:
- `xSmall`: Very small complexity
- `Small`: Small complexity
- `Medium`: Medium complexity (default)
- `Large`: Large complexity
- `xLarge`: Very large complexity

Common complexity terms like 'low', 'medium', 'high' are automatically mapped to these standardized levels.

### Blend Rates

Each location has different hourly rates (blend rates) for each complexity level. For example:

| Location | xSmall | Small | Medium | Large | xLarge |
|----------|--------|-------|--------|-------|--------|
| Australia| $63    | $63   | $65    | $68   | $72    |
| India    | $14    | $14   | $15    | $16   | $17    |
| US       | $75    | $75   | $80    | $85   | $90    |

### Effort Hours

Each asset component has predefined effort hours for each complexity level and location. These are managed by the asset-specific calculators. For example:

**ATR - UI Component:**

| Complexity | India | Australia | US  | EU  |
|------------|-------|-----------|-----|-----|
| xSmall     | 20    | 18        | 15  | 16  |
| Small      | 25    | 23        | 20  | 22  |
| Medium     | 35    | 33        | 30  | 32  |
| Large      | 45    | 43        | 40  | 42  |
| xLarge     | 55    | 53        | 50  | 52  |

## Calculation Formula

The cost is calculated using the following formula:

```
Component Cost = Sum for each location (allocation % * blend rate * effort hours)
```

Where:
- `allocation %` is the percentage of work allocated to a location (0-100%)
- `blend rate` is the hourly rate for the location and complexity level
- `effort hours` is the predetermined effort required for the component at that complexity and location

## Core Implementation

The core calculation logic is in the `calculateEffortBasedComponentCost` method of BaseCalculator:

```typescript
protected calculateEffortBasedComponentCost(
  component: AssetComponent,
  complexity: string | ComplexityLevel = 'Medium',
  blendRates: Record<string, Record<ComplexityLevel, number>>,
  effortHours: Record<string, number>
): CostBreakdown {
  // Normalize complexity
  const systemComplexity = this.mapToSystemComplexity(complexity);
  
  let totalCost = 0;
  let totalEffortHours = 0;
  const effortBreakdown: EffortBreakdown[] = [];

  // For each location in resource allocation
  for (const resource of component.resourceModel) {
    const location = resource.location;
    const allocation = resource.allocation;
    
    // Get blend rate for location and complexity
    const blendRate = blendRates[location][systemComplexity];
    
    // Get effort hours for this location
    const locationEffortHours = effortHours[location];
    
    // Calculate cost and hours
    const hours = (locationEffortHours * allocation) / 100;
    const cost = (allocation / 100) * blendRate * locationEffortHours;
    
    totalCost += cost;
    totalEffortHours += hours;
    
    // Add detailed breakdown
    effortBreakdown.push({
      deliveryLocation: location,
      effortHours: hours,
      effortAmount: cost,
      effortHoursDescription: `${hours.toFixed(2)} hours at $${blendRate}/hour`
    });
  }

  return {
    costComponentName: component.name,
    amount: totalCost,
    description: `Effort-based cost for ${component.name}`,
    effortHours: totalEffortHours,
    effortHoursDescription: `Total effort hours: ${totalEffortHours.toFixed(1)}`,
    effortBreakdown: effortBreakdown,
    isError: false
  };
}
```

## Example Calculation

For the ATR asset with UI component, Medium complexity, and resource allocation of:
- India: 60%
- US: 40%

The calculation would be:
1. India: 60% * $15/hour * 35 hours = $315
2. US: 40% * $80/hour * 30 hours = $960
3. Total UI component cost = $315 + $960 = $1,275

## Extending the System

### Creating a New Asset Calculator

To create a calculator for a new asset type:

1. Create a new class that extends `BaseCalculator`
2. Implement the data retrieval methods (getBlendRates, getEffortHours)
3. Implement the calculation methods using the base calculator's core calculation

```typescript
@Injectable()
export class NewAssetCalculator extends BaseCalculator {
  protected assetType = 'NewAsset';
  
  protected getLocationRates(): Record<string, number> {
    // Return location rates specific to this asset
  }
  
  private getBlendRates(): Record<string, Record<ComplexityLevel, number>> {
    // Return blend rates for different locations and complexity levels
    // In production, this would fetch from MongoDB
  }
  
  private getEffortHours(
    componentName: string,
    complexity: ComplexityLevel
  ): Record<string, number> {
    // Return effort hours for this asset's components
    // In production, this would fetch from MongoDB
  }
  
  private calculateEffortBasedCosts(
    components: AssetComponent[],
    complexity: string
  ): CostBreakdown[] {
    // Get data
    const blendRates = this.getBlendRates();
    const systemComplexity = this.mapToSystemComplexity(complexity);
    
    // Calculate costs for each component
    return components.map(component => {
      const effortHours = this.getEffortHours(component.name, systemComplexity);
      return this.calculateEffortBasedComponentCost(
        component, 
        systemComplexity, 
        blendRates, 
        effortHours
      );
    });
  }
  
  // Implement calculateBuildCost and calculateRunCost
}
```

### Connecting to MongoDB

In a production environment, implement the data retrieval methods to fetch from MongoDB:

```typescript
private async getEffortHours(
  componentName: string,
  complexity: ComplexityLevel
): Promise<Record<string, number>> {
  // Example MongoDB query (replace with actual implementation)
  const componentEffortHours = await this.effortHoursRepository.findOne({
    assetType: this.assetType,
    componentName,
  });
  
  if (!componentEffortHours) {
    return { 'US': 20, 'India': 25, 'EU': 22, 'APAC': 23 }; // Default values
  }
  
  return componentEffortHours.efforts[complexity] || componentEffortHours.efforts['Medium'];
}
``` 