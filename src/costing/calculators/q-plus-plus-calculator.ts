import { Injectable, Logger } from '@nestjs/common';
import {
  AssetCostRequest,
  CostBreakdown,
  AssetComponent,
} from '../interfaces/costing.interface';
import { BaseCalculator, ComplexityLevel } from './base-calculator';

interface QPlusPlusSpecificFields {
  userCount: number;
  modules: string[];
  dataIntegrations: number;
  storageRequirement: 'small' | 'medium' | 'large';
  complexity?: ComplexityLevel;
  databaseSize?: 'small' | 'medium' | 'large';
}

@Injectable()
export class QPlusPlusCalculator extends BaseCalculator {
  // Initialize logger for this specific calculator
  protected readonly logger = new Logger(QPlusPlusCalculator.name);

  protected assetName = 'QPlusPlus';

  /**
   * Q++-specific location rates in USD
   */
  private getLocationRates(): Record<string, number> {
    // Logging might be excessive here unless debugging rates
    return {
      US: 20000,
      EU: 22000,
      APAC: 18000,
      UK: 24000,
      LATAM: 15000,
    };
  }

  /**
   * Get blend rates for all locations
   * In a real implementation, this would fetch from MongoDB
   */
  private getBlendRates(): Record<string, Record<ComplexityLevel, number>> {
    // Logging might be excessive here unless debugging rates
    // Sample blend rates data structure (location -> complexity -> hourly rate)
    return {
      Australia: {
        xSmall: 63,
        Small: 63,
        Medium: 65,
        Large: 68,
        xLarge: 72,
      },
      India: {
        xSmall: 14,
        Small: 14,
        Medium: 15,
        Large: 16,
        xLarge: 17,
      },
      US: {
        xSmall: 75,
        Small: 75,
        Medium: 80,
        Large: 85,
        xLarge: 90,
      },
      EU: {
        xSmall: 70,
        Small: 70,
        Medium: 75,
        Large: 80,
        xLarge: 85,
      },
      APAC: {
        xSmall: 60,
        Small: 60,
        Medium: 65,
        Large: 70,
        xLarge: 75,
      },
      UK: {
        xSmall: 80,
        Small: 80,
        Medium: 85,
        Large: 90,
        xLarge: 95,
      },
      LATAM: {
        xSmall: 50,
        Small: 50,
        Medium: 55,
        Large: 60,
        xLarge: 65,
      },
    };
  }

