import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MedicineRoute } from '@prisma/client';

export interface CreateOPDPrescriptionDto {
  opdVisitId: string;
  doctorId: string;
  drugName: string;
  strength?: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity?: number;
  route?: MedicineRoute;
  instructions?: string;
  notes?: string;
  isGeneric?: boolean;
}

export interface UpdateOPDPrescriptionDto {
  drugName?: string;
  strength?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  quantity?: number;
  route?: MedicineRoute;
  instructions?: string;
  notes?: string;
  isGeneric?: boolean;
}

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  async create(createOPDPrescriptionDto: CreateOPDPrescriptionDto) {
    // Verify OPD visit exists
    const opdVisit = await this.prisma.oPDVisit.findUnique({
      where: { id: createOPDPrescriptionDto.opdVisitId }
    });

    if (!opdVisit) {
      throw new NotFoundException('OPD visit not found');
    }

    // Verify doctor exists
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: createOPDPrescriptionDto.doctorId }
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return this.prisma.oPDPrescription.create({
      data: {
        opdVisitId: createOPDPrescriptionDto.opdVisitId,
        doctorId: createOPDPrescriptionDto.doctorId,
        drugName: createOPDPrescriptionDto.drugName,
        strength: createOPDPrescriptionDto.strength,
        dosage: createOPDPrescriptionDto.dosage,
        frequency: createOPDPrescriptionDto.frequency,
        duration: createOPDPrescriptionDto.duration,
        quantity: createOPDPrescriptionDto.quantity,
        route: createOPDPrescriptionDto.route || MedicineRoute.ORAL,
        instructions: createOPDPrescriptionDto.instructions,
        notes: createOPDPrescriptionDto.notes,
        isGeneric: createOPDPrescriptionDto.isGeneric || false,
      },
      include: {
        opdVisit: {
          include: {
            patient: true,
          }
        },
        doctor: true,
      }
    });
  }

  async findByVisitId(opdVisitId: string) {
    return this.prisma.oPDPrescription.findMany({
      where: { opdVisitId },
      orderBy: { createdAt: 'desc' },
      include: {
        opdVisit: {
          include: {
            patient: true,
          }
        },
        doctor: true,
      }
    });
  }

  async findByPatientId(patientId: string) {
    // Find patient first
    const patient = await this.prisma.patient.findFirst({
      where: {
        OR: [
          { id: patientId },
          { patientId: patientId }
        ]
      }
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.prisma.oPDPrescription.findMany({
      where: {
        opdVisit: {
          patientId: patient.id
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        opdVisit: {
          select: {
            visitId: true,
            visitDate: true,
          }
        },
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            specialization: true,
          }
        },
      }
    });
  }

  async findOne(id: string) {
    const prescription = await this.prisma.oPDPrescription.findUnique({
      where: { id },
      include: {
        opdVisit: {
          include: {
            patient: true,
          }
        },
        doctor: true,
      }
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    return prescription;
  }

  async update(id: string, updateOPDPrescriptionDto: UpdateOPDPrescriptionDto) {
    const existingPrescription = await this.findOne(id);

    return this.prisma.oPDPrescription.update({
      where: { id },
      data: updateOPDPrescriptionDto,
      include: {
        opdVisit: {
          include: {
            patient: true,
          }
        },
        doctor: true,
      }
    });
  }

  async remove(id: string) {
    const existingPrescription = await this.findOne(id);
    
    return this.prisma.oPDPrescription.delete({
      where: { id }
    });
  }

  async searchMedicines(query: string, limit: number = 10) {
    // This could be enhanced to search from a medicine database
    // For now, return recent prescriptions with similar drug names
    return this.prisma.oPDPrescription.findMany({
      where: {
        drugName: {
          contains: query
        }
      },
      select: {
        drugName: true,
        strength: true,
        dosage: true,
        frequency: true,
        duration: true,
        route: true,
        instructions: true,
      },
      distinct: ['drugName'],
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  async getFrequentlyPrescribed(doctorId: string, limit: number = 20) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId }
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return this.prisma.oPDPrescription.groupBy({
      by: ['drugName', 'dosage', 'frequency', 'duration', 'route'],
      where: {
        doctorId: doctorId,
        createdAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
        }
      },
      _count: {
        drugName: true
      },
      orderBy: {
        _count: {
          drugName: 'desc'
        }
      },
      take: limit
    });
  }
}
