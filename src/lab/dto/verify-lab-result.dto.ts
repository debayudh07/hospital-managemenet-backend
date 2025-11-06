import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyLabResultDto {
  @ApiProperty({ description: 'Doctor ID who is verifying', example: 'doc123' })
  @IsString()
  verifiedBy: string;

  @ApiPropertyOptional({ description: 'Verification notes', example: 'Results reviewed and approved' })
  @IsOptional()
  @IsString()
  verificationNotes?: string;
}