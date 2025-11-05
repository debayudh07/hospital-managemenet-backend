import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVitalsDto, UpdateVitalsDto } from './dto';

@Injectable()
export class VitalsService {
  constructor(private prisma: PrismaService) {}

  async create(createVitalsDto: CreateVitalsDto) {
    // Verify admission exists and is active
    const admission = await this.prisma.admission.findUnique({
      where: { id: createVitalsDto.admissionId },
      include: {
        patient: true,
      },
    });

    if (!admission) {
      throw new NotFoundException('Admission not found');
    }

    if (admission.status === 'DISCHARGED') {
      throw new BadRequestException('Cannot record vitals for discharged patient');
    }

    // Calculate BMI if weight and height are provided
    let calculatedBmi = createVitalsDto.bmi;
    if (!calculatedBmi && createVitalsDto.weight && createVitalsDto.height) {
      const heightInMeters = createVitalsDto.height / 100;
      calculatedBmi = createVitalsDto.weight / (heightInMeters * heightInMeters);
      calculatedBmi = Math.round(calculatedBmi * 100) / 100; // Round to 2 decimal places
    }

    // Create vitals record
    const vitals = await this.prisma.iPDVitals.create({
      data: {
        admissionId: createVitalsDto.admissionId,
        recordedBy: createVitalsDto.recordedBy,
        bloodPressure: createVitalsDto.bloodPressure,
        heartRate: createVitalsDto.heartRate,
        temperature: createVitalsDto.temperature,
        respiratoryRate: createVitalsDto.respiratoryRate,
        oxygenSaturation: createVitalsDto.oxygenSaturation,
        weight: createVitalsDto.weight,
        height: createVitalsDto.height,
        bmi: calculatedBmi,
        urinOutput: createVitalsDto.urinOutput,
        fluidIntake: createVitalsDto.fluidIntake,
        painScale: createVitalsDto.painScale,
        shift: createVitalsDto.shift,
        recordedAt: createVitalsDto.recordedAt 
          ? new Date(createVitalsDto.recordedAt) 
          : new Date(),
        notes: createVitalsDto.notes,
      },
      include: {
        admission: {
          include: {
            patient: true,
          },
        },
      },
    });

    return vitals;
  }

