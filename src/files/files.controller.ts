import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Param, 
  Query, 
  UploadedFiles, 
  UseInterceptors,
  Res,
  UseGuards
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as path from 'path';
import * as fs from 'fs';

@ApiTags('Files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload/documents/:patientId')
  @UseInterceptors(FilesInterceptor('documents', 10))
  @ApiOperation({ summary: 'Upload medical documents for a patient' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        documents: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        category: {
          type: 'string',
          description: 'Document category',
        },
        uploadedBy: {
          type: 'string',
          description: 'ID of user uploading',
        },
      },
    },
  })
  async uploadDocuments(
    @UploadedFiles() files: any[],
    @Param('patientId') patientId: string,
    @Query('category') category?: string,
    @Query('uploadedBy') uploadedBy?: string,
  ) {
    return this.filesService.uploadDocuments(files, patientId, category, uploadedBy);
  }

  @Get('documents/:patientId')
  @ApiOperation({ summary: 'Get all documents for a patient' })
  async getPatientDocuments(@Param('patientId') patientId: string) {
    return this.filesService.getPatientDocuments(patientId);
  }

  @Get('document/:documentId')
  @ApiOperation({ summary: 'Get document details' })
  async getDocument(@Param('documentId') documentId: string) {
    return this.filesService.getDocument(documentId);
  }

  @Get('download/:documentId')
  @ApiOperation({ summary: 'Download a document' })
  async downloadDocument(
    @Param('documentId') documentId: string,
    @Res() res: Response,
  ) {
    const document = await this.filesService.getDocument(documentId);
    const filePath = path.join(process.cwd(), document.filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${document.documentName}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  @Delete('document/:documentId')
  @ApiOperation({ summary: 'Delete a document' })
  async deleteDocument(@Param('documentId') documentId: string) {
    return this.filesService.deleteDocument(documentId);
  }
}