  /**
   * Q++ specific effort hours for different components and complexity levels
   * In a real implementation, this would fetch from MongoDB
   * @throws Error if effort hours for the component and complexity are not found
   */
  private getEffortHours(
    componentName: string,
    complexity: ComplexityLevel,
  ): Record<string, number> {
    this.logger.debug(
      `Getting effort hours for Q++ component: ${componentName}, complexity: ${complexity}`,
    );
    // Sample effort hours for Q++ components
    const effortHoursDb: Record<
      string,
      Record<ComplexityLevel, Record<string, number>>
    > = {
      Frontend: {
        xSmall: { India: 25, US: 20, EU: 22, APAC: 24 },
        Small: { India: 35, US: 30, EU: 32, APAC: 34 },
        Medium: { India: 45, US: 40, EU: 42, APAC: 44 },
        Large: { India: 55, US: 50, EU: 52, APAC: 54 },
        xLarge: { India: 65, US: 60, EU: 62, APAC: 64 },
      },
      Backend: {
        xSmall: { India: 30, US: 25, EU: 27, APAC: 29 },
        Small: { India: 40, US: 35, EU: 37, APAC: 39 },
        Medium: { India: 50, US: 45, EU: 47, APAC: 49 },
        Large: { India: 60, US: 55, EU: 57, APAC: 59 },
        xLarge: { India: 70, US: 65, EU: 67, APAC: 69 },
      },
      Database: {
        xSmall: { India: 15, US: 10, EU: 12, APAC: 14 },
        Small: { India: 25, US: 20, EU: 22, APAC: 24 },
        Medium: { India: 35, US: 30, EU: 32, APAC: 34 },
        Large: { India: 45, US: 40, EU: 42, APAC: 44 },
        xLarge: { India: 55, US: 50, EU: 52, APAC: 54 },
      },
    };

    // Get effort hours for the component
    const component = effortHoursDb[componentName];
    if (!component) {
      const errorMsg = `No effort hours found for component "${componentName}"`;
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    const hours = component[complexity];
    if (!hours) {
      const errorMsg = `No effort hours found for component "${componentName}" at complexity "${complexity}"`;
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    this.logger.debug(
      `Found Q++ effort hours for ${componentName} (${complexity}): ${JSON.stringify(hours)}`,
    );
    return hours;
  }

  /**
   * Calculate effort-based costs for all components
   */
  private calculateEffortBasedCosts(
    components: AssetComponent[],
    complexity: ComplexityLevel,
  ): CostBreakdown[] {
    this.logger.debug(
      `Calculating effort-based costs for Q++ components, Complexity: ${complexity}`,
    );
    // Get blend rates
    const blendRates = this.getBlendRates();

    const costBreakdowns: CostBreakdown[] = [];

    for (const component of components) {
      this.logger.debug(`Processing component: ${component.name}`);
      try {
        // Get effort hours for this component
        const effortHours = this.getEffortHours(component.name, complexity);

        // Calculate cost using base calculator's method
        const costBreakdown = this.calculateEffortBasedComponentCost(
          component,
          complexity,
          blendRates,
          effortHours,
        );

        costBreakdowns.push(costBreakdown);
        this.logger.debug(
          `Successfully calculated cost for component ${component.name}: ${costBreakdown.amount}`,
        );
      } catch (error) {
        // If there's an error getting effort hours, create an error breakdown
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Error calculating cost for Q++ component ${component.name}: ${message}`,
          error instanceof Error ? error.stack : undefined,
        );
        costBreakdowns.push({
          costComponentName: component.name,
          amount: 0,
          description: `Error calculating effort-based cost for ${component.name}`,
          isError: true,
          errorMessage: message,
        });
      }
    }
    this.logger.debug(
      'Finished calculating effort-based costs for all Q++ components.',
    );
    return costBreakdowns;
  }

  protected calculateBuildCost(
    request: AssetCostRequest,
  ): Promise<{ total: number; breakdown: CostBreakdown[] }> {
    this.logger.log(
      `Calculating Q++ build cost for asset: ${request.assetName}`,
    );
    const specificFields = request.specificFields as QPlusPlusSpecificFields;

    // Use specified complexity or default to 'Medium'
    const complexity = (request.complexity || 'Medium') as ComplexityLevel; // Get from top level
    this.logger.debug(`Using complexity: ${complexity}`);

    // Calculate effort-based costs for all components
    const costBreakdowns = this.calculateEffortBasedCosts(
      request.assetComponents,
      complexity,
    );

    // Add database cost if specified
    if (specificFields?.databaseSize) {
      this.logger.debug(
        `Adding database setup cost for size: ${specificFields.databaseSize}`,
      );
      // Database size multiplier
      const dbSizeMultiplier =
        {
          small: 1,
          medium: 2,
          large: 3,
        }[specificFields.databaseSize] || 1;
      const dbSetupCost = 1000 * dbSizeMultiplier;
      this.logger.debug(`Database setup cost: ${dbSetupCost}`);

      costBreakdowns.push({
        costComponentName: 'Database Setup',
        amount: dbSetupCost,
        description: `Database setup for ${specificFields.databaseSize} size`,
        isError: false,
        errorMessage: '',
      });
    } else {
      this.logger.debug(
        'No database size specified, skipping database setup cost.',
      );
    }

    // Calculate total from breakdown
    const total = this.calculateTotalFromBreakdown(costBreakdowns);
    this.logger.log(`Q++ build cost calculated: ${total}`);

    return Promise.resolve({ total, breakdown: costBreakdowns });
  }

  protected calculateRunCost(request: AssetCostRequest): Promise<{
    total: number;
    breakdown: CostBreakdown[];
    period: 'monthly' | 'yearly';
  }> {
    this.logger.log(`Calculating Q++ run cost for asset: ${request.assetName}`);
    const specificFields = request.specificFields as QPlusPlusSpecificFields;

    // Base run cost
    const baseRunCost = 1000;
    this.logger.debug(`Base run cost: ${baseRunCost}`);

    // Database run cost if specified
    let dbRunCost = 0;
    if (specificFields?.databaseSize) {
      this.logger.debug(
        `Calculating database hosting cost for size: ${specificFields.databaseSize}`,
      );
      // Database size multiplier
      const dbSizeMultiplier =
        {
          small: 1,
          medium: 2,
          large: 3,
        }[specificFields.databaseSize] || 1;

      dbRunCost = 200 * dbSizeMultiplier;
      this.logger.debug(`Database hosting cost: ${dbRunCost}`);
    } else {
      this.logger.debug(
        'No database size specified, skipping database hosting cost.',
      );
    }

    // Apply deployment type multiplier - Example placeholder, assuming no multiplier for now
    // const deploymentMultiplier = this.getDeploymentTypeMultiplier(request); // Need implementation if required
    const deploymentMultiplier = 1.0;
    this.logger.debug(`Deployment multiplier: ${deploymentMultiplier}`);

    // Apply multipliers to base run cost
    const adjustedBaseRunCost = baseRunCost * deploymentMultiplier;
    this.logger.debug(`Adjusted base run cost: ${adjustedBaseRunCost}`);

    // Create breakdown
    const breakdown: CostBreakdown[] = [
      {
        costComponentName: 'Monthly Service',
        amount: adjustedBaseRunCost,
        description: 'Monthly operational cost',
        isError: false,
        errorMessage: '',
      },
    ];

    if (dbRunCost > 0) {
      breakdown.push({
        costComponentName: 'Database Hosting',
        amount: dbRunCost,
        description: `Database hosting for ${specificFields.databaseSize} size`,
        isError: false,
        errorMessage: '',
      });
    }

    // Calculate total from breakdown
    const total = this.calculateTotalFromBreakdown(breakdown);
    this.logger.log(`Q++ run cost calculated: ${total} (monthly)`);

    return Promise.resolve({
      total,
      breakdown,
      period: 'monthly',
    });
  }
}
