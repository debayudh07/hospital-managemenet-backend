import { IsString, IsArray, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLabTemplateDto {
  @ApiProperty({ description: 'Template name', example: 'Lipid Panel' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Template description', example: 'Comprehensive lipid analysis' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Array of test IDs', example: ['test1', 'test2', 'test3'] })
  @IsArray()
  @IsString({ each: true })
  testIds: string[];

  @ApiProperty({ description: 'Total cost for the template', example: 150.00 })
  @IsNumber()
  totalCost: number;
}