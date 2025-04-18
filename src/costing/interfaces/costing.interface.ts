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

export interface AssetComponent {
  name: string;
  resourceModel: ResourceAllocation[];
}

/**
 * Base interface for all asset cost requests
 */
export interface AssetCostRequest {
  assetName: string;
  complexity?: string;
  commonFields: CommonFields;
  assetComponents: AssetComponent[];
  // resourceModel: ResourceAllocation[];
  specificFields: Record<string, any>;
}

export interface EffortBreakdown {
  deliveryLocation: string;
  effortHours: number;
  effortAmount: number;
  effortHoursDescription: string;
}

/**
 * Cost breakdown structure
 */
export interface CostBreakdown {
    costComponentName: string;
    amount: number;
    description: string;
    isError: boolean;
    errorMessage?: string;
    effortHours?: number;
    effortHoursDescription?: string;
    effortBreakdown?: EffortBreakdown[];
}

/**
 * Standard cost response format
 */
export interface AssetCostResponse {
  assetName: string;
  buildCost: {
    total: number;
    currency: string;
    breakdown: CostBreakdown[];
  };
  runCost: {
    total: number;
    currency: string;
    period: 'monthly' | 'yearly';
    breakdown: CostBreakdown[];
  };
  estimationDate: Date;
}

/**
 * Interface for all cost calculators
 */
export interface CostCalculator {
  calculateCosts(request: AssetCostRequest): Promise<AssetCostResponse>;
  getAssetName(): string;
}
