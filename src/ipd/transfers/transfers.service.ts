import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransferDto, UpdateTransferDto } from './dto';

@Injectable()
export class TransfersService {
  constructor(private prisma: PrismaService) {}

  async create(createTransferDto: CreateTransferDto) {
    // Check if admission exists and is active
    const admission = await this.prisma.admission.findUnique({
      where: { id: createTransferDto.admissionId },
      include: {
        patient: true,
        bed: { include: { ward: true } },
      },
    });

    if (!admission) {
      throw new NotFoundException('Admission not found');
    }

    if (admission.status === 'DISCHARGED') {
      throw new BadRequestException('Cannot transfer discharged patient');
    }

    // Check if target bed exists and is available
    const targetBed = await this.prisma.bed.findUnique({
      where: { id: createTransferDto.toBedId },
      include: { ward: true },
    });

    if (!targetBed) {
      throw new NotFoundException('Target bed not found');
    }

    if (targetBed.isOccupied) {
      throw new BadRequestException('Target bed is already occupied');
    }

    if (targetBed.id === admission.bedId) {
      throw new BadRequestException('Target bed is the same as current bed');
    }

    // Perform bed transfer with transaction
    return this.prisma.$transaction(async (prisma) => {
      // Create transfer record
      const transfer = await prisma.bedTransfer.create({
        data: {
          admissionId: createTransferDto.admissionId,
          fromBedId: admission.bedId,
          toBedId: createTransferDto.toBedId,
          transferDate: createTransferDto.transferDate 
            ? new Date(createTransferDto.transferDate) 
            : new Date(),
          transferTime: createTransferDto.transferTime || 
            new Date().toTimeString().slice(0, 5),
          reason: createTransferDto.reason,
          approvedBy: createTransferDto.approvedBy,
          notes: createTransferDto.notes,
        },
        include: {
          admission: {
            include: {
              patient: true,
            },
          },
          fromBed: { include: { ward: true } },
          toBed: { include: { ward: true } },
        },
      });

      // Update admission bed
      await prisma.admission.update({
        where: { id: createTransferDto.admissionId },
        data: { bedId: createTransferDto.toBedId },
      });

      // Free the old bed
      await prisma.bed.update({
        where: { id: admission.bedId },
        data: { isOccupied: false },
      });

      // Occupy the new bed
      await prisma.bed.update({
        where: { id: createTransferDto.toBedId },
        data: { isOccupied: true },
      });

      // Update ward bed counts
      if (admission.bed.wardId !== targetBed.wardId) {
        // Different wards - update both
        await prisma.ward.update({
          where: { id: admission.bed.wardId },
          data: { availableBeds: { increment: 1 } },
        });

        await prisma.ward.update({
          where: { id: targetBed.wardId },
          data: { availableBeds: { decrement: 1 } },
        });
      }

      return transfer;
    });
  }

  async findAll(filters: {
    admissionId?: string;
    patientId?: string;
    wardId?: string;
    transferDate?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    // Build filters
    if (filters.admissionId) {
      where.admissionId = filters.admissionId;
    }

    if (filters.patientId) {
      where.admission = { patientId: filters.patientId };
    }

    if (filters.wardId) {
      where.OR = [
        { fromBed: { wardId: filters.wardId } },
        { toBed: { wardId: filters.wardId } },
      ];
    }

    if (filters.transferDate) {
      const date = new Date(filters.transferDate);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      
      where.transferDate = {
        gte: date,
        lt: nextDate,
      };
    }

    const [transfers, total] = await Promise.all([
      this.prisma.bedTransfer.findMany({
        where,
        include: {
          admission: {
            include: {
              patient: true,
            },
          },
          fromBed: { include: { ward: true } },
          toBed: { include: { ward: true } },
        },
        orderBy: { transferDate: 'desc' },
        skip: filters.offset || 0,
        take: filters.limit || 50,
      }),
      this.prisma.bedTransfer.count({ where }),
    ]);

    return {
      transfers,
      pagination: {
        total,
        limit: filters.limit || 50,
        offset: filters.offset || 0,
        pages: Math.ceil(total / (filters.limit || 50)),
      },
    };
  }

  async findOne(id: string) {
    const transfer = await this.prisma.bedTransfer.findUnique({
      where: { id },
      include: {
        admission: {
          include: {
            patient: true,
          },
        },
        fromBed: { include: { ward: true } },
        toBed: { include: { ward: true } },
      },
    });

    if (!transfer) {
      throw new NotFoundException('Bed transfer not found');
    }

    return transfer;
  }

  async findByAdmission(admissionId: string) {
    const transfers = await this.prisma.bedTransfer.findMany({
      where: { admissionId },
      include: {
        admission: {
          include: {
            patient: true,
          },
        },
        fromBed: { include: { ward: true } },
        toBed: { include: { ward: true } },
      },
      orderBy: { transferDate: 'desc' },
    });

    return transfers;
  }

  async update(id: string, updateTransferDto: UpdateTransferDto) {
    const existingTransfer = await this.prisma.bedTransfer.findUnique({
      where: { id },
    });

    if (!existingTransfer) {
      throw new NotFoundException('Bed transfer not found');
    }

    // If changing target bed, validate it
    if (updateTransferDto.toBedId && updateTransferDto.toBedId !== existingTransfer.toBedId) {
      const targetBed = await this.prisma.bed.findUnique({
        where: { id: updateTransferDto.toBedId },
      });

      if (!targetBed) {
        throw new NotFoundException('Target bed not found');
      }

      if (targetBed.isOccupied) {
        throw new BadRequestException('Target bed is already occupied');
      }
    }

    return this.prisma.bedTransfer.update({
      where: { id },
      data: {
        ...(updateTransferDto.toBedId && { toBedId: updateTransferDto.toBedId }),
        ...(updateTransferDto.reason && { reason: updateTransferDto.reason }),
        ...(updateTransferDto.approvedBy && { approvedBy: updateTransferDto.approvedBy }),
        ...(updateTransferDto.transferDate && { 
          transferDate: new Date(updateTransferDto.transferDate) 
        }),
        ...(updateTransferDto.transferTime && { 
          transferTime: updateTransferDto.transferTime 
        }),
        ...(updateTransferDto.notes && { notes: updateTransferDto.notes }),
      },
      include: {
        admission: {
          include: {
            patient: true,
          },
        },
        fromBed: { include: { ward: true } },
        toBed: { include: { ward: true } },
      },
    });
  }

  async remove(id: string) {
    const transfer = await this.prisma.bedTransfer.findUnique({
      where: { id },
    });

    if (!transfer) {
      throw new NotFoundException('Bed transfer not found');
    }

    await this.prisma.bedTransfer.delete({
      where: { id },
    });

    return { message: 'Bed transfer deleted successfully' };
  }

  async getAvailableBeds(wardId: string) {
    // Check if ward exists
    const ward = await this.prisma.ward.findUnique({
      where: { id: wardId },
    });

    if (!ward) {
      throw new NotFoundException('Ward not found');
    }

    const availableBeds = await this.prisma.bed.findMany({
      where: {
        wardId,
        isOccupied: false,
        isActive: true,
      },
      include: {
        ward: true,
      },
      orderBy: { bedNumber: 'asc' },
    });

    return {
      ward,
      availableBeds,
      count: availableBeds.length,
    };
  }
}
