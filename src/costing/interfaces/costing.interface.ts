/**
 * Common fields used across all asset types
 */
export interface CommonFields {
  deploymentType: 'onPremise' | 'cloud' | 'hybrid' | 'managed';
  region?: string;
  supportLevel?: 'basic' | 'standard' | 'premium';
}

/**
 * Resource allocation model by location
 */
export interface ResourceAllocation {
  location: string;
  allocation: number;
}

/**
 * Base interface for all asset cost requests
 */
export interface AssetCostRequest {
  assetType: string;
  commonFields: CommonFields;
  resourceModel: ResourceAllocation[];
  specificFields: Record<string, any>;
}

/**
 * Cost breakdown structure
 */
export interface CostBreakdown {
  [category: string]: {
    amount: number;
    description: string;
  };
}

/**
 * Standard cost response format
 */
export interface AssetCostResponse {
  assetType: string;
  buildCost: {
    total: number;
    currency: string;
    breakdown: CostBreakdown;
  };
  runCost: {
    total: number;
    currency: string;
    period: 'monthly' | 'yearly';
    breakdown: CostBreakdown;
  };
  estimationDate: Date;
}

/**
 * Interface for all cost calculators
 */
export interface CostCalculator {
  calculateCosts(request: AssetCostRequest): Promise<AssetCostResponse>;
  getAssetType(): string;
} 