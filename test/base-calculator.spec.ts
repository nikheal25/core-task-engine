import {
  AssetCostRequest,
  CostBreakdown,
  AssetComponent,
} from '../src/costing/interfaces/costing.interface';
import { BaseCalculator } from '../src/costing/calculators/base-calculator';

// Create a concrete implementation of BaseCalculator for testing
class TestCalculator extends BaseCalculator {
  protected assetName = 'TEST';

  // Add location rates for the calculator
  private getLocationRates(): Record<string, number> {
    return {
      US: 15000,
      EU: 18000,
      APAC: 12000,
    };
  }

  // Helper method to calculate effort-based build cost for a component
  // This is for backward compatibility
  private calculateEffortBasedBuildCost(
    component: AssetComponent,
  ): CostBreakdown {
    // Simple implementation for tests
    let amount = 0;
    const description: string[] = [];

    for (const resource of component.resourceModel) {
      let rate = this.getLocationRates()[resource.location];
      if (!rate) {
        rate = 10000; // Default rate
      }

      const allocation = resource.allocation / 100;
      const resourceAmount = rate * allocation;
      amount += resourceAmount;

      description.push(`${resource.location} (${resource.allocation}%)`);
    }

    return {
      costComponentName: component.name,
      amount,
      description: `Development effort for ${component.name} in ${description.join(', ')}`,
      isError: false,
      errorMessage: '',
    };
  }

  // Implementation of deployment type multiplier
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

