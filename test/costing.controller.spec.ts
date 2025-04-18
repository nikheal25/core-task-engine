import { Test, TestingModule } from '@nestjs/testing';
import { CostingController } from '../src/costing/costing.controller';
import { CostingService } from '../src/costing/services/costing.service';
import { CostRequestDto } from '../src/costing/dto/cost-request.dto';
import { AssetCostResponseDto } from '../src/costing/dto/cost-response.dto';
import { AtrCalculator } from '../src/costing/calculators/atr-calculator';
import { QPlusPlusCalculator } from '../src/costing/calculators/q-plus-plus-calculator';
import { DeploymentType, SupportLevel } from '../src/costing/dto/cost-request.dto';

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

    // Register calculators in the service for testing
    const atrCalculator = module.get<AtrCalculator>(AtrCalculator);
    const qppCalculator = module.get<QPlusPlusCalculator>(QPlusPlusCalculator);
    service.registerCalculator(atrCalculator);
    service.registerCalculator(qppCalculator);
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

  describe('getAvailableAssetNames', () => {
    it('should return asset names from service', () => {
      const assetNames = ['ATR', 'QPlusPlus'];
      const result = controller.getAvailableAssetNames();
      expect(result.assetNames).toEqual(expect.arrayContaining(assetNames));
    });
  });

  describe('calculateAssetCost', () => {
    it('should calculate ATR cost correctly', async () => {
      const request: CostRequestDto = {
        assetName: 'ATR',
        complexity: 'Medium',
        commonFields: {
          deploymentType: DeploymentType.CLOUD,
          supportLevel: SupportLevel.STANDARD,
        },
        assetComponents: [
          {
            name: 'ignition',
            resourceModel: [
              { location: 'India', allocation: 90 },
              { location: 'Australia', allocation: 10 },
            ],
          },
        ],
        specificFields: {
          licenseCount: 25,
        },
      };

      const result: AssetCostResponseDto =
        await controller.calculateAssetCost(request);
      expect(result).toBeDefined();
      expect(result.assetName).toBe('ATR');
      expect(result.buildCost).toBeDefined();
      expect(result.runCost).toBeDefined();
    });

    it('should calculate Q++ cost correctly', async () => {
      const request: CostRequestDto = {
        assetName: 'QPlusPlus',
        commonFields: {
          deploymentType: DeploymentType.CLOUD,
          supportLevel: SupportLevel.STANDARD,
        },
        assetComponents: [
          {
            name: 'Frontend',
            resourceModel: [{ location: 'US', allocation: 100 }],
          },
        ],
        specificFields: {
          complexity: 'Medium',
          databaseSize: 'medium',
        },
      };

      const result: AssetCostResponseDto =
        await controller.calculateAssetCost(request);
      expect(result).toBeDefined();
      expect(result.assetName).toBe('QPlusPlus');
      expect(result.buildCost).toBeDefined();
      expect(result.runCost).toBeDefined();
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

    describe('getAvailableAssetNames', () => {
      it('should return asset types from service', () => {
        const assetTypes = ['ATR', 'QPlusPlus'];
        jest
          .spyOn(service, 'getAvailableAssetNames')
          .mockReturnValue(assetTypes);

        const result = controller.getAvailableAssetNames();
        expect(result.assetNames).toEqual(assetTypes);
        expect(service.getAvailableAssetNames).toHaveBeenCalledTimes(1);
      });
    });
  });
});
