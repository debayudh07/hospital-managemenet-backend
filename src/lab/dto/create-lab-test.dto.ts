import { IsString, IsNumber, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLabTestDto {
  @ApiProperty({ description: 'Test name', example: 'Complete Blood Count (CBC)' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Unique test code', example: 'CBC001' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Test category', example: 'Blood Test' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: 'Department code', example: 'HEMATOLOGY' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ description: 'Test price', example: 25.50 })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ description: 'Normal range for the test', example: '4.0-11.0 x10³/μL' })
  @IsOptional()
  @IsString()
  normalRange?: string;

  @ApiPropertyOptional({ description: 'Unit of measurement', example: '10³/μL' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: 'Test description', example: 'Measures different components of blood' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Test duration', example: '2-4 hours' })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({ description: 'Testing methodology', example: 'Flow Cytometry' })
  @IsOptional()
  @IsString()
  methodology?: string;

  @ApiPropertyOptional({ description: 'Required sample type', example: 'Blood' })
  @IsOptional()
  @IsString()
  sampleType?: string;

  @ApiPropertyOptional({ description: 'Required sample volume', example: '5ml' })
  @IsOptional()
  @IsString()
  sampleVolume?: string;

  @ApiPropertyOptional({ description: 'Fasting required', example: false })
  @IsOptional()
  @IsBoolean()
  fasting?: boolean;
}