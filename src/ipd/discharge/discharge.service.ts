import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDischargeDto, UpdateDischargeDto } from './dto';
import { AdmissionStatus } from '@prisma/client';

@Injectable()
export class DischargeService {
  constructor(private prisma: PrismaService) {}

  async create(createDischargeDto: CreateDischargeDto) {
    // Check if admission exists and is not already discharged
    const admission = await this.prisma.admission.findUnique({
      where: { id: createDischargeDto.admissionId },
      include: {
        patient: true,
        doctor: true,
        bed: { include: { ward: true } },
        discharge: true,
      },
    });

    if (!admission) {
      throw new NotFoundException('Admission not found');
    }

    if (admission.discharge) {
      throw new BadRequestException('Patient is already discharged');
    }

    // Verify doctor exists
    const doctor = await this.prisma.doctor.findFirst({
      where: {
        OR: [
          { id: createDischargeDto.doctorId },
          { doctorId: createDischargeDto.doctorId }
        ]
      }
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Create discharge record with transaction
    return this.prisma.$transaction(async (prisma) => {
      // Create discharge record
      const discharge = await prisma.discharge.create({
        data: {
          admissionId: createDischargeDto.admissionId,
          doctorId: doctor.id,
          dischargeDate: createDischargeDto.dischargeDate 
            ? new Date(createDischargeDto.dischargeDate) 
            : new Date(),
          dischargeTime: createDischargeDto.dischargeTime || 
            new Date().toTimeString().slice(0, 5),
          dischargeType: createDischargeDto.dischargeType || 'Normal',
          finalDiagnosis: createDischargeDto.finalDiagnosis,
          treatmentSummary: createDischargeDto.treatmentSummary,
          conditionAtDischarge: createDischargeDto.conditionAtDischarge,
          followUpInstructions: createDischargeDto.followUpInstructions,
          followUpDate: createDischargeDto.followUpDate 
            ? new Date(createDischargeDto.followUpDate) 
            : null,
          restrictions: createDischargeDto.restrictions,
          notes: createDischargeDto.notes,
        },
        include: {
          admission: {
            include: {
              patient: true,
              doctor: true,
              bed: { include: { ward: true } },
            },
          },
          doctor: true,
        },
      });

      // Add discharge medications if provided
      if (createDischargeDto.medications && createDischargeDto.medications.length > 0) {
        await prisma.dischargeMedication.createMany({
          data: createDischargeDto.medications.map(med => ({
            dischargeId: discharge.id,
            medicineName: med.medicineName,
            dosage: med.dosage,
            frequency: med.frequency,
            duration: med.duration,
            instructions: med.instructions,
          })),
        });
      }

      // Update admission status to discharged
      await prisma.admission.update({
        where: { id: createDischargeDto.admissionId },
        data: {
          status: AdmissionStatus.DISCHARGED,
          actualDischargeDate: discharge.dischargeDate,
        },
      });

      // Free up the bed
      await prisma.bed.update({
        where: { id: admission.bedId },
        data: { isOccupied: false },
      });

      // Update ward available beds count
      await prisma.ward.update({
        where: { id: admission.bed.wardId },
        data: { availableBeds: { increment: 1 } },
      });

      // Return complete discharge record with medications
      return this.findOne(discharge.id);
    });
  }

  async findAll(filters: {
    patientId?: string;
    doctorId?: string;
    dischargeDate?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    // Build filters
    if (filters.patientId) {
      where.admission = { patientId: filters.patientId };
    }

    if (filters.doctorId) {
      where.doctorId = filters.doctorId;
    }

    if (filters.dischargeDate) {
      const date = new Date(filters.dischargeDate);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      
      where.dischargeDate = {
        gte: date,
        lt: nextDate,
      };
    }

    const [discharges, total] = await Promise.all([
      this.prisma.discharge.findMany({
        where,
        include: {
          admission: {
            include: {
              patient: true,
              bed: { include: { ward: true } },
            },
          },
          doctor: true,
          medications: true,
        },
        orderBy: { dischargeDate: 'desc' },
        skip: filters.offset || 0,
        take: filters.limit || 50,
      }),
      this.prisma.discharge.count({ where }),
    ]);

    return {
      discharges,
      pagination: {
        total,
        limit: filters.limit || 50,
        offset: filters.offset || 0,
        pages: Math.ceil(total / (filters.limit || 50)),
      },
    };
  }

  async findOne(id: string) {
    const discharge = await this.prisma.discharge.findUnique({
      where: { id },
      include: {
        admission: {
          include: {
            patient: true,
            doctor: true,
            bed: { include: { ward: true } },
          },
        },
        doctor: true,
        medications: true,
      },
    });

    if (!discharge) {
      throw new NotFoundException('Discharge record not found');
    }

    return discharge;
  }

  async findByAdmission(admissionId: string) {
    const discharge = await this.prisma.discharge.findUnique({
      where: { admissionId },
      include: {
        admission: {
          include: {
            patient: true,
            doctor: true,
            bed: { include: { ward: true } },
          },
        },
        doctor: true,
        medications: true,
      },
    });

    if (!discharge) {
      throw new NotFoundException('Discharge record not found for this admission');
    }

    return discharge;
  }

  async update(id: string, updateDischargeDto: UpdateDischargeDto) {
    const existingDischarge = await this.prisma.discharge.findUnique({
      where: { id },
    });

    if (!existingDischarge) {
      throw new NotFoundException('Discharge record not found');
    }

    // If doctor ID is being updated, verify the new doctor exists
    if (updateDischargeDto.doctorId) {
      const doctor = await this.prisma.doctor.findFirst({
        where: {
          OR: [
            { id: updateDischargeDto.doctorId },
            { doctorId: updateDischargeDto.doctorId }
          ]
        }
      });

      if (!doctor) {
        throw new NotFoundException('Doctor not found');
      }
      updateDischargeDto.doctorId = doctor.id;
    }

    return this.prisma.$transaction(async (prisma) => {
      // Update discharge record
      const updatedDischarge = await prisma.discharge.update({
        where: { id },
        data: {
          ...(updateDischargeDto.doctorId && { doctorId: updateDischargeDto.doctorId }),
          ...(updateDischargeDto.dischargeDate && { 
            dischargeDate: new Date(updateDischargeDto.dischargeDate) 
          }),
          ...(updateDischargeDto.dischargeTime && { 
            dischargeTime: updateDischargeDto.dischargeTime 
          }),
          ...(updateDischargeDto.dischargeType && { 
            dischargeType: updateDischargeDto.dischargeType 
          }),
          ...(updateDischargeDto.finalDiagnosis && { 
            finalDiagnosis: updateDischargeDto.finalDiagnosis 
          }),
          ...(updateDischargeDto.treatmentSummary && { 
            treatmentSummary: updateDischargeDto.treatmentSummary 
          }),
          ...(updateDischargeDto.conditionAtDischarge && { 
            conditionAtDischarge: updateDischargeDto.conditionAtDischarge 
          }),
          ...(updateDischargeDto.followUpInstructions && { 
            followUpInstructions: updateDischargeDto.followUpInstructions 
          }),
          ...(updateDischargeDto.followUpDate && { 
            followUpDate: new Date(updateDischargeDto.followUpDate) 
          }),
          ...(updateDischargeDto.restrictions && { 
            restrictions: updateDischargeDto.restrictions 
          }),
          ...(updateDischargeDto.notes && { 
            notes: updateDischargeDto.notes 
          }),
        },
      });

      // Update medications if provided
      if (updateDischargeDto.medications) {
        // Delete existing medications
        await prisma.dischargeMedication.deleteMany({
          where: { dischargeId: id },
        });

        // Create new medications
        if (updateDischargeDto.medications.length > 0) {
          await prisma.dischargeMedication.createMany({
            data: updateDischargeDto.medications.map(med => ({
              dischargeId: id,
              medicineName: med.medicineName,
              dosage: med.dosage,
              frequency: med.frequency,
              duration: med.duration,
              instructions: med.instructions,
            })),
          });
        }
      }

      return this.findOne(id);
    });
  }

  async remove(id: string) {
    const discharge = await this.prisma.discharge.findUnique({
      where: { id },
      include: { admission: true },
    });

    if (!discharge) {
      throw new NotFoundException('Discharge record not found');
    }

    return this.prisma.$transaction(async (prisma) => {
      // Delete discharge medications first
      await prisma.dischargeMedication.deleteMany({
        where: { dischargeId: id },
      });

      // Delete discharge record
      await prisma.discharge.delete({
        where: { id },
      });

      // Revert admission status if needed
      await prisma.admission.update({
        where: { id: discharge.admissionId },
        data: {
          status: AdmissionStatus.STABLE,
          actualDischargeDate: null,
        },
      });

      return { message: 'Discharge record deleted successfully' };
    });
  }

  async prepareDischarge(admissionId: string) {
    // Get admission details with all related information
    const admission = await this.prisma.admission.findUnique({
      where: { id: admissionId },
      include: {
        patient: true,
        doctor: true,
        bed: { include: { ward: true } },
        vitals: {
          orderBy: { recordedAt: 'desc' },
          take: 10,
        },
        treatments: {
          include: { doctor: true },
          orderBy: { createdAt: 'desc' },
        },
        discharge: true,
      },
    });

    if (!admission) {
      throw new NotFoundException('Admission not found');
    }

    if (admission.discharge) {
      throw new BadRequestException('Patient is already discharged');
    }

    // Calculate estimated charges
    const admissionDate = new Date(admission.admissionDate);
    const currentDate = new Date();
    const daysStayed = Math.ceil(
      (currentDate.getTime() - admissionDate.getTime()) / (1000 * 3600 * 24)
    );

    const bedCharges = (admission.bed.dailyRate || 1000) * daysStayed;
    const consultationCharges = admission.doctor.consultationFee * daysStayed;
    const medicationCharges = admission.treatments
      .filter(t => t.type === 'MEDICATION')
      .length * 100; // Estimated medication cost
    
    const totalCharges = bedCharges + consultationCharges + medicationCharges;

    return {
      admission,
      estimatedCharges: {
        daysStayed,
        bedCharges,
        consultationCharges,
        medicationCharges,
        totalCharges,
      },
      readyForDischarge: admission.status !== 'CRITICAL',
    };
  }
}
