import { PartialType } from '@nestjs/swagger';
import { CreatePatientDto } from './create-patient.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  @ApiProperty({
    description: 'Patient ID',
    example: 'clxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
}