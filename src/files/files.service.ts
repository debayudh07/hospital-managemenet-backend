import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

interface TempFileInfo {
  id: string;
  documentName: string;
  filePath: string;
  category: any;
  fileSize: number;
  mimeType: string;
  uploadedBy?: string;
  isTemporary: boolean;
  tempPatientId: string;
}

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  private readonly UPLOAD_DIR = path.join(process.cwd(), 'assets', 'medicaldocs');

  async uploadDocuments(
    files: any[],
    patientId: string,
    category: string = 'OTHER',
    uploadedBy?: string
  ) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.UPLOAD_DIR)) {
      fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });
    }

    const uploadedFiles: any[] = [];

    for (const file of files) {
      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const uniqueFileName = `${randomUUID()}${fileExtension}`;
      const filePath = path.join(this.UPLOAD_DIR, uniqueFileName);

      // Save file to disk
      fs.writeFileSync(filePath, file.buffer);

      // Check if this is a temporary upload (patient ID starts with 'temp-')
      const isTemporaryUpload = patientId.startsWith('temp-');
      
      let document: any;
      
      if (isTemporaryUpload) {
        // For temporary uploads, don't save to database yet
        // Just return file information that will be used later
        document = {
          id: uniqueFileName, // Use filename as temporary ID
          documentName: file.originalname,
          filePath: `/assets/medicaldocs/${uniqueFileName}`,
          category: category as any,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedBy,
          isTemporary: true,
          tempPatientId: patientId,
        };
      } else {
        // For real patient uploads, save to database
        document = await this.prisma.document.create({
          data: {
            patientId,
            documentName: file.originalname,
            filePath: `/assets/medicaldocs/${uniqueFileName}`,
            category: category as any,
            fileSize: file.size,
            mimeType: file.mimetype,
            uploadedBy,
          },
        });
      }

      uploadedFiles.push(document);
    }

    return uploadedFiles;
  }

  async getDocument(documentId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            patientId: true,
          },
        },
      },
    });

    if (!document) {
      throw new BadRequestException('Document not found');
    }

    return document;
  }

  async getPatientDocuments(patientId: string) {
    return this.prisma.document.findMany({
      where: {
        patientId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async deleteDocument(documentId: string) {
    const document = await this.getDocument(documentId);
    
    // Delete file from disk
    const fullPath = path.join(process.cwd(), document.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Mark as inactive in database
    return this.prisma.document.update({
      where: { id: documentId },
      data: { isActive: false },
    });
  }

  getFilePath(filename: string) {
    return path.join(this.UPLOAD_DIR, filename);
  }

  async associateTemporaryFiles(
    tempFileInfos: TempFileInfo[], 
    realPatientId: string, 
    uploadedBy: string
  ) {
    // This method will be called after a patient is created to associate temporary files
    try {
      const associatedFiles: any[] = [];

      for (const tempFile of tempFileInfos) {
        // Create database record for the temporary file
        const document = await this.prisma.document.create({
          data: {
            patientId: realPatientId,
            documentName: tempFile.documentName,
            filePath: tempFile.filePath,
            category: tempFile.category,
            fileSize: tempFile.fileSize,
            mimeType: tempFile.mimeType,
            uploadedBy,
          },
        });

        associatedFiles.push(document);
      }

      return associatedFiles;
    } catch (error) {
      console.error('Error associating temporary files:', error);
      throw new BadRequestException('Failed to associate temporary files with patient');
    }
  }
}
