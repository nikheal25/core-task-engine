import {
  AssetCostRequest,
  AssetCostResponse,
  CostBreakdown,
  CostCalculator,
  ResourceAllocation,
} from '../interfaces/costing.interface';

export abstract class BaseCalculator implements CostCalculator {
  protected abstract assetType: string;
  protected abstract calculateBuildCost(request: AssetCostRequest): Promise<{
    total: number;
    breakdown: CostBreakdown;
  }>;
  protected abstract calculateRunCost(request: AssetCostRequest): Promise<{
    total: number;
    breakdown: CostBreakdown;
    period: 'monthly' | 'yearly';
  }>;
  
  /**
   * Location rates specific to each asset type, to be overridden by subclasses
   */
  protected abstract getLocationRates(): Record<string, number>;

  public async calculateCosts(request: AssetCostRequest): Promise<AssetCostResponse> {
    if (request.assetType !== this.getAssetType()) {
      throw new Error(`Invalid asset type. Expected ${this.getAssetType()}, got ${request.assetType}`);
    }
    
    // Validate resource model allocations total 100%
    this.validateResourceModelAllocations(request.resourceModel);

    const buildCost = await this.calculateBuildCost(request);
    const runCost = await this.calculateRunCost(request);

    return {
      assetType: this.getAssetType(),
      buildCost: {
        ...buildCost,
        currency: 'USD', // Default currency, could be made configurable
      },
      runCost: {
        ...runCost,
        currency: 'USD', // Default currency, could be made configurable
      },
      estimationDate: new Date(),
    };
  }

  public getAssetType(): string {
    return this.assetType;
  }

  /**
   * Calculates the effort-based build cost based on resource allocations
   * and location-specific rates
   */
  protected calculateEffortBasedBuildCost(request: AssetCostRequest): {
    amount: number;
    description: string;
  } {
    const locationRates = this.getLocationRates();
    let totalCost = 0;
    const locationDetails: string[] = [];

    for (const resource of request.resourceModel) {
      const rate = locationRates[resource.location] || this.getDefaultRate();
      const cost = (rate * resource.allocation) / 100;
      totalCost += cost;
      locationDetails.push(`${resource.location} (${resource.allocation}%)`);
    }

    return {
      amount: totalCost,
      description: `Effort-based build cost for locations: ${locationDetails.join(', ')}`,
    };
  }

  /**
   * Default rate to use if a specific location rate is not found
   */
  protected getDefaultRate(): number {
    return 10000; // Default value, can be overridden
  }

  /**
   * Validates that resource model allocations sum to 100%
   */
  private validateResourceModelAllocations(resourceModel: ResourceAllocation[]): void {
    if (!resourceModel || resourceModel.length === 0) {
      throw new Error('Resource model must contain at least one allocation');
    }

    const totalAllocation = resourceModel.reduce((sum, resource) => sum + resource.allocation, 0);
    
    // Allow a small tolerance for floating point errors
    if (totalAllocation < 99.9 || totalAllocation > 100.1) {
      throw new Error(`Resource allocations must add up to 100%. Current total: ${totalAllocation}%`);
    }
  }

  /**
   * Utility to sum up breakdown costs
   */
  protected calculateTotalFromBreakdown(breakdown: CostBreakdown): number {
    return Object.values(breakdown).reduce((sum, item) => sum + item.amount, 0);
  }

  /**
   * Apply multiplier based on deployment type
   */
  protected getDeploymentTypeMultiplier(request: AssetCostRequest): number {
    const { deploymentType } = request.commonFields;
    switch (deploymentType) {
      case 'onPremise':
        return 1.2;
      case 'cloud':
        return 1.0;
      case 'hybrid':
        return 1.3;
      case 'managed':
        return 1.5;
      default:
        return 1.0;
    }
  }

  /**
   * Apply multiplier based on support level
   */
  protected getSupportLevelMultiplier(request: AssetCostRequest): number {
    const { supportLevel } = request.commonFields;
    switch (supportLevel) {
      case 'basic':
        return 1.0;
      case 'standard':
        return 1.2;
      case 'premium':
        return 1.5;
      default:
        return 1.0;
    }
  }
} 