import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import {
  AssetCostRequest,
  AssetCostResponse,
  CostBreakdown,
  CostCalculator,
  ResourceAllocation,
  AssetComponent,
} from '../interfaces/costing.interface';

/**
 * Base calculator that all asset-specific calculators extend
 */
@Injectable()
export abstract class BaseCalculator implements CostCalculator {
  protected abstract assetType: string;
  protected abstract calculateBuildCost(request: AssetCostRequest): Promise<{
    total: number;
    breakdown: CostBreakdown[];
  }>;
  protected abstract calculateRunCost(request: AssetCostRequest): Promise<{
    total: number;
    breakdown: CostBreakdown[];
    period: 'monthly' | 'yearly';
  }>;

  /**
   * Location rates specific to each asset type, to be overridden by subclasses
   */
  protected abstract getLocationRates(): Record<string, number>;

  /**
   * Calculate both build and run costs
   * This is the main entry point for all calculators
   */
  async calculateCosts(request: AssetCostRequest): Promise<AssetCostResponse> {
    // Validate asset type
    if (request.assetType !== this.assetType) {
      throw new BadRequestException(
        `Invalid asset type. Expected ${this.assetType}, got ${request.assetType}`,
      );
    }

    // Validate resource model allocations
    this.validateComponents(request.assetComponents);

    // Calculate costs
    const buildCost = await this.calculateBuildCost(request);
    const runCost = await this.calculateRunCost(request);

    return {
      assetType: request.assetType,
      buildCost: {
        total: buildCost.total,
        breakdown: buildCost.breakdown,
        currency: 'USD', // Default currency
      },
      runCost: {
        total: runCost.total,
        breakdown: runCost.breakdown,
        period: runCost.period,
        currency: 'USD', // Default currency
      },
      estimationDate: new Date(),
    };
  }

  public getAssetType(): string {
    return this.assetType;
  }

  /**
   * Helper method to calculate effort-based build cost
   * based on resource allocations
   */
  protected calculateEffortBasedBuildCost(component: AssetComponent): {
    amount: number;
    description: string;
  } {
    const locationRates = this.getLocationRates();
    let totalBuildCost = 0;
    const allocations: string[] = [];

    // Calculate cost for each location based on allocation percentage
    for (const resource of component.resourceModel) {
      const locationRate =
        locationRates[resource.location] || locationRates['US'];
      const cost = (locationRate * resource.allocation) / 100;
      totalBuildCost += cost;
      allocations.push(`${resource.location}: ${resource.allocation}%`);
    }

    return {
      amount: totalBuildCost,
      description: `Build effort for resource allocations (${allocations.join(', ')})`,
    };
  }

  /**
   * Validate that resource model allocations add up to 100%
   */
  protected validateComponents(components: AssetComponent[]): void {
    if (!components || !components.length) {
      throw new BadRequestException(
        'At least one asset component with resource model is required',
      );
    }

    // Validate each component's resource model
    for (const component of components) {
      if (!component.resourceModel || !component.resourceModel.length) {
        throw new BadRequestException(
          `Component "${component.name}" must have a resource model`,
        );
      }

      // Check if allocations add up to 100%
      const totalAllocation = component.resourceModel.reduce(
        (sum, resource) => sum + resource.allocation,
        0,
      );

      if (totalAllocation !== 100) {
        throw new BadRequestException(
          `Resource allocations for component "${component.name}" must add up to 100%, got ${totalAllocation}%`,
        );
      }
    }
  }

  /**
   * Get multiplier for deployment type
   */
  protected getDeploymentTypeMultiplier(request: AssetCostRequest): number {
    const deploymentType = request.commonFields?.deploymentType || 'onPremise';

    // Apply multipliers based on deployment type
    const multipliers: Record<string, number> = {
      cloud: 0.8, // 20% cheaper for cloud deployments
      hybrid: 1.2, // 20% more expensive for hybrid deployments
      onPrem: 1.0, // Base cost for on-prem
      onPremise: 1.0, // Alternative name for on-prem
      managed: 1.5, // 50% more expensive for managed deployments
    };

    return multipliers[deploymentType] || 1.0;
  }

  /**
   * Get multiplier for support level
   */
  protected getSupportLevelMultiplier(request: AssetCostRequest): number {
    const supportLevel = request.commonFields?.supportLevel || 'basic';

    // Apply multipliers based on support level
    const multipliers = {
      basic: 1.0,
      standard: 1.5,
      premium: 2.0,
      enterprise: 3.0,
    };

    return multipliers[supportLevel] || 1.0;
  }

  /**
   * Helper method to calculate total cost from breakdown
   */
  protected calculateTotalFromBreakdown(breakdowns: CostBreakdown[]): number {
    return breakdowns.reduce((sum, breakdown) => sum + breakdown.amount, 0);
  }
}
