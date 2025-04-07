import { Body, Controller, Get, Post, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CostingService } from './services/costing.service';
import { CostRequestDto } from './dto/cost-request.dto';
import { AssetCostResponseDto } from './dto/cost-response.dto';

@ApiTags('Costing')
@Controller('costing')
export class CostingController {
  constructor(private readonly costingService: CostingService) {}

  @Post()
  @ApiOperation({ summary: 'Calculate cost for an asset' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cost calculation successful',
    type: AssetCostResponseDto
  })
  async calculateAssetCost(
    @Body(new ValidationPipe({ transform: true })) request: CostRequestDto,
  ): Promise<AssetCostResponseDto> {
    return this.costingService.calculateAssetCost(request);
  }

  @Get('asset-types')
  @ApiOperation({ summary: 'Get all available asset types' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of available asset types',
    schema: {
      type: 'object',
      properties: {
        assetTypes: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      }
    }
  })
  getAvailableAssetTypes(): { assetTypes: string[] } {
    return { assetTypes: this.costingService.getAvailableAssetTypes() };
  }
} 