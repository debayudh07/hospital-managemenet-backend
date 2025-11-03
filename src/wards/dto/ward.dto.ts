import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { WardType } from '@prisma/client';

export class CreateWardDto {
  @ApiProperty({ description: 'Ward number' })
  @IsString()
  @IsNotEmpty()
  wardNumber: string;

  @ApiProperty({ description: 'Ward name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: WardType, description: 'Ward type' })
  @IsEnum(WardType)
  type: WardType;

  @ApiProperty({ description: 'Department ID' })
  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({ description: 'Total number of beds' })
  @IsNumber()
  totalBeds: number;

  @ApiPropertyOptional({ description: 'Floor location' })
  @IsString()
  @IsOptional()
  floor?: string;

  @ApiPropertyOptional({ description: 'Ward description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Is ward active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateBedDto {
  @ApiProperty({ description: 'Bed number' })
  @IsString()
  @IsNotEmpty()
  bedNumber: string;

  @ApiProperty({ description: 'Ward ID' })
  @IsString()
  @IsNotEmpty()
  wardId: string;

  @ApiPropertyOptional({ description: 'Bed type (ICU, General, Private, etc.)' })
  @IsString()
  @IsOptional()
  bedType?: string;

  @ApiPropertyOptional({ description: 'Daily rate for the bed' })
  @IsNumber()
  @IsOptional()
  dailyRate?: number;

  @ApiPropertyOptional({ description: 'Is bed active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateWardDto {
  @ApiPropertyOptional({ description: 'Ward name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ enum: WardType, description: 'Ward type' })
  @IsEnum(WardType)
  @IsOptional()
  type?: WardType;

  @ApiPropertyOptional({ description: 'Total number of beds' })
  @IsNumber()
  @IsOptional()
  totalBeds?: number;

  @ApiPropertyOptional({ description: 'Floor location' })
  @IsString()
  @IsOptional()
  floor?: string;

  @ApiPropertyOptional({ description: 'Ward description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Is ward active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateBedDto {
  @ApiPropertyOptional({ description: 'Bed type (ICU, General, Private, etc.)' })
  @IsString()
  @IsOptional()
  bedType?: string;

  @ApiPropertyOptional({ description: 'Daily rate for the bed' })
  @IsNumber()
  @IsOptional()
  dailyRate?: number;

  @ApiPropertyOptional({ description: 'Is bed active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}