import { IsString, IsArray, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Priority } from '@prisma/client';

export class CreateLabOrderDto {
  @ApiProperty({ description: 'Patient ID', example: 'cm123456789' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ description: 'Doctor ID', example: 'cm987654321' })
  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @ApiProperty({ description: 'Array of test IDs', example: ['test1', 'test2'] })
  @IsArray()
  @IsString({ each: true })
  testIds: string[];

  @ApiProperty({ 
    description: 'Order priority', 
    enum: Priority,
    example: Priority.NORMAL 
  })
  @IsEnum(Priority)
  priority: Priority;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'Fasting required' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Clinical observations and requirements', example: 'Patient has diabetes, check glucose levels' })
  @IsOptional()
  @IsString()
  clinicalNotes?: string;

  @ApiPropertyOptional({ description: 'Name of requesting doctor/staff', example: 'Dr. John Smith' })
  @IsOptional()
  @IsString()
  requestedBy?: string;

  @ApiPropertyOptional({ description: 'Sample collection notes', example: 'Handle with care' })
  @IsOptional()
  @IsString()
  sampleCollectionNotes?: string;
}