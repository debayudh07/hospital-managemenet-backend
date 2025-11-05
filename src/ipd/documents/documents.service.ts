import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDocumentDto: CreateDocumentDto) {
    const data: any = {
      patientId: createDocumentDto.patientId,
      documentName: createDocumentDto.documentName,
      filePath: createDocumentDto.filePath,
      fileSize: createDocumentDto.fileSize,
      mimeType: createDocumentDto.mimeType,
      notes: createDocumentDto.notes,
    };

    if (createDocumentDto.category !== undefined) {
      data.category = createDocumentDto.category;
    }

    return this.prisma.document.create({ data });
  }

  async findAll() {
    return this.prisma.document.findMany({
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            patientId: true,
          },
        },
      },
    });
  }

  async findByPatient(patientId: string) {
    return this.prisma.document.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.document.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            patientId: true,
          },
        },
      },
    });
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto) {
    // prepare a data object compatible with Prisma's update input:
    // - remove patientId from direct fields (Prisma expects relation update via `patient.connect`)
    // - if patientId is provided, connect the relation instead
    const { patientId, ...rest } = updateDocumentDto as any;
    const data: any = { ...rest };
    if (patientId) {
      data.patient = { connect: { id: patientId } };
    }

    return this.prisma.document.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.document.delete({
      where: { id },
    });
  }
}