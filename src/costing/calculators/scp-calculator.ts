import { Injectable } from '@nestjs/common';
import {
  AssetCostRequest,
  CostBreakdown,
} from '../interfaces/costing.interface';
import { BaseCalculator, ComplexityLevel } from './base-calculator';

@Injectable()
export class ScpCalculator extends BaseCalculator {
  protected assetName = 'SCP';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected calculateBuildCost(
    _request: AssetCostRequest,
  ): Promise<{ total: number; breakdown: CostBreakdown[] }> {
    // Dummy implementation for SCP build cost
    const dummyBreakdown: CostBreakdown[] = [
      {
        costComponentName: 'SCP Setup',
        amount: 5000,
        description: 'Initial setup cost for SCP asset',
        isError: false,
      },
    ];
    const total = this.calculateTotalFromBreakdown(dummyBreakdown);
    return Promise.resolve({ total, breakdown: dummyBreakdown });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected calculateRunCost(_request: AssetCostRequest): Promise<{
    total: number;
    breakdown: CostBreakdown[];
    period: 'monthly' | 'yearly';
  }> {
    // Dummy implementation for SCP run cost
    const dummyBreakdown: CostBreakdown[] = [
      {
        costComponentName: 'SCP Monthly Maintenance',
        amount: 500,
        description: 'Monthly running cost for SCP asset',
        isError: false,
      },
    ];
    const total = this.calculateTotalFromBreakdown(dummyBreakdown);
    return Promise.resolve({
      total,
      breakdown: dummyBreakdown,
      period: 'monthly',
    });
  }
}
