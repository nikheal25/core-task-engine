import { Injectable } from '@nestjs/common';
import {
  AssetCostRequest,
  CostBreakdown,
  AssetComponent
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

  private calculateIndividualComponentCost(component: AssetComponent): CostBreakdown {
    let costBreakdown: CostBreakdown = {
      costComponentName: component.name,
      amount: 100,
      description: '',
      isError: false,
      errorMessage: '',
    };
    return costBreakdown;
  }
  
  protected async calculateBuildCost(
    request: AssetCostRequest,
  ): Promise<{ total: number; breakdown: CostBreakdown[] }> {
    const specificFields = request.specificFields as AtrSpecificFields;

    // Calculate effort-based costs for each component
    // * : this will be a list of cost breakdowns for each component
    const costBreakdowns: CostBreakdown[] = [];
    for (const component of request.assetComponents) {
      try {
        const costBreakdown = this.calculateIndividualComponentCost(component);
        costBreakdowns.push(costBreakdown);
      } catch (error) {
        console.log(`Error calculating individual component cost: ${component.name}`);
        
        console.error(error);

        // if error while calculating individual component cost, add error to cost breakdown
        costBreakdowns.push({
          costComponentName: component.name,
          amount: 0,
          description: '',
          isError: true,
          errorMessage: error.message,
        });
      }
      
    }

    // TODO: use case cost breakdowns

    // Calculate total from breakdown
    const total = this.calculateTotalFromBreakdown(costBreakdowns);

    return { total: total, breakdown: costBreakdowns };
  }

  protected async calculateRunCost(request: AssetCostRequest): Promise<{
    total: number;
    breakdown: CostBreakdown[];
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
    const breakdown: CostBreakdown[] = [{
      costComponentName: 'ATR',
      amount: operationalCost,
      description: componentDetails.join(', '),
      isError: false,
      errorMessage: '',
    }];

    // Calculate total from breakdown
    const total = this.calculateTotalFromBreakdown(breakdown);

    return {
      total,
      breakdown: breakdown,
      period: 'monthly',
    };
  }
}
