import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateOPDVitalsDto {
  opdVisitId: string;
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  recordedBy: string;
  notes?: string;
}

export interface UpdateOPDVitalsDto {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  notes?: string;
}

@Injectable()
export class VitalsService {
  constructor(private prisma: PrismaService) {}

  async create(createOPDVitalsDto: CreateOPDVitalsDto) {
    // Verify OPD visit exists
    const opdVisit = await this.prisma.oPDVisit.findUnique({
      where: { id: createOPDVitalsDto.opdVisitId }
    });

    if (!opdVisit) {
      throw new NotFoundException('OPD visit not found');
    }

    // Calculate BMI if weight and height are provided
    let bmi = createOPDVitalsDto.bmi;
    if (!bmi && createOPDVitalsDto.weight && createOPDVitalsDto.height) {
      const heightInMeters = createOPDVitalsDto.height / 100;
      bmi = parseFloat((createOPDVitalsDto.weight / (heightInMeters * heightInMeters)).toFixed(2));
    }

    return this.prisma.oPDVitals.create({
      data: {
        opdVisitId: createOPDVitalsDto.opdVisitId,
        bloodPressure: createOPDVitalsDto.bloodPressure,
        heartRate: createOPDVitalsDto.heartRate,
        temperature: createOPDVitalsDto.temperature,
        respiratoryRate: createOPDVitalsDto.respiratoryRate,
        oxygenSaturation: createOPDVitalsDto.oxygenSaturation,
        weight: createOPDVitalsDto.weight,
        height: createOPDVitalsDto.height,
        bmi: bmi,
        recordedBy: createOPDVitalsDto.recordedBy,
        notes: createOPDVitalsDto.notes,
      },
      include: {
        opdVisit: {
          include: {
            patient: true,
          }
        }
      }
    });
  }

  async findByVisitId(opdVisitId: string) {
    return this.prisma.oPDVitals.findMany({
      where: { opdVisitId },
      orderBy: { recordedAt: 'desc' },
      include: {
        opdVisit: {
          include: {
            patient: true,
          }
        }
      }
    });
  }

  async findOne(id: string) {
    const vitals = await this.prisma.oPDVitals.findUnique({
      where: { id },
      include: {
        opdVisit: {
          include: {
            patient: true,
          }
        }
      }
    });

    if (!vitals) {
      throw new NotFoundException('Vitals record not found');
    }

    return vitals;
  }

  async update(id: string, updateOPDVitalsDto: UpdateOPDVitalsDto) {
    const existingVitals = await this.findOne(id);

    // Calculate BMI if weight and height are provided
    let bmi = updateOPDVitalsDto.bmi;
    const weight = updateOPDVitalsDto.weight ?? existingVitals.weight;
    const height = updateOPDVitalsDto.height ?? existingVitals.height;
    
    if (!bmi && weight && height) {
      const heightInMeters = height / 100;
      bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
    }

    return this.prisma.oPDVitals.update({
      where: { id },
      data: {
        ...updateOPDVitalsDto,
        bmi,
      },
      include: {
        opdVisit: {
          include: {
            patient: true,
          }
        }
      }
    });
  }

  async remove(id: string) {
    const existingVitals = await this.findOne(id);
    
    return this.prisma.oPDVitals.delete({
      where: { id }
    });
  }

  async getVitalsTrends(patientId: string, days: number = 30) {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    return this.prisma.oPDVitals.findMany({
      where: {
        opdVisit: {
          patient: {
            OR: [
              { id: patientId },
              { patientId: patientId }
            ]
          }
        },
        recordedAt: {
          gte: fromDate
        }
      },
      orderBy: { recordedAt: 'asc' },
      include: {
        opdVisit: {
          select: {
            visitDate: true,
            visitId: true,
          }
        }
      }
    });
  }
}
