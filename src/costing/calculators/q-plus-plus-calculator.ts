import { Injectable } from '@nestjs/common';
import {
  AssetCostRequest,
  CostBreakdown,
  AssetComponent,
} from '../interfaces/costing.interface';
import { BaseCalculator } from './base-calculator';

interface QPlusPlusSpecificFields {
  userCount: number;
  modules: string[];
  dataIntegrations: number;
  storageRequirement: 'small' | 'medium' | 'large';
}

@Injectable()
export class QPlusPlusCalculator extends BaseCalculator {
  protected assetType = 'Q++';

  /**
   * Q++-specific location rates in USD
   */
  protected getLocationRates(): Record<string, number> {
    return {
      US: 35000,
      EU: 40000,
      APAC: 32000,
      UK: 42000,
      LATAM: 30000,
    };
  }

  private calculateIndividualComponentCost(component: AssetComponent): CostBreakdown {
    return {
      costComponentName: component.name,
      amount: this.calculateEffortBasedBuildCost(component).amount,
      description: this.calculateEffortBasedBuildCost(component).description,
      isError: false,
      errorMessage: '',
    };
  }

  protected async calculateBuildCost(
    request: AssetCostRequest,
  ): Promise<{ total: number; breakdown: CostBreakdown[] }> {
    const specificFields = request.specificFields as QPlusPlusSpecificFields;
    const deploymentMultiplier = this.getDeploymentTypeMultiplier(request);

    // Calculate per-module cost
    const moduleBaseCost = 3000;
    const moduleCost = specificFields.modules.length * moduleBaseCost;

    // Calculate integration costs
    const integrationCost = specificFields.dataIntegrations * 5000;

    // Storage costs
    const storageSetupCost = {
      small: 2000,
      medium: 5000,
      large: 12000,
    };

    // Calculate effort-based costs for each component
    const componentCostBreakdowns = request.assetComponents.map((component) => {
      return this.calculateIndividualComponentCost(component);
    });

    // Add other cost breakdowns
    const otherCostBreakdowns: CostBreakdown[] = [
      {
        costComponentName: 'baseSetup',
        amount: 10000,
        description: 'Base Q++ platform setup',
        isError: false,
      },
      {
        costComponentName: 'modules',
        amount: moduleCost,
        description: `Setup of ${specificFields.modules.length} modules`,
        isError: false,
      },
      {
        costComponentName: 'integrations',
        amount: integrationCost,
        description: `Setup of ${specificFields.dataIntegrations} data integrations`,
        isError: false,
      },
      {
        costComponentName: 'userSetup',
        amount: Math.ceil(specificFields.userCount / 50) * 1000,
        description: `User onboarding setup for ${specificFields.userCount} users`,
        isError: false,
      },
      {
        costComponentName: 'storageSetup',
        amount: storageSetupCost[specificFields.storageRequirement],
        description: `${specificFields.storageRequirement} storage setup`,
        isError: false,
      },
      {
        costComponentName: 'deployment',
        amount: 5000 * deploymentMultiplier,
        description: `Deployment cost (${request.commonFields.deploymentType})`,
        isError: false,
      },
    ];

    // Combine all breakdowns
    const allBreakdowns = [...componentCostBreakdowns, ...otherCostBreakdowns];

    // Calculate total from breakdown
    const total = this.calculateTotalFromBreakdown(allBreakdowns);

    return { total, breakdown: allBreakdowns };
  }

  protected async calculateRunCost(request: AssetCostRequest): Promise<{
    total: number;
    breakdown: CostBreakdown[];
    period: 'monthly' | 'yearly';
  }> {
    const specificFields = request.specificFields as QPlusPlusSpecificFields;
    const supportMultiplier = this.getSupportLevelMultiplier(request);

    // Storage monthly costs
    const storageRunCost = {
      small: 500,
      medium: 1500,
      large: 4000,
    };

    // Calculate operational costs by location
    let operationalCost = 0;
    const locations: string[] = [];

    for (const component of request.assetComponents) {
      for (const resource of component.resourceModel) {
        // Different monthly operational cost by location
        const locationRate =
          {
            US: 1000,
            EU: 1200,
            APAC: 900,
            UK: 1300,
            LATAM: 800,
          }[resource.location] || 1000;

        operationalCost += (locationRate * resource.allocation) / 100;
        if (!locations.includes(resource.location)) {
          locations.push(resource.location);
        }
      }
    }

    // User license costs
    const perUserCost = 25;

    // Calculate breakdown
    const breakdown: CostBreakdown[] = [
      {
        costComponentName: 'licensing',
        amount: specificFields.userCount * perUserCost,
        description: `License fee for ${specificFields.userCount} users`,
        isError: false,
      },
      {
        costComponentName: 'modulesMaintenance',
        amount: specificFields.modules.length * 500,
        description: `Maintenance of ${specificFields.modules.length} modules`,
        isError: false,
      },
      {
        costComponentName: 'integrationsMaintenance',
        amount: specificFields.dataIntegrations * 800,
        description: `Maintenance of ${specificFields.dataIntegrations} integrations`,
        isError: false,
      },
      {
        costComponentName: 'storage',
        amount: storageRunCost[specificFields.storageRequirement],
        description: `${specificFields.storageRequirement} storage monthly cost`,
        isError: false,
      },
      {
        costComponentName: 'operational',
        amount: operationalCost,
        description: `Operational cost based on locations: ${locations.join(', ')}`,
        isError: false,
      },
      {
        costComponentName: 'support',
        amount: 2000 * supportMultiplier,
        description: `${request.commonFields.supportLevel || 'basic'} level support`,
        isError: false,
      },
    ];

    // Calculate total from breakdown
    const total = this.calculateTotalFromBreakdown(breakdown);

    return {
      total,
      breakdown,
      period: 'monthly',
    };
  }
}
