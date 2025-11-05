import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTreatmentDto, UpdateTreatmentDto } from './dto';
import { TreatmentStatus } from '@prisma/client';

@Injectable()
export class TreatmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createTreatmentDto: CreateTreatmentDto) {
    // Verify admission exists and is active
    const admission = await this.prisma.admission.findUnique({
      where: { id: createTreatmentDto.admissionId },
      include: {
        patient: true,
      },
    });

    if (!admission) {
      throw new NotFoundException('Admission not found');
    }

    if (admission.status === 'DISCHARGED') {
      throw new BadRequestException('Cannot add treatment to discharged patient');
    }

    // Verify doctor exists
    const doctor = await this.prisma.doctor.findFirst({
      where: {
        OR: [
          { id: createTreatmentDto.doctorId },
          { doctorId: createTreatmentDto.doctorId }
        ]
      }
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Create treatment record
    const treatment = await this.prisma.treatment.create({
      data: {
        admissionId: createTreatmentDto.admissionId,
        doctorId: doctor.id,
        type: createTreatmentDto.type,
        description: createTreatmentDto.description,
        medication: createTreatmentDto.medication,
        dosage: createTreatmentDto.dosage,
        frequency: createTreatmentDto.frequency,
        route: createTreatmentDto.route,
        startDate: createTreatmentDto.startDate 
          ? new Date(createTreatmentDto.startDate) 
          : new Date(),
        endDate: createTreatmentDto.endDate 
          ? new Date(createTreatmentDto.endDate) 
          : null,
        status: TreatmentStatus.ACTIVE,
        notes: createTreatmentDto.notes,
      },
      include: {
        admission: {
          include: {
            patient: true,
          },
        },
        doctor: true,
      },
    });

    return treatment;
  }

  async findAll(filters: {
    admissionId?: string;
    patientId?: string;
    doctorId?: string;
    type?: string;
    status?: string;
    startDate?: string;
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

    if (filters.doctorId) {
      where.doctorId = filters.doctorId;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate) {
      const date = new Date(filters.startDate);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      
      where.startDate = {
        gte: date,
        lt: nextDate,
      };
    }

    const [treatments, total] = await Promise.all([
      this.prisma.treatment.findMany({
        where,
        include: {
          admission: {
            include: {
              patient: true,
            },
          },
          doctor: true,
        },
        orderBy: { startDate: 'desc' },
        skip: filters.offset || 0,
        take: filters.limit || 50,
      }),
      this.prisma.treatment.count({ where }),
    ]);

    return {
      treatments,
      pagination: {
        total,
        limit: filters.limit || 50,
        offset: filters.offset || 0,
        pages: Math.ceil(total / (filters.limit || 50)),
      },
    };
  }

  async findOne(id: string) {
    const treatment = await this.prisma.treatment.findUnique({
      where: { id },
      include: {
        admission: {
          include: {
            patient: true,
          },
        },
        doctor: true,
      },
    });

    if (!treatment) {
      throw new NotFoundException('Treatment not found');
    }

    return treatment;
  }

  async findByAdmission(admissionId: string) {
    const treatments = await this.prisma.treatment.findMany({
      where: { admissionId },
      include: {
        admission: {
          include: {
            patient: true,
          },
        },
        doctor: true,
      },
      orderBy: { startDate: 'desc' },
    });

    return treatments;
  }

  async update(id: string, updateTreatmentDto: UpdateTreatmentDto) {
    const existingTreatment = await this.prisma.treatment.findUnique({
      where: { id },
    });

    if (!existingTreatment) {
      throw new NotFoundException('Treatment not found');
    }

    // If doctor ID is being updated, verify the new doctor exists
    if (updateTreatmentDto.doctorId) {
      const doctor = await this.prisma.doctor.findFirst({
        where: {
          OR: [
            { id: updateTreatmentDto.doctorId },
            { doctorId: updateTreatmentDto.doctorId }
          ]
        }
      });

      if (!doctor) {
        throw new NotFoundException('Doctor not found');
      }
      updateTreatmentDto.doctorId = doctor.id;
    }

    const updatedTreatment = await this.prisma.treatment.update({
      where: { id },
      data: {
        ...(updateTreatmentDto.doctorId && { doctorId: updateTreatmentDto.doctorId }),
        ...(updateTreatmentDto.type && { type: updateTreatmentDto.type }),
        ...(updateTreatmentDto.description && { description: updateTreatmentDto.description }),
        ...(updateTreatmentDto.medication && { medication: updateTreatmentDto.medication }),
        ...(updateTreatmentDto.dosage && { dosage: updateTreatmentDto.dosage }),
        ...(updateTreatmentDto.frequency && { frequency: updateTreatmentDto.frequency }),
        ...(updateTreatmentDto.route && { route: updateTreatmentDto.route }),
        ...(updateTreatmentDto.startDate && { 
          startDate: new Date(updateTreatmentDto.startDate) 
        }),
        ...(updateTreatmentDto.endDate && { 
          endDate: new Date(updateTreatmentDto.endDate) 
        }),
        ...(updateTreatmentDto.notes && { notes: updateTreatmentDto.notes }),
      },
      include: {
        admission: {
          include: {
            patient: true,
          },
        },
        doctor: true,
      },
    });

    return updatedTreatment;
  }

  async remove(id: string) {
    const treatment = await this.prisma.treatment.findUnique({
      where: { id },
    });

    if (!treatment) {
      throw new NotFoundException('Treatment not found');
    }

    await this.prisma.treatment.delete({
      where: { id },
    });

    return { message: 'Treatment deleted successfully' };
  }

  async updateStatus(id: string, status: string, endDate?: string, notes?: string) {
    const treatment = await this.prisma.treatment.findUnique({
      where: { id },
    });

    if (!treatment) {
      throw new NotFoundException('Treatment not found');
    }

    // Validate status
    const validStatuses = Object.values(TreatmentStatus);
    if (!validStatuses.includes(status as TreatmentStatus)) {
      throw new BadRequestException('Invalid treatment status');
    }

    const updatedTreatment = await this.prisma.treatment.update({
      where: { id },
      data: {
        status: status as TreatmentStatus,
        ...(endDate && { endDate: new Date(endDate) }),
        ...(notes && { notes }),
      },
      include: {
        admission: {
          include: {
            patient: true,
          },
        },
        doctor: true,
      },
    });

    return updatedTreatment;
  }
}
