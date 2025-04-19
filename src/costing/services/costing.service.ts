import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import {
  AssetCostRequest,
  AssetCostResponse,
  CostCalculator,
} from '../interfaces/costing.interface';
import { CostRequestDto } from '../dto/cost-request.dto';

@Injectable()
export class CostingService {
  private readonly logger = new Logger(CostingService.name);

  private calculators: Map<string, CostCalculator> = new Map();

  registerCalculator(calculator: CostCalculator): void {
    const assetName = calculator.getAssetName();
    this.logger.log(`Registering calculator for asset: ${assetName}`);
    this.calculators.set(assetName, calculator);
  }

  getCalculator(assetName: string): CostCalculator {
    this.logger.log(
      `Attempting to retrieve calculator for asset: ${assetName}`,
    );
    const calculator = this.calculators.get(assetName);
    if (!calculator) {
      this.logger.error(`No calculator found for asset name: ${assetName}`);
      throw new NotFoundException(
        `No calculator found for asset name: ${assetName}`,
      );
    }
    this.logger.log(`Retrieved calculator for asset: ${assetName}`);
    return calculator;
  }

  async calculateAssetCost(
    request: CostRequestDto,
  ): Promise<AssetCostResponse> {
    this.logger.log(
      `Initiating cost calculation for asset: ${request.assetName}`,
    );
    this.logger.debug(
      `Request details - Complexity: ${request.complexity}, Components: ${request.assetComponents.map((c) => c.name).join(', ')}`,
    );

    const calculator = this.getCalculator(request.assetName);
    const assetRequest: AssetCostRequest = {
      assetName: request.assetName,
      complexity: request.complexity,
      commonFields: request.commonFields,
      assetComponents: request.assetComponents,
      specificFields: request.specificFields,
    };

    try {
      const result = await calculator.calculateCosts(assetRequest);
      this.logger.log(
        `Successfully calculated costs for asset: ${request.assetName}`,
      );
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error calculating costs for asset ${request.assetName}: ${message}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  getAvailableAssetNames(): string[] {
    this.logger.log('Retrieving available asset names');
    return Array.from(this.calculators.keys());
  }
}
