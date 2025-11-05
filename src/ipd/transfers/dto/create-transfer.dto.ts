import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  MinLength,
} from 'class-validator';

export class CreateTransferDto {
  @ApiProperty({ description: 'Admission ID for bed transfer' })
  @IsString()
  @IsNotEmpty()
  admissionId: string;

  @ApiProperty({ description: 'Target bed ID for transfer' })
  @IsString()
  @IsNotEmpty()
  toBedId: string;

  @ApiProperty({ description: 'Reason for bed transfer' })
  @IsString()
  @MinLength(10)
  reason: string;

  @ApiProperty({ description: 'Staff member approving the transfer' })
  @IsString()
  @IsNotEmpty()
  approvedBy: string;

  @ApiPropertyOptional({ description: 'Transfer date (defaults to current date)' })
  @IsDateString()
  @IsOptional()
  transferDate?: string;

  @ApiPropertyOptional({ description: 'Transfer time (defaults to current time)' })
  @IsString()
  @IsOptional()
  transferTime?: string;

  @ApiPropertyOptional({ description: 'Additional transfer notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}