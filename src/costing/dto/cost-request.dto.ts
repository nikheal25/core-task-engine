import { Type } from 'class-transformer';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
  IsNumber,
  Min,
  Max,
  ArrayMinSize,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  CommonFields,
  ResourceAllocation,
  AssetComponent,
} from '../interfaces/costing.interface';

export enum DeploymentType {
  ON_PREMISE = 'onPremise',
  CLOUD = 'cloud',
  HYBRID = 'hybrid',
  MANAGED = 'managed',
}

export enum SupportLevel {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
}

export class CommonFieldsDto implements CommonFields {
  @ApiProperty({
    enum: DeploymentType,
    description: 'Type of deployment',
    example: DeploymentType.CLOUD,
  })
  @IsEnum(DeploymentType)
  deploymentType: DeploymentType;

  @ApiProperty({
    description: 'Deployment region',
    required: false,
    example: 'us-east-1',
  })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiProperty({
    enum: SupportLevel,
    description: 'Support level',
    required: false,
    example: SupportLevel.STANDARD,
  })
  @IsEnum(SupportLevel)
  @IsOptional()
  supportLevel?: SupportLevel;
}

export class ResourceAllocationDto implements ResourceAllocation {
  @ApiProperty({
    description: 'Location name',
    example: 'US',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: 'Allocation percentage (0-100)',
    example: 50,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  allocation: number;
}

export class AssetComponentDto implements AssetComponent {
  @ApiProperty({
    description: 'Component name',
    example: 'Frontend',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Resource allocation model by location (must total 100%)',
    type: [ResourceAllocationDto],
    example: [
      {
        location: 'US',
        allocation: 50,
      },
      {
        location: 'EU',
        allocation: 50,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => ResourceAllocationDto)
  resourceModel: ResourceAllocationDto[];
}

export class CostRequestDto {
  @ApiProperty({
    description: 'Type of asset to calculate cost for',
    example: 'ATR',
  })
  @IsString()
  assetType: string;

  @ApiProperty({
    description: 'Common fields used across all asset types',
    type: CommonFieldsDto,
  })
  @ValidateNested()
  @Type(() => CommonFieldsDto)
  commonFields: CommonFieldsDto;

  @ApiProperty({
    description: 'Asset components with their resource allocations',
    type: [AssetComponentDto],
    example: [
      {
        name: 'Frontend',
        resourceModel: [
          {
            location: 'US',
            allocation: 60,
          },
          {
            location: 'EU',
            allocation: 40,
          },
        ],
      },
      {
        name: 'Backend',
        resourceModel: [
          {
            location: 'US',
            allocation: 70,
          },
          {
            location: 'APAC',
            allocation: 30,
          },
        ],
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => AssetComponentDto)
  assetComponents: AssetComponentDto[];

  @ApiProperty({
    description: 'Asset-specific fields required for cost calculation',
    example: {
      complexity: 'medium',
      licenseCount: 25,
      hasCustomComponents: true,
    },
  })
  @IsObject()
  specificFields: Record<string, any>;
}
