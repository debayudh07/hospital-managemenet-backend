import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LabOrderStatus } from '@prisma/client';

export class UpdateLabOrderStatusDto {
  @ApiProperty({ 
    description: 'New order status', 
    enum: LabOrderStatus,
    example: LabOrderStatus.IN_PROGRESS 
  })
  @IsEnum(LabOrderStatus)
  status: LabOrderStatus;

  @ApiPropertyOptional({ description: 'Notes for status change', example: 'Sample collected successfully' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Sample condition notes', example: 'Good quality sample' })
  @IsOptional()
  @IsString()
  sampleCondition?: string;
}