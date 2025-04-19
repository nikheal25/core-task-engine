import { Module, OnModuleInit } from '@nestjs/common';
import { CostingController } from './costing.controller';
import { CostingService } from './services/costing.service';
import { AtrCalculator } from './calculators/atr-calculator';
import { QPlusPlusCalculator } from './calculators/q-plus-plus-calculator';
import { ScpCalculator } from './calculators/scp-calculator';

@Module({
  controllers: [CostingController],
  providers: [
    CostingService,
    AtrCalculator,
    QPlusPlusCalculator,
    ScpCalculator,
  ],
  exports: [CostingService],
})
export class CostingModule implements OnModuleInit {
  constructor(
    private readonly costingService: CostingService,
    private readonly atrCalculator: AtrCalculator,
    private readonly qPlusPlusCalculator: QPlusPlusCalculator,
    private readonly scpCalculator: ScpCalculator,
  ) {}

  onModuleInit() {
    // Register all calculators
    this.costingService.registerCalculator(this.atrCalculator);
    this.costingService.registerCalculator(this.qPlusPlusCalculator);
    this.costingService.registerCalculator(this.scpCalculator);
  }
}
