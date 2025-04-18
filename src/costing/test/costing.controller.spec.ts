import { Test, TestingModule } from '@nestjs/testing';
import { CostingController } from '../costing.controller';
import { CostingService } from '../services/costing.service';
import { AtrCalculator } from '../calculators/atr-calculator';
import { QPlusPlusCalculator } from '../calculators/q-plus-plus-calculator';
import { DeploymentType, SupportLevel } from '../dto/cost-request.dto';
import { AssetCostResponse } from '../interfaces/costing.interface';

describe('CostingController', () => {
  let controller: CostingController;
  let service: CostingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CostingController],
      providers: [CostingService, AtrCalculator, QPlusPlusCalculator],
    }).compile();

    controller = module.get<CostingController>(CostingController);
    service = module.get<CostingService>(CostingService);

    // Register calculators
    const atrCalculator = module.get<AtrCalculator>(AtrCalculator);
    const qPlusPlusCalculator =
      module.get<QPlusPlusCalculator>(QPlusPlusCalculator);
    service.registerCalculator(atrCalculator);
    service.registerCalculator(qPlusPlusCalculator);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get available asset types', () => {
    const result = controller.getAvailableAssetTypes();
    expect(result).toBeDefined();
    expect(result.assetTypes).toContain('ATR');
    expect(result.assetTypes).toContain('Q++');
  });

  it('should calculate asset cost', async () => {
    const request = {
      assetType: 'ATR',
      commonFields: {
        deploymentType: DeploymentType.CLOUD,
        supportLevel: SupportLevel.STANDARD,
      },
      resourceModel: [
        {
          location: 'US',
          allocation: 100,
        },
      ],
      specificFields: {
        complexity: 'medium',
        licenseCount: 10,
        hasCustomComponents: false,
      },
    };

    const result = await controller.calculateAssetCost(request);

    expect(result).toBeDefined();
    expect(result.assetType).toBe('ATR');
    expect(result.buildCost).toBeDefined();
    expect(result.buildCost.total).toBeGreaterThan(0);
    expect(result.buildCost.breakdown).toBeDefined();

    expect(result.runCost).toBeDefined();
    expect(result.runCost.total).toBeGreaterThan(0);
    expect(result.runCost.period).toBe('monthly');
  });

  it('should handle errors from the service', async () => {
    jest.spyOn(service, 'calculateAssetCost').mockImplementation(() => {
      throw new Error('Test error');
    });

    const request = {
      assetType: 'ATR',
      commonFields: {
        deploymentType: DeploymentType.CLOUD,
        supportLevel: SupportLevel.STANDARD,
      },
      resourceModel: [
        {
          location: 'US',
          allocation: 100,
        },
      ],
      specificFields: {
        complexity: 'medium',
        licenseCount: 10,
        hasCustomComponents: false,
      },
    };

    await expect(controller.calculateAssetCost(request)).rejects.toThrow(
      'Test error',
    );
  });
});
