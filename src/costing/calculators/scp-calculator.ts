import { Injectable, Logger } from '@nestjs/common';
import {
  AssetCostRequest,
  CostBreakdown,
} from '../interfaces/costing.interface';
import { BaseCalculator } from './base-calculator';

@Injectable()
export class ScpCalculator extends BaseCalculator {
  protected readonly logger = new Logger(ScpCalculator.name);

  protected assetName = 'SCP';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected calculateBuildCost(
    request: AssetCostRequest,
  ): Promise<{ total: number; breakdown: CostBreakdown[] }> {
    this.logger.log(
      `Calculating SCP build cost for asset: ${request.assetName}`,
    );
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
    this.logger.log(`SCP build cost calculated: ${total}`);
    return Promise.resolve({ total, breakdown: dummyBreakdown });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected calculateRunCost(request: AssetCostRequest): Promise<{
    total: number;
    breakdown: CostBreakdown[];
    period: 'monthly' | 'yearly';
  }> {
    this.logger.log(`Calculating SCP run cost for asset: ${request.assetName}`);
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
    this.logger.log(`SCP run cost calculated: ${total} (monthly)`);
    return Promise.resolve({
      total,
      breakdown: dummyBreakdown,
      period: 'monthly',
    });
  }
}
