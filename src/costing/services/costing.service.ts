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
    this.calculators.set(calculator.getAssetType(), calculator);
  }

  getCalculator(assetType: string): CostCalculator {
    const calculator = this.calculators.get(assetType);
    if (!calculator) {
      throw new NotFoundException(
        `No calculator found for asset type: ${assetType}`,
      );
    }
    return calculator;
  }

  async calculateAssetCost(
    request: CostRequestDto,
  ): Promise<AssetCostResponse> {
    const calculator = this.getCalculator(request.assetType);
    const assetRequest: AssetCostRequest = {
      assetType: request.assetType,
      commonFields: request.commonFields,
      assetComponents: request.assetComponents,
      specificFields: request.specificFields,
    };
    return calculator.calculateCosts(assetRequest);
  }

  getAvailableAssetTypes(): string[] {
    return Array.from(this.calculators.keys());
  }
}
