import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { Gender, StaffRole } from '@prisma/client';

export class CreateStaffDto {
  @ApiProperty({ example: 'Jane' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'jane.smith@hospital.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  phone: string;

  @ApiProperty({ enum: StaffRole, example: StaffRole.NURSE })
  @IsEnum(StaffRole)
  role: StaffRole;

  @ApiPropertyOptional({ example: 'Emergency' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ example: 'BSc Nursing' })
  @IsOptional()
  @IsString()
  qualification?: string;

  @ApiPropertyOptional({ example: '1990-05-15' })
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

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ example: '2020-01-15' })
  @IsOptional()
  @IsDateString()
  joiningDate?: string;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salary?: number;

  @ApiPropertyOptional({ example: 'Experienced in critical care' })
  @IsOptional()
  @IsString()
  notes?: string;
}
