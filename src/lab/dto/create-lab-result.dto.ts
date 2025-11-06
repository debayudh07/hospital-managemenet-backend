import { IsString, IsEnum, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ResultStatus {
  NORMAL = 'NORMAL',
  ABNORMAL = 'ABNORMAL',
  CRITICAL = 'CRITICAL'
}

export class CreateLabResultDto {
  @ApiProperty({ description: 'Test ID', example: 'test123' })
  @IsString()
  @IsNotEmpty()
  testId: string;

  @ApiProperty({ description: 'Test result value', example: '7.2' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiPropertyOptional({ description: 'Unit of measurement', example: '10³/μL' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: 'Normal range', example: '4.0-11.0' })
  @IsOptional()
  @IsString()
  normalRange?: string;

  @ApiProperty({ 
    description: 'Result status', 
    enum: ResultStatus,
    example: ResultStatus.NORMAL 
  })
  @IsEnum(ResultStatus)
  status: ResultStatus;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'Result within normal limits' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Technician who performed the test', example: 'tech123' })
  @IsString()
  @IsNotEmpty()
  technician: string;

  @ApiPropertyOptional({ description: 'Clinical interpretation', example: 'Normal blood count' })
  @IsOptional()
  @IsString()
  interpretation?: string;

  @ApiPropertyOptional({ description: 'Flag as critical result', example: false })
  @IsOptional()
  @IsBoolean()
  flagged?: boolean;

  @ApiPropertyOptional({ description: 'Testing method used', example: 'Flow Cytometry' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({ description: 'Instrument used', example: 'Analyzer XYZ' })
  @IsOptional()
  @IsString()
  instrument?: string;
}