import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';

export enum DocumentCategory {
  ADMISSION = 'admission',
  DISCHARGE = 'discharge',
  MEDICAL = 'medical',
  INSURANCE = 'insurance',
  IDENTIFICATION = 'identification',
  OTHER = 'other',
}

export class CreateDocumentDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ description: 'Document name' })
  @IsString()
  @IsNotEmpty()
  documentName: string;

  @ApiProperty({ description: 'File path or URL' })
  @IsString()
  @IsNotEmpty()
  filePath: string;

  @ApiProperty({ enum: DocumentCategory, description: 'Document category' })
  @IsEnum(DocumentCategory)
  category: DocumentCategory;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @IsOptional()
  fileSize?: number;

  @ApiPropertyOptional({ description: 'MIME type' })
  @IsString()
  @IsOptional()
  mimeType?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}