  // Implementation of support level multiplier
  protected getSupportLevelMultiplier(request: AssetCostRequest): number {
    const supportLevel = request.commonFields.supportLevel || 'standard';

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

  protected calculateBuildCost(
    request: AssetCostRequest,
  ): Promise<{ total: number; breakdown: CostBreakdown[] }> {
    // Calculate effort-based costs for each component
    const componentBreakdowns: CostBreakdown[] = request.assetComponents.map(
      (component) => this.calculateEffortBasedBuildCost(component),
    );

    // Add base cost
    componentBreakdowns.push({
      costComponentName: 'Base Cost',
      amount: 5000,
      description: 'Base cost',
      isError: false,
    });

    const total = this.calculateTotalFromBreakdown(componentBreakdowns);
    return Promise.resolve({ total, breakdown: componentBreakdowns });
  }

  protected calculateRunCost(
    _request: AssetCostRequest, // Mark request as unused
  ): Promise<{
    total: number;
    breakdown: CostBreakdown[];
    period: 'monthly' | 'yearly';
  }> {
    const breakdown: CostBreakdown[] = [
      {
        costComponentName: 'Support',
        amount: 1000,
        description: 'Support cost',
        isError: false,
      },
    ];

    const total = this.calculateTotalFromBreakdown(breakdown);
    return Promise.resolve({ total, breakdown, period: 'monthly' });
  }

  // Expose protected methods for testing
  public testCalculateEffortBasedBuildCost(component: AssetComponent) {
    return this.calculateEffortBasedBuildCost(component);
  }

  public testGetDeploymentTypeMultiplier(request: AssetCostRequest) {
    return this.getDeploymentTypeMultiplier(request);
  }

  public testGetSupportLevelMultiplier(request: AssetCostRequest) {
    return this.getSupportLevelMultiplier(request);
  }

  public testCalculateTotalFromBreakdown(breakdown: CostBreakdown[]) {
    return this.calculateTotalFromBreakdown(breakdown);
  }

  public testValidateComponents(components: AssetComponent[]) {
    return this.validateComponents(components);
  }

  // Keep this for backward compatibility
  public testValidateResourceModelAllocations(resourceModel: unknown) {
    // Add type assertion
    const component = {
      name: 'Test Component',
      resourceModel: resourceModel as any, // Using any here for simplicity in test, consider defining a type if needed
    };
    return this.validateComponents([component]);
  }
}

describe('BaseCalculator', () => {
  let calculator: TestCalculator;

  beforeEach(() => {
    calculator = new TestCalculator();
  });

  it('should be defined', () => {
    expect(calculator).toBeDefined();
  });

  it('should return the correct asset name', () => {
    expect(calculator.getAssetName()).toBe('TEST');
  });

  it('should calculate effort-based build cost correctly', () => {
    const request = {
      assetName: 'TEST',
      commonFields: {
        deploymentType: 'cloud',
      },
      assetComponents: [
        {
          name: 'Test Component',
          resourceModel: [
            { location: 'US', allocation: 50 },
            { location: 'EU', allocation: 50 },
          ],
        },
      ],
      specificFields: {},
    } as AssetCostRequest;

    const result = calculator.testCalculateEffortBasedBuildCost(
      request.assetComponents[0],
    );

    // 15000 * 0.5 + 18000 * 0.5 = 16500
    expect(result.amount).toBe(16500);
    expect(result.description).toContain('US (50%)');
    expect(result.description).toContain('EU (50%)');
  });

  it('should use default rate for unknown locations', () => {
    const component = {
      name: 'Test Component',
      resourceModel: [{ location: 'Unknown', allocation: 100 }],
    };

    const result = calculator.testCalculateEffortBasedBuildCost(component);

    // Should use default rate (10000)
    expect(result.amount).toBe(10000);
  });

  it('should calculate deployment type multiplier correctly', () => {
    const onPremiseRequest = {
      commonFields: { deploymentType: 'onPremise' },
    } as AssetCostRequest;
    const cloudRequest = {
      commonFields: { deploymentType: 'cloud' },
    } as AssetCostRequest;
    const hybridRequest = {
      commonFields: { deploymentType: 'hybrid' },
    } as AssetCostRequest;
    const managedRequest = {
      commonFields: { deploymentType: 'managed' },
    } as AssetCostRequest;

    expect(calculator.testGetDeploymentTypeMultiplier(onPremiseRequest)).toBe(
      1.2,
    );
    expect(calculator.testGetDeploymentTypeMultiplier(cloudRequest)).toBe(1.0);
    expect(calculator.testGetDeploymentTypeMultiplier(hybridRequest)).toBe(1.3);
    expect(calculator.testGetDeploymentTypeMultiplier(managedRequest)).toBe(
      1.5,
    );
  });

  it('should calculate support level multiplier correctly', () => {
    const basicRequest = {
      commonFields: { supportLevel: 'basic' },
    } as AssetCostRequest;
    const standardRequest = {
      commonFields: { supportLevel: 'standard' },
    } as AssetCostRequest;
    const premiumRequest = {
      commonFields: { supportLevel: 'premium' },
    } as AssetCostRequest;
    const noneRequest = { commonFields: {} } as AssetCostRequest;

    expect(calculator.testGetSupportLevelMultiplier(basicRequest)).toBe(1.0);
    expect(calculator.testGetSupportLevelMultiplier(standardRequest)).toBe(1.2);
    expect(calculator.testGetSupportLevelMultiplier(premiumRequest)).toBe(1.5);
    expect(calculator.testGetSupportLevelMultiplier(noneRequest)).toBe(1.0);
  });

  it('should calculate total from breakdown correctly', () => {
    const breakdown: CostBreakdown[] = [
      { costComponentName: 'A', amount: 100, description: 'A', isError: false },
      { costComponentName: 'B', amount: 200, description: 'B', isError: false },
      { costComponentName: 'C', amount: 300, description: 'C', isError: false },
    ];

    expect(calculator.testCalculateTotalFromBreakdown(breakdown)).toBe(600);
  });

  it('should throw error if resource allocations do not add up to 100%', () => {
    const lowResourceModel = [
      { location: 'US', allocation: 50 },
      { location: 'EU', allocation: 40 },
    ];

    const highResourceModel = [
      { location: 'US', allocation: 60 },
      { location: 'EU', allocation: 50 },
    ];

    expect(() =>
      calculator.testValidateResourceModelAllocations(lowResourceModel),
    ).toThrow();
    expect(() =>
      calculator.testValidateResourceModelAllocations(highResourceModel),
    ).toThrow();
  });

  it('should accept resource allocations that add up to approximately 100%', () => {
    const resourceModel = [
      { location: 'US', allocation: 33.33 },
      { location: 'EU', allocation: 33.33 },
      { location: 'APAC', allocation: 33.34 },
    ];

    expect(() =>
      calculator.testValidateResourceModelAllocations(resourceModel),
    ).not.toThrow();
  });

  it('should calculate costs for a valid request', async () => {
    const request = {
      assetName: 'TEST',
      commonFields: {
        deploymentType: 'cloud',
      },
      assetComponents: [
        {
          name: 'Test Component',
          resourceModel: [
            { location: 'US', allocation: 50 },
            { location: 'EU', allocation: 50 },
          ],
        },
      ],
      specificFields: {},
    } as AssetCostRequest;

    const result = await calculator.calculateCosts(request);

    expect(result).toBeDefined();
    expect(result.assetName).toBe('TEST');
    expect(result.buildCost).toBeDefined();
    expect(result.buildCost.total).toBe(21500); // 16500 (effort) + 5000 (base)
    expect(result.buildCost.currency).toBe('USD');
    expect(result.buildCost.breakdown).toBeInstanceOf(Array);
    expect(result.buildCost.breakdown.length).toBeGreaterThan(0);

    expect(result.runCost).toBeDefined();
    expect(result.runCost.total).toBe(1000);
    expect(result.runCost.currency).toBe('USD');
    expect(result.runCost.period).toBe('monthly');
  });

  it('should throw an error for invalid asset name', async () => {
    const request = {
      assetName: 'INVALID',
      commonFields: {
        deploymentType: 'cloud',
      },
      assetComponents: [
        {
          name: 'Test Component',
          resourceModel: [{ location: 'US', allocation: 100 }],
        },
      ],
      specificFields: {},
    } as AssetCostRequest;

    await expect(calculator.calculateCosts(request)).rejects.toThrow();
  });
});
