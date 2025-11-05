import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsInt,
  Min,
  IsNumber,
} from 'class-validator';
import { WardType } from '@prisma/client';

export class CreateWardDto {
  @ApiProperty({ description: 'Unique ward number' })
  @IsString()
  @IsNotEmpty()
  wardNumber: string;

  @ApiProperty({ description: 'Ward name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    enum: WardType,
    description: 'Type of ward' 
  })
  @IsEnum(WardType)
  type: WardType;

  @ApiProperty({ description: 'Department ID this ward belongs to' })
  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({ description: 'Total number of beds in ward', minimum: 1 })
  @IsInt()
  @Min(1)
  totalBeds: number;

  @ApiPropertyOptional({ description: 'Floor location of ward' })
  @IsString()
  @IsOptional()
  floor?: string;

  @ApiPropertyOptional({ description: 'Ward description or notes' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateBedDto {
  @ApiProperty({ description: 'Unique bed number within the ward' })
  @IsString()
  @IsNotEmpty()
  bedNumber: string;

  @ApiPropertyOptional({ description: 'Type of bed (ICU, General, Private, etc.)' })
  @IsString()
  @IsOptional()
  bedType?: string;

  @ApiPropertyOptional({ description: 'Daily rate for the bed', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  dailyRate?: number;
}