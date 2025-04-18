import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CostingService } from '../services/costing.service';
import {
  // atrCostingExample, // Assuming these are original imports
  // qPlusPlusCostingExample,
} from '../examples/costing-example';
// import { AssetCostRequest } from '../interfaces/costing.interface'; // Unused import
import {
  CostRequestDto,
  DeploymentType,
  SupportLevel,
} from '../dto/cost-request.dto';
import { AtrCalculator } from '../calculators/atr-calculator';
import { QPlusPlusCalculator } from '../calculators/q-plus-plus-calculator';

describe('CostingService', () => {
  let service: CostingService;
  let atrCalculator: AtrCalculator;
  let qppCalculator: QPlusPlusCalculator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CostingService, AtrCalculator, QPlusPlusCalculator],
    }).compile();

    service = module.get<CostingService>(CostingService);
    atrCalculator = module.get<AtrCalculator>(AtrCalculator);
    qppCalculator = module.get<QPlusPlusCalculator>(QPlusPlusCalculator);

    // Register calculators
    service.registerCalculator(atrCalculator);
    service.registerCalculator(qppCalculator);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCalculator', () => {
    it('should return the correct calculator for asset name', () => {
      expect(service.getCalculator('ATR')).toBeInstanceOf(AtrCalculator);
      expect(service.getCalculator('QPlusPlus')).toBeInstanceOf(
        QPlusPlusCalculator,
      );
    });

    it('should throw NotFoundException for unknown asset name', () => {
      expect(() => service.getCalculator('UNKNOWN')).toThrow(NotFoundException);
    });
  });

  describe('getAvailableAssetNames', () => {
    it('should return registered asset names', () => {
      const assetNames = service.getAvailableAssetNames();
      expect(assetNames).toEqual(['ATR', 'QPlusPlus']);
    });
  });

  describe('calculateAssetCost', () => {
    it('should call the correct calculator for ATR', async () => {
      const request = {
        assetName: 'ATR',
        complexity: 'Medium',
        commonFields: {
          deploymentType: DeploymentType.CLOUD,
          supportLevel: SupportLevel.STANDARD,
          region: 'us-east-1',
        },
        assetComponents: [
          {
            name: 'ignition',
            resourceModel: [{ location: 'India', allocation: 100 }],
          },
        ],
        specificFields: {
          licenseCount: 10,
        },
      } as CostRequestDto;

      const calculateCostsSpy = jest.spyOn(atrCalculator, 'calculateCosts');
      await service.calculateAssetCost(request);
      expect(calculateCostsSpy).toHaveBeenCalledWith(request);
    });

    it('should call the correct calculator for QPlusPlus', async () => {
      const request = {
        assetName: 'QPlusPlus',
        commonFields: {
          deploymentType: DeploymentType.HYBRID,
          supportLevel: SupportLevel.PREMIUM,
          region: 'eu-west-1',
        },
        assetComponents: [
          {
            name: 'Frontend',
            resourceModel: [{ location: 'US', allocation: 100 }],
          },
        ],
        specificFields: {
          complexity: 'Large',
          databaseSize: 'large',
        },
      } as CostRequestDto;

      const calculateCostsSpy = jest.spyOn(qppCalculator, 'calculateCosts');
      await service.calculateAssetCost(request);
      expect(calculateCostsSpy).toHaveBeenCalledWith(request);
    });
  });
});
