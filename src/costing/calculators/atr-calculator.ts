import { Injectable } from '@nestjs/common';
import {
  AssetCostRequest,
  CostBreakdown,
} from '../interfaces/costing.interface';
import { BaseCalculator } from './base-calculator';

interface AtrSpecificFields {
  complexity: 'low' | 'medium' | 'high';
  licenseCount: number;
  hasCustomComponents: boolean;
}

@Injectable()
export class AtrCalculator extends BaseCalculator {
  protected assetType = 'ATR';

  /**
   * ATR-specific location rates in USD
   */
  protected getLocationRates(): Record<string, number> {
    return {
      US: 25000,
      EU: 30000,
      APAC: 22000,
      UK: 32000,
      LATAM: 20000,
    };
  }

  protected async calculateBuildCost(
    request: AssetCostRequest,
  ): Promise<{ total: number; breakdown: CostBreakdown }> {
    const specificFields = request.specificFields as AtrSpecificFields;

    // Base costs by complexity
    const complexityBaseCost = {
      low: 5000,
      medium: 10000,
      high: 20000,
    };

    // Calculate effort-based costs for each component
    const componentCosts = request.assetComponents.map((component) => {
      return {
        component: component.name,
        cost: this.calculateEffortBasedBuildCost(component),
      };
    });

    // Create the combined effort-based cost
    const totalEffortCost = componentCosts.reduce(
      (sum, item) => sum + item.cost.amount,
      0,
    );
    const componentDescriptions = componentCosts.map(
      (item) => `${item.component}: ${item.cost.description}`,
    );

    const effortBasedCost = {
      amount: totalEffortCost,
      description: `Effort-based build costs: ${componentDescriptions.join('; ')}`,
    };

    // Calculate breakdown
    const breakdown: CostBreakdown = {
      baseBuild: {
        amount: complexityBaseCost[specificFields.complexity],
        description: `Base build cost for ${specificFields.complexity} complexity`,
      },
      effortBased: effortBasedCost,
      deployment: {
        amount: 2000 * this.getDeploymentTypeMultiplier(request),
        description: 'Deployment setup cost',
      },
      licensing: {
        amount: specificFields.licenseCount * 500,
        description: `License setup for ${specificFields.licenseCount} licenses`,
      },
      customization: {
        amount: specificFields.hasCustomComponents ? 8000 : 0,
        description: specificFields.hasCustomComponents
          ? 'Custom components development'
          : 'No custom components',
      },
    };

    // Calculate total from breakdown
    const total = this.calculateTotalFromBreakdown(breakdown);

    return { total, breakdown };
  }

  protected async calculateRunCost(request: AssetCostRequest): Promise<{
    total: number;
    breakdown: CostBreakdown;
    period: 'monthly' | 'yearly';
  }> {
    const specificFields = request.specificFields as AtrSpecificFields;
    const supportMultiplier = this.getSupportLevelMultiplier(request);

    // Calculate operational costs by component and location
    let operationalCost = 0;
    const componentDetails: string[] = [];

    for (const component of request.assetComponents) {
      let componentCost = 0;
      const locations: string[] = [];

      for (const resource of component.resourceModel) {
        // Different monthly operational cost by location
        const locationRate =
          {
            US: 600,
            EU: 700,
            APAC: 550,
            UK: 750,
            LATAM: 500,
          }[resource.location] || 600;

        const cost = (locationRate * resource.allocation) / 100;
        componentCost += cost;
        locations.push(resource.location);
      }

      operationalCost += componentCost;
      componentDetails.push(`${component.name} (${locations.join(', ')})`);
    }

    // Calculate breakdown
    const breakdown: CostBreakdown = {
      license: {
        amount: specificFields.licenseCount * 100,
        description: `Monthly license fee for ${specificFields.licenseCount} licenses`,
      },
      support: {
        amount: 1000 * supportMultiplier,
        description: `Support cost with ${request.commonFields.supportLevel || 'basic'} level`,
      },
      operational: {
        amount: operationalCost,
        description: `Operational cost based on components: ${componentDetails.join('; ')}`,
      },
      maintenance: {
        amount:
          specificFields.complexity === 'high'
            ? 2000
            : specificFields.complexity === 'medium'
              ? 1000
              : 500,
        description: `Maintenance cost for ${specificFields.complexity} complexity`,
      },
    };

    // Calculate total from breakdown
    const total = this.calculateTotalFromBreakdown(breakdown);

    return {
      total,
      breakdown,
      period: 'monthly',
    };
  }
}
