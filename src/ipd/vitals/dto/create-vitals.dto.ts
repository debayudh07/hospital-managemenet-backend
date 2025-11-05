import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateVitalsDto {
  @ApiProperty({ description: 'Admission ID for vitals record' })
  @IsString()
  @IsNotEmpty()
  admissionId: string;

  @ApiProperty({ description: 'Staff member recording vitals' })
  @IsString()
  @IsNotEmpty()
  recordedBy: string;

  @ApiPropertyOptional({ description: 'Blood pressure reading (e.g., "120/80")' })
  @IsString()
  @IsOptional()
  bloodPressure?: string;

  @ApiPropertyOptional({ description: 'Heart rate in BPM', minimum: 40, maximum: 200 })
  @IsInt()
  @Min(40)
  @Max(200)
  @IsOptional()
  heartRate?: number;

  @ApiPropertyOptional({ description: 'Body temperature in Fahrenheit', minimum: 90, maximum: 110 })
  @IsNumber()
  @Min(90)
  @Max(110)
  @IsOptional()
  temperature?: number;

  @ApiPropertyOptional({ description: 'Respiratory rate per minute', minimum: 8, maximum: 40 })
  @IsInt()
  @Min(8)
  @Max(40)
  @IsOptional()
  respiratoryRate?: number;

  @ApiPropertyOptional({ description: 'Oxygen saturation percentage', minimum: 70, maximum: 100 })
  @IsInt()
  @Min(70)
  @Max(100)
  @IsOptional()
  oxygenSaturation?: number;

  @ApiPropertyOptional({ description: 'Patient weight in kg', minimum: 1, maximum: 300 })
  @IsNumber()
  @Min(1)
  @Max(300)
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({ description: 'Patient height in cm', minimum: 30, maximum: 250 })
  @IsNumber()
  @Min(30)
  @Max(250)
  @IsOptional()
  height?: number;

  @ApiPropertyOptional({ description: 'BMI (calculated automatically if not provided)' })
  @IsNumber()
  @Min(10)
  @Max(50)
  @IsOptional()
  bmi?: number;

  @ApiPropertyOptional({ description: 'Urine output in mL' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  urinOutput?: number;

  @ApiPropertyOptional({ description: 'Fluid intake in mL' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  fluidIntake?: number;

  @ApiPropertyOptional({ description: 'Pain scale (1-10)', minimum: 1, maximum: 10 })
  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  painScale?: number;

  @ApiPropertyOptional({ description: 'Shift when vitals were recorded (Morning, Evening, Night)' })
  @IsString()
  @IsOptional()
  shift?: string;

  @ApiPropertyOptional({ description: 'Recording date and time (defaults to current time)' })
  @IsDateString()
  @IsOptional()
  recordedAt?: string;

  @ApiPropertyOptional({ description: 'Additional nursing notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}