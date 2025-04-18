import { Body, Controller, Get, Post, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CostingService } from './services/costing.service';
import { CostRequestDto } from './dto/cost-request.dto';
import {
  AssetCostResponseDto,
  CostBreakdownItemDto,
} from './dto/cost-response.dto';
import {
  AssetCostResponse,
  CostBreakdown,
} from './interfaces/costing.interface';

@ApiTags('Costing')
@Controller('costing')
export class CostingController {
  constructor(private readonly costingService: CostingService) {}

  @Post()
  @ApiOperation({ summary: 'Calculate cost for an asset' })
  @ApiResponse({
    status: 200,
    description: 'Cost calculation successful',
    type: AssetCostResponseDto,
  })
  async calculateAssetCost(
    @Body(new ValidationPipe({ transform: true })) request: CostRequestDto,
  ): Promise<AssetCostResponseDto> {
    const response = await this.costingService.calculateAssetCost(request);
    return this.mapToDto(response);
  }

  @Get('asset-names')
  @ApiOperation({ summary: 'Get all available asset names' })
  @ApiResponse({
    status: 200,
    description: 'List of available asset names',
    schema: {
      type: 'object',
      properties: {
        assetNames: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
    },
  })
  getAvailableAssetNames(): { assetNames: string[] } {
    return { assetNames: this.costingService.getAvailableAssetNames() };
  }

  private mapToDto(response: AssetCostResponse): AssetCostResponseDto {
    return {
      assetName: response.assetName,
      buildCost: {
        total: response.buildCost.total,
        currency: response.buildCost.currency,
        breakdown: this.convertBreakdownArrayToRecord(
          response.buildCost.breakdown,
        ),
      },
      runCost: {
        total: response.runCost.total,
        currency: response.runCost.currency,
        period: response.runCost.period,
        breakdown: this.convertBreakdownArrayToRecord(
          response.runCost.breakdown,
        ),
      },
      estimationDate: response.estimationDate,
    };
  }

  private convertBreakdownArrayToRecord(
    breakdownArray: CostBreakdown[],
  ): Record<string, CostBreakdownItemDto> {
    const result: Record<string, CostBreakdownItemDto> = {};

    for (const item of breakdownArray) {
      result[item.costComponentName] = {
        amount: item.amount,
        description: item.description,
      };
    }

    return result;
  }
}
