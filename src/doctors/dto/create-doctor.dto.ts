import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  Min,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class CreateDoctorDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'john.doe@hospital.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'Cardiology' })
  @IsString()
  specialization: string;

  @ApiProperty({ example: 'LIC123456' })
  @IsString()
  licenseNumber: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  experience: number;

  @ApiProperty({ example: 'MBBS, MD (Cardiology)' })
  @IsString()
  qualification: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(0)
  consultationFee: number;

  @ApiPropertyOptional({ example: '1985-05-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ example: '123 Main St, City' })
  @IsOptional()
  @IsString()
  address?: string;

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @IsString()
    state?: string;

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @IsString()
    zipCode?: string;

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @IsString()
    emergencyContactName?: string;

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @IsString()
    emergencyContactPhone?: string;

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @IsString()
    emergencyContactRelationship?: string;

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @IsString()
    bloodGroup?: string;

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @IsDateString()
    joiningDate?: string;

    @ApiPropertyOptional({ type: String, description: 'Department name (will be converted to departmentId)' })
    @IsOptional()
    @IsString()
    department?: string;

    @ApiPropertyOptional({ type: String, description: 'Department ID for direct assignment' })
    @IsOptional()
    @IsString()
    departmentId?: string;

  // Availability & Schedule fields
  @ApiPropertyOptional({ example: ['monday', 'tuesday', 'wednesday'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  workingDays?: string[];

  @ApiPropertyOptional({ example: '09:00' })
  @IsOptional()
  @IsString()
  opdStartTime?: string;

  @ApiPropertyOptional({ example: '17:00' })
  @IsOptional()
  @IsString()
  opdEndTime?: string;

  @ApiPropertyOptional({ example: 'OPD' })
  @IsOptional()
  @IsString()
  consultationType?: string;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxPatientsPerDay?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({
    example: '{"monday": {"start": "09:00", "end": "17:00"}}',
  })
  @IsOptional()
  @IsString()
  workingHours?: string;

  @ApiPropertyOptional({ example: 'Specialist in heart diseases' })
  @IsOptional()
  @IsString()
  notes?: string;
}
