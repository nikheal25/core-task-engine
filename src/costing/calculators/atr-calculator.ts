import { Injectable, Logger } from '@nestjs/common';
import {
  AssetCostRequest,
  CostBreakdown,
  AssetComponent,
} from '../interfaces/costing.interface';
import { BaseCalculator, ComplexityLevel } from './base-calculator';

@Injectable()
export class AtrCalculator extends BaseCalculator {
  // Initialize logger for this specific calculator
  protected readonly logger = new Logger(AtrCalculator.name);

  protected assetName = 'ATR';

  /**
   * Get blended hourly rates for ATR by complexity and location
   */
  protected getBlendRates(): Record<string, Record<ComplexityLevel, number>> {
    return {
      India: {
        xSmall: 14,
        Small: 14,
        Medium: 15,
        Large: 16,
        xLarge: 17,
      },
      Australia: {
        xSmall: 48,
        Small: 49,
        Medium: 52,
        Large: 53,
        xLarge: 55,
      },
    };
  }

  /**
   * Get effort hours for ATR components by location and complexity
   * @param component - The component name to get hours for
   * @param complexity - The complexity level (must be a valid ComplexityLevel)
   * @throws Error if hours are not found for the component and complexity
   */
  protected getEffortHours(
    component: string,
    complexity: ComplexityLevel,
  ): Record<string, number> {
    this.logger.debug(
      `Getting effort hours for component: ${component}, complexity: ${complexity}`,
    );
    // Define effort hours by component, complexity, and location
    // These are example values and would typically come from a database
    const effortHoursByComponent: Record<
      string,
      Record<ComplexityLevel, Record<string, number>>
    > = {
      ignition: {
        xSmall: { Australia: 19.39, India: 21.14 },
        Small: { Australia: 21.34, India: 23.1 },
        Medium: { Australia: 31.25, India: 32.8 },
        Large: { Australia: 41.2, India: 42.6 },
        xLarge: { Australia: 50.91, India: 52.47 },
      },
      'automation configuration': {
        xSmall: { Australia: 21.35, India: 10 },
        Small: { Australia: 20.92, India: 10 },
        Medium: { Australia: 17.76, India: 10 },
        Large: { Australia: 15.52, India: 10 },
        xLarge: { Australia: 13.11, India: 10 },
      },
    };

    // Get hours for this component
    const componentHours = effortHoursByComponent[component];
    if (!componentHours) {
      const errorMsg = `Effort hours not found for component: ${component}`;
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Get hours for this complexity
    const complexityHours = componentHours[complexity];
    if (!complexityHours) {
      const errorMsg = `Effort hours not found for component: ${component}, complexity: ${complexity}`;
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    this.logger.debug(
      `Found effort hours for ${component} (${complexity}): ${JSON.stringify(complexityHours)}`,
    );
    return complexityHours;
  }

  /**
   * Calculate costs for ATR component based on effort hours
   * @param component - The asset component to calculate costs for
   * @param complexity - The complexity level (must be a valid ComplexityLevel)
   */
  protected calculateEffortBasedCosts(
    component: AssetComponent,
    complexity: ComplexityLevel,
  ): CostBreakdown {
    this.logger.debug(
      `Calculating effort-based costs for ATR component: ${component.name}`,
    );
    try {
      const blendRates = this.getBlendRates();
      const effortHours = this.getEffortHours(component.name, complexity);

      return this.calculateEffortBasedComponentCost(
        component,
        complexity,
        blendRates,
        effortHours,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error in calculateEffortBasedCosts for ${component.name}: ${message}`,
        error instanceof Error ? error.stack : undefined,
      );
      // Create error breakdown item
      return {
        costComponentName: component.name,
        amount: 0,
        description: `Error calculating costs for ${component.name}`,
        isError: true,
        errorMessage: message,
      };
    }
  }

  /**
   * Calculate build cost for ATR
   */
  protected calculateBuildCost(
    request: AssetCostRequest,
  ): Promise<{ total: number; breakdown: CostBreakdown[] }> {
    this.logger.log(
      `Calculating ATR build cost for asset: ${request.assetName}`,
    );
    const components = request.assetComponents;
    const { complexity } = request;

    // Validate that complexity is provided for ATR
    if (!complexity) {
      const errorMsg = 'Complexity is mandatory for ATR cost calculation';
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Check if complexity is a valid ComplexityLevel
    const validComplexities: ComplexityLevel[] = [
      'xSmall',
      'Small',
      'Medium',
      'Large',
      'xLarge',
    ];
    if (!validComplexities.includes(complexity as ComplexityLevel)) {
      const errorMsg = `Invalid complexity: ${complexity}. Must be one of: ${validComplexities.join(', ')}`;
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    this.logger.debug(`Validated complexity for ATR build cost: ${complexity}`);

    // Calculate cost for each component
    this.logger.debug('Calculating cost for each ATR component...');
    const breakdown: CostBreakdown[] = [];
    for (const component of components) {
      const componentCost = this.calculateEffortBasedCosts(
        component,
        complexity as ComplexityLevel,
      );
      breakdown.push(componentCost);
    }
    this.logger.debug('Finished calculating component costs.');

    // TODO: add cost for Use-cases (Add logging here when implemented)

    // Calculate total
    const total = this.calculateTotalFromBreakdown(breakdown);
    this.logger.log(`ATR build cost calculated: ${total}`);

    return Promise.resolve({ total, breakdown }); // Wrap in Promise.resolve
  }

  /**
   * Calculate run cost for ATR
   */
  protected calculateRunCost(request: AssetCostRequest): Promise<{
    total: number;
    breakdown: CostBreakdown[];
    period: 'monthly' | 'yearly';
  }> {
    this.logger.log(`Calculating ATR run cost for asset: ${request.assetName}`);
    const licenseCount = request.specificFields?.licenseCount as number;

    if (!licenseCount || licenseCount < 1) {
      const errorMsg =
        'License count must be specified and at least 1 for ATR run cost calculation';
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    this.logger.debug(
      `Validated license count for ATR run cost: ${licenseCount}`,
    );

    const baseMonthlyLicense = 500; // Base monthly license cost per instance
    const breakdown: CostBreakdown[] = [];

    // Calculate license costs
    const licenseCost = baseMonthlyLicense * licenseCount;
    this.logger.debug(`Calculated license cost: ${licenseCost}`);
    breakdown.push({
      costComponentName: 'License Fees',
      amount: licenseCost,
      description: `${licenseCount} license(s) at $${baseMonthlyLicense}/month each`,
      isError: false,
    });

    // Add support costs based on support level
    const supportLevel = request.commonFields.supportLevel || 'standard';
    let supportCost = 0;
    this.logger.debug(`Calculating support cost for level: ${supportLevel}`);

    switch (supportLevel) {
      case 'basic':
        supportCost = 100 * licenseCount;
        break;
      case 'standard':
        supportCost = 250 * licenseCount;
        break;
      case 'premium':
        supportCost = 500 * licenseCount;
        break;
      default:
        this.logger.warn(
          `Using default support cost calculation for level: ${supportLevel}`,
        );
        supportCost = 250 * licenseCount;
    }
    this.logger.debug(`Calculated support cost: ${supportCost}`);

    breakdown.push({
      costComponentName: 'Support',
      amount: supportCost,
      description: `${supportLevel} support for ${licenseCount} license(s)`,
      isError: false,
    });

    // Calculate infrastructure costs if applicable
    if (request.commonFields.deploymentType === 'cloud') {
      this.logger.debug('Calculating cloud infrastructure cost...');
      const cloudCost = 200 * licenseCount;
      this.logger.debug(`Calculated cloud cost: ${cloudCost}`);
      breakdown.push({
        costComponentName: 'Cloud Infrastructure',
        amount: cloudCost,
        description: `Cloud hosting for ${licenseCount} instance(s)`,
        isError: false,
      });
    } else {
      this.logger.debug(
        'Skipping cloud infrastructure cost (not cloud deployment).',
      );
    }

    // Calculate total monthly cost
    const total = this.calculateTotalFromBreakdown(breakdown);
    this.logger.log(`ATR run cost calculated: ${total} (monthly)`);

    return Promise.resolve({
      total,
      breakdown,
      period: 'monthly',
    }); // Wrap in Promise.resolve
  }
}
