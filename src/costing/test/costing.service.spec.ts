import { Test, TestingModule } from '@nestjs/testing';
import { CostingService } from '../services/costing.service';
import { AtrCalculator } from '../calculators/atr-calculator';
import { QPlusPlusCalculator } from '../calculators/q-plus-plus-calculator';
import { NotFoundException } from '@nestjs/common';
import { atrCostingExample, qPlusPlusCostingExample } from '../examples/costing-example';
import { AssetCostRequest } from '../interfaces/costing.interface';
import { CostRequestDto, DeploymentType, SupportLevel } from '../dto/cost-request.dto';

describe('CostingService', () => {
  let service: CostingService;
  let atrCalculator: AtrCalculator;
  let qPlusPlusCalculator: QPlusPlusCalculator;

  // Cast examples to proper type for testing
  const atrRequest = {
    ...atrCostingExample,
    commonFields: {
      ...atrCostingExample.commonFields,
      deploymentType: DeploymentType.CLOUD,
      supportLevel: SupportLevel.STANDARD
    }
  } as CostRequestDto;
  
  const qPlusPlusRequest = {
    ...qPlusPlusCostingExample,
    commonFields: {
      ...qPlusPlusCostingExample.commonFields,
      deploymentType: DeploymentType.HYBRID,
      supportLevel: SupportLevel.PREMIUM
    }
  } as CostRequestDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CostingService,
        AtrCalculator,
        QPlusPlusCalculator,
      ],
    }).compile();

    service = module.get<CostingService>(CostingService);
    atrCalculator = module.get<AtrCalculator>(AtrCalculator);
    qPlusPlusCalculator = module.get<QPlusPlusCalculator>(QPlusPlusCalculator);
    
    // Register calculators
    service.registerCalculator(atrCalculator);
    service.registerCalculator(qPlusPlusCalculator);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get available asset types', () => {
    const assetTypes = service.getAvailableAssetTypes();
    expect(assetTypes).toContain('ATR');
    expect(assetTypes).toContain('Q++');
    expect(assetTypes.length).toBe(2);
  });

  it('should get calculator by assetType', () => {
    const calculator = service.getCalculator('ATR');
    expect(calculator).toBe(atrCalculator);
    
    const calculator2 = service.getCalculator('Q++');
    expect(calculator2).toBe(qPlusPlusCalculator);
  });

  it('should throw NotFoundException for unknown asset type', () => {
    expect(() => service.getCalculator('Unknown')).toThrow(NotFoundException);
  });

  it('should calculate asset cost for ATR asset', async () => {
    const result = await service.calculateAssetCost(atrRequest);
    
    expect(result).toBeDefined();
    expect(result.assetType).toBe('ATR');
    expect(result.buildCost).toBeDefined();
    expect(result.buildCost.total).toBeGreaterThan(0);
    expect(result.buildCost.breakdown).toBeDefined();
    expect(result.buildCost.breakdown.effortBased).toBeDefined();
    
    expect(result.runCost).toBeDefined();
    expect(result.runCost.total).toBeGreaterThan(0);
    expect(result.runCost.period).toBe('monthly');
    expect(result.runCost.breakdown).toBeDefined();
  });

  it('should calculate asset cost for Q++ asset', async () => {
    const result = await service.calculateAssetCost(qPlusPlusRequest);
    
    expect(result).toBeDefined();
    expect(result.assetType).toBe('Q++');
    expect(result.buildCost).toBeDefined();
    expect(result.buildCost.total).toBeGreaterThan(0);
    expect(result.buildCost.breakdown).toBeDefined();
    expect(result.buildCost.breakdown.effortBased).toBeDefined();
    
    expect(result.runCost).toBeDefined();
    expect(result.runCost.total).toBeGreaterThan(0);
    expect(result.runCost.period).toBe('monthly');
    expect(result.runCost.breakdown).toBeDefined();
  });
}); 