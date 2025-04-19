import { Injectable, Logger } from '@nestjs/common';
// import { BadRequestException } from '@nestjs/common'; // Unused import
import {
  AssetCostRequest,
  AssetCostResponse,
  CostBreakdown,
  CostCalculator,
  // ResourceAllocation, // Unused import
  AssetComponent,
  EffortBreakdown,
} from '../interfaces/costing.interface';

// Define valid complexity levels as string literal union type
export type ComplexityLevel =
  | 'xSmall'
  | 'Small'
  | 'Medium'
  | 'Large'
  | 'xLarge';

/**
 * Base calculator providing common costing functionality for all asset calculators
 */
@Injectable()
export abstract class BaseCalculator implements CostCalculator {
  // Logger to be initialized by subclasses
  protected abstract readonly logger: Logger;

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
    this.logger.debug('Validating asset components...');
    const errors: string[] = [];

    if (!components || components.length === 0) {
      errors.push('No components specified');
      this.logger.warn('Validation failed: No components specified.');
      return errors;
    }

    // Check for duplicate component names
    const names = components.map((c) => c.name);
    const uniqueNames = new Set(names);

    if (uniqueNames.size !== components.length) {
      const duplicates = names.filter(
        (item, index) => names.indexOf(item) !== index,
      );
      errors.push(`Duplicate component names found: ${duplicates.join(', ')}`);
      this.logger.warn(
        `Validation failed: Duplicate component names found: ${duplicates.join(', ')}`,
      );
    }

    // Validation for each component
    for (const component of components) {
      if (!component.name) {
        errors.push('Component missing name');
        this.logger.warn('Validation failed: Component missing name.');
      }

      if (!component.resourceModel || component.resourceModel.length === 0) {
        const compName = component.name || 'unnamed';
        errors.push(`Component ${compName} has no resource allocation`);
        this.logger.warn(
          `Validation failed: Component ${compName} has no resource allocation.`,
        );
      } else {
        // Check that allocations sum to 100%
        const totalAllocation = component.resourceModel.reduce(
          (sum, resource) => sum + resource.allocation,
          0,
        );

        if (Math.abs(totalAllocation - 100) > 0.01) {
          errors.push(
            `Component ${component.name} resource allocations should sum to 100% (currently ${totalAllocation}%)`,
          );
          this.logger.warn(
            `Validation failed: Component ${component.name} allocation sum is ${totalAllocation}%.`,
          );
        }
      }
    }
    if (errors.length === 0) {
      this.logger.debug('Component validation successful.');
    }
    return errors;
  }

  /**
   * Get the working hours per location
   * @param location - The location to get working hours for
   * @returns The working hours per location
   */
  private getWorkingHoursPerLocation(location: string): number {
    // No logging needed here unless debugging specific locations
    switch (location) {
      case 'Australia':
        return 8;
      case 'India':
        return 9;
      default:
        this.logger.error(`Unknown location encountered: ${location}`);
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
    effortHours: Record<string, number>,
  ): CostBreakdown {
    this.logger.debug(
      `Calculating effort-based cost for component: ${component.name}, Complexity: ${complexity}`,
    );
    let totalAmount = 0;
    const effortBreakdown: EffortBreakdown[] = [];
    let totalEffortHours = 0;

    for (const { allocation, location } of component.resourceModel) {
      this.logger.debug(
        `Processing allocation for location: ${location} (${allocation}%)`,
      );
      // Get blend rate for this location and complexity
      const blendRate = blendRates[location]?.[complexity];

      if (!blendRate) {
        const errorMsg = `Blend rate not found for location "${location}" at complexity "${complexity}"`;
        this.logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      const workingHours = this.getWorkingHoursPerLocation(location);

      const effortsHrForLocation =
        (allocation / 100) * workingHours * effortHours[location];

      const amount = Number((effortsHrForLocation * blendRate).toFixed(2));

      totalAmount += amount;
      totalEffortHours += effortsHrForLocation;

      this.logger.debug(
        `  Location: ${location}, Hours: ${effortsHrForLocation.toFixed(2)}, Rate: ${blendRate}, Amount: ${amount}`,
      );
      // Add to effort breakdown
      effortBreakdown.push({
        deliveryLocation: location,
        effortHours: effortsHrForLocation,
        effortAmount: amount,
        effortHoursDescription: `${effortsHrForLocation.toFixed(2)} hours in ${location} at ${blendRate}/hour`,
      });
    }

    this.logger.debug(
      `Finished effort calculation for ${component.name}. Total Hours: ${totalEffortHours.toFixed(2)}, Total Amount: ${totalAmount.toFixed(2)}`,
    );
    // Create cost breakdown
    return {
      costComponentName: component.name,
      amount: totalAmount,
      description: `Development effort for ${component.name} at ${complexity} complexity`,
      isError: false,
      errorMessage: '',
      effortHours: totalEffortHours,
      effortHoursDescription: `Total: ${totalEffortHours.toFixed(2)} hours across all locations`,
      effortBreakdown,
    };
  }

  /**
   * Calculate the total from a breakdown array
   */
  protected calculateTotalFromBreakdown(breakdown: CostBreakdown[]): number {
    // Simple function, logging might be excessive unless debugging totals
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
    request: AssetCostRequest,
  ): Promise<{ total: number; breakdown: CostBreakdown[] }>;

  /**
   * Abstract method to calculate run costs
   * To be implemented by subclasses
   */
  protected abstract calculateRunCost(request: AssetCostRequest): Promise<{
    total: number;
    breakdown: CostBreakdown[];
    period: 'monthly' | 'yearly';
  }>;

  /**
   * Main method to calculate asset costs
   * Orchestrates the process and formats the response
   */
  public async calculateCosts(
    request: AssetCostRequest,
  ): Promise<AssetCostResponse> {
    this.logger.log(`Calculating costs for asset: ${request.assetName}...`);

    // Validate the request
    if (request.assetName !== this.assetName) {
      const errorMsg = `Invalid asset name: ${request.assetName}. This calculator supports: ${this.assetName}`;
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Validate components
    const validationErrors = this.validateComponents(request.assetComponents);
    if (validationErrors.length > 0) {
      const errorMsg = `Invalid request components: ${validationErrors.join(', ')}`;
      this.logger.error(errorMsg);
      throw new Error(errorMsg); // Consider a BadRequestException here
    }

    this.logger.debug('Calculating build cost...');
    const buildCostResult = await this.calculateBuildCost(request);
    this.logger.debug(`Build cost calculated: ${buildCostResult.total}`);

    this.logger.debug('Calculating run cost...');
    const runCostResult = await this.calculateRunCost(request);
    this.logger.debug(
      `Run cost calculated: ${runCostResult.total} (${runCostResult.period})`,
    );

    const response: AssetCostResponse = {
      assetName: this.assetName,
      buildCost: {
        total: buildCostResult.total,
        currency: 'USD', // Consider making currency dynamic or configurable
        breakdown: buildCostResult.breakdown,
      },
      runCost: {
        total: runCostResult.total,
        currency: 'USD', // Consider making currency dynamic or configurable
        period: runCostResult.period,
        breakdown: runCostResult.breakdown,
      },
      estimationDate: new Date(),
    };
    this.logger.log(
      `Cost calculation finished for asset: ${this.assetName}. Build: ${response.buildCost.total}, Run: ${response.runCost.total}`,
    );
    return response;
  }
}