  async findAll(filters: {
    admissionId?: string;
    patientId?: string;
    recordedBy?: string;
    shift?: string;
    recordedDate?: string;
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

    if (filters.recordedBy) {
      where.recordedBy = { contains: filters.recordedBy, mode: 'insensitive' };
    }

    if (filters.shift) {
      where.shift = filters.shift;
    }

    if (filters.recordedDate) {
      const date = new Date(filters.recordedDate);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      
      where.recordedAt = {
        gte: date,
        lt: nextDate,
      };
    }

    const [vitals, total] = await Promise.all([
      this.prisma.iPDVitals.findMany({
        where,
        include: {
          admission: {
            include: {
              patient: true,
            },
          },
        },
        orderBy: { recordedAt: 'desc' },
        skip: filters.offset || 0,
        take: filters.limit || 50,
      }),
      this.prisma.iPDVitals.count({ where }),
    ]);

    return {
      vitals,
      pagination: {
        total,
        limit: filters.limit || 50,
        offset: filters.offset || 0,
        pages: Math.ceil(total / (filters.limit || 50)),
      },
    };
  }

  async findOne(id: string) {
    const vitals = await this.prisma.iPDVitals.findUnique({
      where: { id },
      include: {
        admission: {
          include: {
            patient: true,
          },
        },
      },
    });

    if (!vitals) {
      throw new NotFoundException('Vitals record not found');
    }

    return vitals;
  }

  async findByAdmission(admissionId: string) {
    const vitals = await this.prisma.iPDVitals.findMany({
      where: { admissionId },
      include: {
        admission: {
          include: {
            patient: true,
          },
        },
      },
      orderBy: { recordedAt: 'desc' },
    });

    return vitals;
  }

  async getLatestVitals(admissionId: string) {
    const latestVitals = await this.prisma.iPDVitals.findFirst({
      where: { admissionId },
      include: {
        admission: {
          include: {
            patient: true,
          },
        },
      },
      orderBy: { recordedAt: 'desc' },
    });

    if (!latestVitals) {
      throw new NotFoundException('No vitals records found for this admission');
    }

    return latestVitals;
  }

  async getVitalsChart(admissionId: string) {
    const vitals = await this.prisma.iPDVitals.findMany({
      where: { admissionId },
      orderBy: { recordedAt: 'asc' },
    });

    if (vitals.length === 0) {
      throw new NotFoundException('No vitals records found for this admission');
    }

    // Organize data for charting
    const chartData = vitals.map(v => ({
      recordedAt: v.recordedAt,
      temperature: v.temperature,
      heartRate: v.heartRate,
      respiratoryRate: v.respiratoryRate,
      oxygenSaturation: v.oxygenSaturation,
      systolic: v.bloodPressure ? parseInt(v.bloodPressure.split('/')[0]) : null,
      diastolic: v.bloodPressure ? parseInt(v.bloodPressure.split('/')[1]) : null,
      painScale: v.painScale,
      weight: v.weight,
      shift: v.shift,
    }));

    // Calculate trends and alerts
    const latest = vitals[vitals.length - 1];
    const alerts: Array<{
      type: string;
      severity: string;
      message: string;
    }> = [];

    if (latest.temperature && (latest.temperature > 101 || latest.temperature < 96)) {
      alerts.push({
        type: 'temperature',
        severity: latest.temperature > 103 || latest.temperature < 95 ? 'critical' : 'warning',
        message: `Temperature ${latest.temperature}°F is ${latest.temperature > 101 ? 'high' : 'low'}`,
      });
    }

    if (latest.heartRate && (latest.heartRate > 100 || latest.heartRate < 60)) {
      alerts.push({
        type: 'heartRate',
        severity: latest.heartRate > 120 || latest.heartRate < 50 ? 'critical' : 'warning',
        message: `Heart rate ${latest.heartRate} BPM is ${latest.heartRate > 100 ? 'high' : 'low'}`,
      });
    }

    if (latest.oxygenSaturation && latest.oxygenSaturation < 95) {
      alerts.push({
        type: 'oxygenSaturation',
        severity: latest.oxygenSaturation < 90 ? 'critical' : 'warning',
        message: `Oxygen saturation ${latest.oxygenSaturation}% is low`,
      });
    }

    return {
      chartData,
      alerts,
      totalRecords: vitals.length,
      dateRange: {
        start: vitals[0].recordedAt,
        end: latest.recordedAt,
      },
    };
  }

  async update(id: string, updateVitalsDto: UpdateVitalsDto) {
    const existingVitals = await this.prisma.iPDVitals.findUnique({
      where: { id },
    });

    if (!existingVitals) {
      throw new NotFoundException('Vitals record not found');
    }

    // Calculate BMI if weight and height are provided
    let calculatedBmi = updateVitalsDto.bmi;
    if (!calculatedBmi && updateVitalsDto.weight && updateVitalsDto.height) {
      const heightInMeters = updateVitalsDto.height / 100;
      calculatedBmi = updateVitalsDto.weight / (heightInMeters * heightInMeters);
      calculatedBmi = Math.round(calculatedBmi * 100) / 100;
    }

    const updatedVitals = await this.prisma.iPDVitals.update({
      where: { id },
      data: {
        ...(updateVitalsDto.recordedBy && { recordedBy: updateVitalsDto.recordedBy }),
        ...(updateVitalsDto.bloodPressure && { bloodPressure: updateVitalsDto.bloodPressure }),
        ...(updateVitalsDto.heartRate && { heartRate: updateVitalsDto.heartRate }),
        ...(updateVitalsDto.temperature && { temperature: updateVitalsDto.temperature }),
        ...(updateVitalsDto.respiratoryRate && { respiratoryRate: updateVitalsDto.respiratoryRate }),
        ...(updateVitalsDto.oxygenSaturation && { oxygenSaturation: updateVitalsDto.oxygenSaturation }),
        ...(updateVitalsDto.weight && { weight: updateVitalsDto.weight }),
        ...(updateVitalsDto.height && { height: updateVitalsDto.height }),
        ...(calculatedBmi && { bmi: calculatedBmi }),
        ...(updateVitalsDto.urinOutput && { urinOutput: updateVitalsDto.urinOutput }),
        ...(updateVitalsDto.fluidIntake && { fluidIntake: updateVitalsDto.fluidIntake }),
        ...(updateVitalsDto.painScale && { painScale: updateVitalsDto.painScale }),
        ...(updateVitalsDto.shift && { shift: updateVitalsDto.shift }),
        ...(updateVitalsDto.recordedAt && { recordedAt: new Date(updateVitalsDto.recordedAt) }),
        ...(updateVitalsDto.notes && { notes: updateVitalsDto.notes }),
      },
      include: {
        admission: {
          include: {
            patient: true,
          },
        },
      },
    });

    return updatedVitals;
  }

  async remove(id: string) {
    const vitals = await this.prisma.iPDVitals.findUnique({
      where: { id },
    });

    if (!vitals) {
      throw new NotFoundException('Vitals record not found');
    }

    await this.prisma.iPDVitals.delete({
      where: { id },
    });

    return { message: 'Vitals record deleted successfully' };
  }
}
