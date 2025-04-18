import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import {
  AssetCostRequest,
  AssetCostResponse,
  CostBreakdown,
  CostCalculator,
  ResourceAllocation,
  AssetComponent,
  EffortBreakdown,
} from '../interfaces/costing.interface';

// Define valid complexity levels as string literal union type
export type ComplexityLevel = 'xSmall' | 'Small' | 'Medium' | 'Large' | 'xLarge';

/**
 * Base calculator providing common costing functionality for all asset calculators
 */
@Injectable()
export abstract class BaseCalculator implements CostCalculator {
  /**
   * The asset name that this calculator supports
   * To be overridden by subclasses
   */
  protected abstract assetName: string;

  /**
   * Location-based rates lookup
   * To be overridden by each asset-specific calculator
   */
  // protected abstract getLocationRates(): Record<string, number>; 

  /**
   * Validates if the submitted asset components are valid for this asset type
   * @param components - components to validate
   * @returns an array of validation errors, empty if all valid
   */
  protected validateComponents(components: AssetComponent[]): string[] {
    const errors: string[] = [];

    if (!components || components.length === 0) {
      errors.push('No components specified');
      return errors;
    }

    // Check for duplicate component names
    const names = components.map((c) => c.name);
    const uniqueNames = new Set(names);

    if (uniqueNames.size !== components.length) {
      errors.push('Duplicate component names found');
    }

    // Validation for each component
    for (const component of components) {
      if (!component.name) {
        errors.push('Component missing name');
      }

      if (!component.resourceModel || component.resourceModel.length === 0) {
        errors.push(`Component ${component.name || 'unnamed'} has no resource allocation`);
      } else {
        // Check that allocations sum to 100%
        const totalAllocation = component.resourceModel.reduce(
          (sum, resource) => sum + resource.allocation,
          0
        );

        if (Math.abs(totalAllocation - 100) > 0.01) {
          errors.push(
            `Component ${component.name} resource allocations should sum to 100% (currently ${totalAllocation}%)`
          );
        }
      }
    }

    return errors;
  }

  /**
   * Get the working hours per location
   * @param location - The location to get working hours for
   * @returns The working hours per location
   */
  private getWorkingHoursPerLocation(location: string): number {
    switch (location) {
      case 'Australia':
        return 8;
      case 'India':
        return 9;
      default:
        throw new Error(`Unknown location: ${location}`);
    }
  }

  /**
   * Calculate the cost of a component based on effort hours and blend rates
   * @param component - The component to calculate costs for
   * @param complexity - The complexity level (must be a valid ComplexityLevel)
   * @param blendRates - Blend rates by location and complexity
   * @param effortHours - Effort hours by location
   */
  protected calculateEffortBasedComponentCost(
    component: AssetComponent,
    complexity: ComplexityLevel,
    blendRates: Record<string, Record<ComplexityLevel, number>>,
    effortHours: Record<string, number>
  ): CostBreakdown {
    let totalAmount = 0;
    const effortBreakdown: EffortBreakdown[] = [];
    let totalEffortHours = 0;

    for (const {allocation, location} of component.resourceModel) {
      // Get blend rate for this location and complexity
      const blendRate = blendRates[location]?.[complexity];

      if (!blendRate) {
        throw new Error(`Blend rate not found for location "${location}" at complexity "${complexity}"`);
      }

      const workingHours = this.getWorkingHoursPerLocation(location);

      const effortsHrForLocation = (allocation/100) * workingHours * effortHours[location];

      const amount = Number((effortsHrForLocation * blendRate).toFixed(2)); // * important: round to 2 decimal places
      
      totalAmount += amount;
      totalEffortHours += effortsHrForLocation;

      // Add to effort breakdown
      effortBreakdown.push({
        deliveryLocation: location,
        effortHours: effortsHrForLocation,
        effortAmount: amount,
        effortHoursDescription: `${effortsHrForLocation} hours in ${location} at ${blendRate}/hour`,
      });
    }

    // Create cost breakdown
    return {
      costComponentName: component.name,
      amount: totalAmount,
      description: `Development effort for ${component.name} at ${complexity} complexity`,
      isError: false,
      errorMessage: '',
      effortHours: totalEffortHours,
      effortHoursDescription: `Total: ${totalEffortHours} hours across all locations`,
      effortBreakdown,
    };
  }

  /**
   * Calculate the total from a breakdown array
   */
  protected calculateTotalFromBreakdown(breakdown: CostBreakdown[]): number {
    return breakdown.reduce((sum, item) => sum + item.amount, 0);
  }

  /**
   * Get the asset name for this calculator
   * @returns The asset name for this calculator
   */
  public getAssetName(): string {
    return this.assetName;
  }

  /**
   * Abstract method to calculate build costs
   * To be implemented by subclasses
   */
  protected abstract calculateBuildCost(
    request: AssetCostRequest
  ): Promise<{ total: number; breakdown: CostBreakdown[] }>;

  /**
   * Abstract method to calculate run costs
   * To be implemented by subclasses
   */
  protected abstract calculateRunCost(
    request: AssetCostRequest
  ): Promise<{
    total: number;
    breakdown: CostBreakdown[];
    period: 'monthly' | 'yearly';
  }>;

  /**
   * Main method to calculate asset costs
   * Orchestrates the process and formats the response
   */
  public async calculateCosts(request: AssetCostRequest): Promise<AssetCostResponse> {
    // Validate the request
    if (request.assetName !== this.assetName) {
      throw new Error(
        `Invalid asset name: ${request.assetName}. This calculator supports: ${this.assetName}`
      );
    }

    // Validate components
    const validationErrors = this.validateComponents(request.assetComponents);
    if (validationErrors.length > 0) {
      throw new Error(`Invalid request: ${validationErrors.join(', ')}`);
    }

    // Calculate build cost
    const buildCostResult = await this.calculateBuildCost(request);

    // Calculate run cost
    const runCostResult = await this.calculateRunCost(request);

    // Return formatted response
    return {
      assetName: this.assetName,
      buildCost: {
        total: buildCostResult.total,
        currency: 'USD',
        breakdown: buildCostResult.breakdown,
      },
      runCost: {
        total: runCostResult.total,
        currency: 'USD',
        period: runCostResult.period,
        breakdown: runCostResult.breakdown,
      },
      estimationDate: new Date(),
    };
  }
}
