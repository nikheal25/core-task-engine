import { ApiProperty } from '@nestjs/swagger';
import { CostBreakdown } from '../interfaces/costing.interface';

export class CostBreakdownItemDto {
  @ApiProperty({
    description: 'Cost amount',
    example: 10000
  })
  amount: number;

  @ApiProperty({
    description: 'Description of the cost item',
    example: 'Base platform setup'
  })
  description: string;
}

export class CostCategoryDto {
  @ApiProperty({
    description: 'Total cost',
    example: 25000
  })
  total: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD'
  })
  currency: string;

  @ApiProperty({
    description: 'Breakdown of costs by category',
    type: 'object',
    additionalProperties: {
      type: 'object',
      properties: {
        amount: { type: 'number' },
        description: { type: 'string' }
      }
    }
  })
  breakdown: Record<string, CostBreakdownItemDto>;
}

export class RunCostDto extends CostCategoryDto {
  @ApiProperty({
    description: 'Frequency of the recurring costs',
    enum: ['monthly', 'yearly'],
    example: 'monthly'
  })
  period: 'monthly' | 'yearly';
}

export class AssetCostResponseDto {
  @ApiProperty({
    description: 'Type of asset',
    example: 'ATR'
  })
  assetType: string;

  @ApiProperty({
    description: 'One-time build costs',
    type: CostCategoryDto
  })
  buildCost: CostCategoryDto;

  @ApiProperty({
    description: 'Recurring run costs',
    type: RunCostDto
  })
  runCost: RunCostDto;

  @ApiProperty({
    description: 'Date when the cost estimation was calculated',
    type: Date
  })
  estimationDate: Date;
} 