import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdmissionDto, UpdateAdmissionDto } from './dto';
import { 
  AdmissionType, 
  AdmissionStatus,
  PaymentStatus 
} from '@prisma/client';

@Injectable()
export class AdmissionsService {
  constructor(private prisma: PrismaService) {}

  async create(createAdmissionDto: CreateAdmissionDto) {
    // Check if patient exists or create new one
    let patient;
    if (createAdmissionDto.patientId) {
      patient = await this.findPatientByIdOrPatientId(createAdmissionDto.patientId);
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }
    } else if (createAdmissionDto.patientData) {
      // Check if patient already exists by phone or email
      const existingPatient = await this.prisma.patient.findFirst({
        where: {
          OR: [
            { phone: createAdmissionDto.patientData.phone },
            ...(createAdmissionDto.patientData.email 
              ? [{ email: createAdmissionDto.patientData.email }] 
              : [])
          ]
        }
      });

      if (existingPatient) {
        patient = existingPatient;
      } else {
        // Generate unique patient ID
        const patientCount = await this.prisma.patient.count();
        const patientId = `PAT${String(patientCount + 1).padStart(6, '0')}`;

        patient = await this.prisma.patient.create({
          data: {
            ...createAdmissionDto.patientData,
            patientId,
            dateOfBirth: new Date(createAdmissionDto.patientData.dateOfBirth),
          }
        });
      }
    } else {
      throw new BadRequestException('Either patientId or patientData must be provided');
    }

    // Validate doctor exists
    const doctor = await this.findDoctorByIdOrDoctorId(createAdmissionDto.doctorId);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Validate bed exists and is available
    const bed = await this.prisma.bed.findUnique({
      where: { id: createAdmissionDto.bedId },
      include: { ward: true }
    });

    if (!bed) {
      throw new NotFoundException('Bed not found');
    }

    if (bed.isOccupied) {
      throw new BadRequestException('Bed is already occupied');
    }

    // Generate unique admission ID
    const admissionCount = await this.prisma.admission.count();
    const admissionId = `ADM${String(admissionCount + 1).padStart(6, '0')}`;

