import { PartialType } from '@nestjs/mapped-types';
import { CreatePatientDto } from './create-patient.dto';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  @ApiProperty({
    description: 'New password for the patient (optional)',
    example: 'newSecurePassword123',
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;
}
