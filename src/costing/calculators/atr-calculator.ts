import { Injectable } from '@nestjs/common';
import {
  AssetCostRequest,
  CostBreakdown,
  AssetComponent
} from '../interfaces/costing.interface';
import { BaseCalculator, ComplexityLevel } from './base-calculator';

@Injectable()
export class AtrCalculator extends BaseCalculator {
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
        xLarge: 17
      },
      Australia: {
        xSmall: 48,
        Small: 49,
        Medium: 52,
        Large: 53,
        xLarge: 55
      },
    };
  }

  /**
   * Get effort hours for ATR components by location and complexity
   * @param component - The component name to get hours for
   * @param complexity - The complexity level (must be a valid ComplexityLevel)
   * @throws Error if hours are not found for the component and complexity
   */
  protected getEffortHours(component: string, complexity: ComplexityLevel): Record<string, number> {
    // Define effort hours by component, complexity, and location
    // These are example values and would typically come from a database
    const effortHoursByComponent: Record<string, Record<ComplexityLevel, Record<string, number>>> = {
      'ignition': {
        xSmall: { Australia: 19.39, India: 21.14 },
        Small: {  Australia: 21.34, India: 23.1 },
        Medium: {  Australia: 31.25, India: 32.8 },
        Large: {  Australia: 41.20, India: 42.6 },
        xLarge: {  Australia: 50.91, India: 52.47 },
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
      throw new Error(`Effort hours not found for component: ${component}`);
    }

    // Get hours for this complexity
    const complexityHours = componentHours[complexity];
    if (!complexityHours) {
      throw new Error(`Effort hours not found for component: ${component}, complexity: ${complexity}`);
    }

    return complexityHours;
  }

  /**
   * Calculate costs for ATR component based on effort hours
   * @param component - The asset component to calculate costs for
   * @param complexity - The complexity level (must be a valid ComplexityLevel)
   */
  protected calculateEffortBasedCosts(
    component: AssetComponent, 
    complexity: ComplexityLevel
  ): CostBreakdown {
    try {
      const blendRates = this.getBlendRates();
      const effortHours = this.getEffortHours(component.name, complexity);
      
      return this.calculateEffortBasedComponentCost(
        component,
        complexity,
        blendRates,
        effortHours
      );
    } catch (error) {
      return {
        costComponentName: component.name,
        amount: 0,
        description: `Error calculating costs for ${component.name}`,
        isError: true,
        errorMessage: error.message,
      };
    }
  }

  /**
   * Calculate build cost for ATR
   */
  protected async calculateBuildCost(
    request: AssetCostRequest
  ): Promise<{ total: number; breakdown: CostBreakdown[] }> {
    const components = request.assetComponents;
    const complexity = request.complexity as ComplexityLevel;
    
    // Validate that complexity is provided for ATR
    if (!complexity) {
      throw new Error('Complexity is mandatory for ATR cost calculation');
    }
    
    // Check if complexity is a valid ComplexityLevel
    const validComplexities: ComplexityLevel[] = ['xSmall', 'Small', 'Medium', 'Large', 'xLarge'];
    if (!validComplexities.includes(complexity)) {
      throw new Error(`Invalid complexity: ${complexity}. Must be one of: ${validComplexities.join(', ')}`);
    }

    // Calculate cost for each component
    const breakdown: CostBreakdown[] = [];
    for (const component of components) {
      const componentCost = this.calculateEffortBasedCosts(component, complexity);
      breakdown.push(componentCost);
    }

    // TODO: add cost for Use-cases

    // Calculate total
    const total = this.calculateTotalFromBreakdown(breakdown);

    return {
      total,
      breakdown,
    };
  }

  /**
   * Calculate run cost for ATR
   */
  protected async calculateRunCost(
    request: AssetCostRequest
  ): Promise<{ total: number; breakdown: CostBreakdown[]; period: 'monthly' | 'yearly' }> {
    const components = request.assetComponents;
    const licenseCount = request.specificFields?.licenseCount as number;
    
    if (!licenseCount || licenseCount < 1) {
      throw new Error('License count must be specified and at least 1 for ATR run cost calculation');
    }

    const baseMonthlyLicense = 500; // Base monthly license cost per instance
    const breakdown: CostBreakdown[] = [];
    
    // Calculate license costs
    const licenseCost = baseMonthlyLicense * licenseCount;
    breakdown.push({
      costComponentName: 'License Fees',
      amount: licenseCost,
      description: `${licenseCount} license(s) at $${baseMonthlyLicense}/month each`,
      isError: false,
    });

   
    // Add support costs based on support level
    const supportLevel = request.commonFields.supportLevel || 'standard';
    let supportCost = 0;
    
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
        supportCost = 250 * licenseCount;
    }
    
    breakdown.push({
      costComponentName: 'Support',
      amount: supportCost,
      description: `${supportLevel} support for ${licenseCount} license(s)`,
      isError: false,
    });

    // Calculate infrastructure costs if applicable
    if (request.commonFields.deploymentType === 'cloud') {
      const cloudCost = 200 * licenseCount;
      breakdown.push({
        costComponentName: 'Cloud Infrastructure',
        amount: cloudCost,
        description: `Cloud hosting for ${licenseCount} instance(s)`,
        isError: false,
      });
    }

    // Calculate total monthly cost
    const total = this.calculateTotalFromBreakdown(breakdown);
    
    return {
      total,
      breakdown,
      period: 'monthly',
    };
  }
}