    // Create admission with transaction to ensure data consistency
    return this.prisma.$transaction(async (prisma) => {
      // Mark bed as occupied
      await prisma.bed.update({
        where: { id: createAdmissionDto.bedId },
        data: { isOccupied: true }
      });

      // Update ward available beds count
      await prisma.ward.update({
        where: { id: bed.wardId },
        data: { availableBeds: { decrement: 1 } }
      });

      // Create admission
      const admission = await prisma.admission.create({
        data: {
          admissionId,
          patientId: patient.id,
          doctorId: doctor.id,
          bedId: createAdmissionDto.bedId,
          admissionDate: createAdmissionDto.admissionDate ? new Date(createAdmissionDto.admissionDate) : new Date(),
          admissionTime: createAdmissionDto.admissionTime || new Date().toTimeString().slice(0, 5),
          admissionType: createAdmissionDto.admissionType,
          category: createAdmissionDto.category,
          referralSource: createAdmissionDto.referralSource,
          referredBy: createAdmissionDto.referredBy,
          chiefComplaint: createAdmissionDto.chiefComplaint,
          presentIllness: createAdmissionDto.presentIllness,
          pastHistory: createAdmissionDto.pastHistory,
          familyHistory: createAdmissionDto.familyHistory,
          personalHistory: createAdmissionDto.personalHistory,
          generalCondition: createAdmissionDto.generalCondition,
          consciousness: createAdmissionDto.consciousness,
          provisionalDiagnosis: createAdmissionDto.provisionalDiagnosis,
          finalDiagnosis: createAdmissionDto.finalDiagnosis,
          treatmentPlan: createAdmissionDto.treatmentPlan,
          status: AdmissionStatus.STABLE,
          expectedDischargeDate: createAdmissionDto.expectedDischargeDate ? new Date(createAdmissionDto.expectedDischargeDate) : null,
          estimatedCost: createAdmissionDto.estimatedCost,
          depositAmount: createAdmissionDto.depositAmount,
          emergencyContact: createAdmissionDto.emergencyContact,
          insuranceDetails: createAdmissionDto.insuranceDetails,
          notes: createAdmissionDto.notes,
          
          // Create initial vitals if provided
          vitals: createAdmissionDto.initialVitals ? {
            create: {
              ...createAdmissionDto.initialVitals,
              recordedBy: 'system', // You might want to get this from the authenticated user
            }
          } : undefined,
        },
        include: {
          patient: true,
          doctor: true,
          bed: {
            include: {
              ward: true
            }
          },
          vitals: true,
        }
      });

      return admission;
    });
  }

  async findAll(filters?: {
    patientId?: string;
    doctorId?: string;
    wardId?: string;
    status?: AdmissionStatus;
    admissionDate?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters?.patientId) {
      const patient = await this.findPatientByIdOrPatientId(filters.patientId);
      if (patient) {
        where.patientId = patient.id;
      }
    }

    if (filters?.doctorId) {
      const doctor = await this.findDoctorByIdOrDoctorId(filters.doctorId);
      if (doctor) {
        where.doctorId = doctor.id;
      }
    }

    if (filters?.wardId) {
      where.bed = {
        wardId: filters.wardId
      };
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.admissionDate) {
      const date = new Date(filters.admissionDate);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      where.admissionDate = {
        gte: date,
        lt: nextDay,
      };
    }

    return this.prisma.admission.findMany({
      where,
      include: {
        patient: true,
        doctor: true,
        bed: {
          include: {
            ward: true
          }
        },
        vitals: {
          orderBy: { recordedAt: 'desc' },
          take: 1
        },
        treatments: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: filters?.limit,
      skip: filters?.offset,
    });
  }

  async findOne(id: string) {
    const admission = await this.prisma.admission.findFirst({
      where: {
        OR: [
          { id },
          { admissionId: id },
        ]
      },
      include: {
        patient: true,
        doctor: true,
        bed: {
          include: {
            ward: true
          }
        },
        vitals: {
          orderBy: { recordedAt: 'desc' }
        },
        treatments: {
          orderBy: { createdAt: 'desc' }
        },
        transfers: {
          orderBy: { transferDate: 'desc' }
        },
        discharge: true
      }
    });

    if (!admission) {
      throw new NotFoundException('Admission not found');
    }

    return admission;
  }

  async update(id: string, updateAdmissionDto: UpdateAdmissionDto) {
    const existingAdmission = await this.findOne(id);
    
    return this.prisma.admission.update({
      where: { id: existingAdmission.id },
      data: {
        ...updateAdmissionDto,
        expectedDischargeDate: updateAdmissionDto.expectedDischargeDate ? new Date(updateAdmissionDto.expectedDischargeDate) : undefined,
      },
      include: {
        patient: true,
        doctor: true,
        bed: {
          include: {
            ward: true
          }
        },
        vitals: {
          orderBy: { recordedAt: 'desc' },
          take: 5
        },
        treatments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  async getActiveAdmissions() {
    return this.findAll({
      status: AdmissionStatus.STABLE
    });
  }

  async getPatientAdmissions(patientId: string) {
    return this.findAll({ patientId });
  }

  async getWardAdmissions(wardId: string) {
    return this.findAll({ wardId });
  }

  // Helper methods
  private async findPatientByIdOrPatientId(id: string) {
    return this.prisma.patient.findFirst({
      where: {
        OR: [
          { id },
          { patientId: id },
        ]
      }
    });
  }

  private async findDoctorByIdOrDoctorId(id: string) {
    return this.prisma.doctor.findFirst({
      where: {
        OR: [
          { id },
          { doctorId: id },
        ]
      }
    });
  }
}
