import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLabDepartmentDto {
  @ApiProperty({ description: 'Department name', example: 'Hematology' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Department code', example: 'HEMATOLOGY' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ description: 'Department description', example: 'Blood tests and analysis' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Head technician ID', example: 'tech123' })
  @IsOptional()
  @IsString()
  headTechnician?: string;
}