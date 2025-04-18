import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AssetCostRequest,
  AssetCostResponse,
  CostCalculator,
} from '../interfaces/costing.interface';
import { CostRequestDto } from '../dto/cost-request.dto';

@Injectable()
export class CostingService {
  private calculators: Map<string, CostCalculator> = new Map();

  registerCalculator(calculator: CostCalculator): void {
    this.calculators.set(calculator.getAssetName(), calculator);
  }

  getCalculator(assetName: string): CostCalculator {
    const calculator = this.calculators.get(assetName);
    if (!calculator) {
      throw new NotFoundException(
        `No calculator found for asset name: ${assetName}`,
      );
    }
    return calculator;
  }

  async calculateAssetCost(
    request: CostRequestDto,
  ): Promise<AssetCostResponse> {
    const calculator = this.getCalculator(request.assetName);
    const assetRequest: AssetCostRequest = {
      assetName: request.assetName,
      complexity: request.complexity,
      commonFields: request.commonFields,
      assetComponents: request.assetComponents,
      specificFields: request.specificFields,
    };
    return calculator.calculateCosts(assetRequest);
  }

  getAvailableAssetNames(): string[] {
    return Array.from(this.calculators.keys());
  }
}
