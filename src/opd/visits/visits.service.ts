import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOPDVisitDto, UpdateOPDVisitDto, OPDVisitResponseDto } from './dto';
import { 
  VisitType, 
  AppointmentMode, 
  ReferralSource, 
  VisitPriority, 
  VisitStatus,
  PaymentStatus,
  Prisma 
} from '@prisma/client';

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  async create(createOPDVisitDto: CreateOPDVisitDto): Promise<OPDVisitResponseDto> {
    // Check if patient exists or create new one
    let patient;
    if (createOPDVisitDto.patientId) {
      patient = await this.findPatientByIdOrPatientId(createOPDVisitDto.patientId);
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }
    } else if (createOPDVisitDto.patientData) {
      // Check if patient already exists by phone or email
      const existingPatient = await this.prisma.patient.findFirst({
        where: {
          OR: [
            { phone: createOPDVisitDto.patientData.phone },
            ...(createOPDVisitDto.patientData.email 
              ? [{ email: createOPDVisitDto.patientData.email }] 
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
            ...createOPDVisitDto.patientData,
            patientId,
            dateOfBirth: new Date(createOPDVisitDto.patientData.dateOfBirth),
          }
        });
      }
    } else {
      throw new BadRequestException('Either patientId or patientData must be provided');
    }

    // Validate doctor exists
    const doctor = await this.findDoctorByIdOrDoctorId(createOPDVisitDto.doctorId);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Validate department exists
    const department = await this.prisma.department.findUnique({
      where: { id: createOPDVisitDto.departmentId }
    });
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // Generate unique visit ID
    const visitCount = await this.prisma.oPDVisit.count();
    const visitId = `OPD${String(visitCount + 1).padStart(6, '0')}`;

    // Create OPD visit (appointments will be handled via the /appointments/opd-visits endpoint)
    const visitDate = createOPDVisitDto.visitDate ? new Date(createOPDVisitDto.visitDate) : new Date();
    const visitTime = createOPDVisitDto.visitTime || new Date().toTimeString().slice(0, 5);

    // Create OPD visit with all related data
    const opdVisit = await this.prisma.oPDVisit.create({
        data: {
          visitId,
          patientId: patient.id,
          doctorId: doctor.id,
          departmentId: createOPDVisitDto.departmentId,
          visitDate: visitDate,
          visitTime: visitTime,
          visitType: createOPDVisitDto.visitType || VisitType.OPD,
          appointmentMode: createOPDVisitDto.appointmentMode || AppointmentMode.WALK_IN,
          referralSource: createOPDVisitDto.referralSource || ReferralSource.SELF,
          referredBy: createOPDVisitDto.referredBy,
          priority: createOPDVisitDto.priority || VisitPriority.NORMAL,
          status: VisitStatus.PENDING,
        chiefComplaint: createOPDVisitDto.chiefComplaint,
        historyOfPresentIllness: createOPDVisitDto.historyOfPresentIllness ?? undefined,
        pastMedicalHistory: createOPDVisitDto.pastMedicalHistory ?? undefined,
        familyHistory: createOPDVisitDto.familyHistory ?? undefined,
        socialHistory: createOPDVisitDto.socialHistory ?? undefined,
        generalExamination: createOPDVisitDto.generalExamination ?? undefined,
        systemicExamination: createOPDVisitDto.systemicExamination ?? undefined,
        provisionalDiagnosis: createOPDVisitDto.provisionalDiagnosis ?? undefined,
        finalDiagnosis: createOPDVisitDto.finalDiagnosis ?? undefined,
        treatmentPlan: createOPDVisitDto.treatmentPlan ?? undefined,
        followUpDate: createOPDVisitDto.followUpDate ? new Date(createOPDVisitDto.followUpDate) : null,
        followUpInstructions: createOPDVisitDto.followUpInstructions || null,
        investigationRecommendations: createOPDVisitDto.investigationRecommendations || null,
        symptoms: createOPDVisitDto.symptoms || null,
        notes: createOPDVisitDto.notes || null,
        isFollowUp: createOPDVisitDto.isFollowUp || false,
        parentVisitId: createOPDVisitDto.parentVisitId || null,
        
        // Create vitals if provided
        vitals: createOPDVisitDto.vitals ? {
          create: {
            ...createOPDVisitDto.vitals,
            recordedBy: 'system', // You might want to get this from the authenticated user
          }
        } : undefined,

        // Create prescriptions if provided
        prescriptions: createOPDVisitDto.prescriptions ? {
          create: createOPDVisitDto.prescriptions.map(prescription => ({
            ...prescription,
            doctorId: doctor.id,
          }))
        } : undefined,

        // Create investigations if provided
        investigations: createOPDVisitDto.investigations ? {
          create: createOPDVisitDto.investigations.map(investigation => ({
            ...investigation,
            orderedBy: doctor.id,
          }))
        } : undefined,
      },
      include: {
        patient: true,
        doctor: true,
        department: true,
        vitals: true,
        prescriptions: true,
        billing: true,
      }
    });

    return this.mapToResponseDto(opdVisit);
  }

  async findAll(filters?: {
    patientId?: string;
    doctorId?: string;
    departmentId?: string;
    status?: VisitStatus;
    date?: string;
    limit?: number;
    offset?: number;
  }): Promise<OPDVisitResponseDto[]> {
    const where: Prisma.OPDVisitWhereInput = {};

    if (filters?.patientId) {
      const patient = await this.findPatientByIdOrPatientId(filters.patientId);
      if (patient) {
        where.patientId = patient.id;
      }
    }

    if (filters?.doctorId) {
      const doctor = await this.findDoctorByIdOrDoctorId(filters.doctorId);
      if (doctor) {
        where.doctor = { id: doctor.id };
      }
    }

    if (filters?.departmentId) {
      where.department = { id: filters.departmentId };
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.date) {
      const date = new Date(filters.date);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      where.visitDate = {
        gte: date,
        lt: nextDay,
      };
    }

    const opdVisits = await this.prisma.oPDVisit.findMany({
      where,
      include: {
        patient: true,
        doctor: true,
        department: true,
        vitals: true,
        prescriptions: true,
        billing: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: filters?.limit,
      skip: filters?.offset,
    });

    return opdVisits.map(visit => this.mapToResponseDto(visit));
  }

  async findOne(id: string): Promise<OPDVisitResponseDto> {
    const opdVisit = await this.prisma.oPDVisit.findFirst({
      where: {
        OR: [
          { id },
          { visitId: id },
        ]
      },
      include: {
        patient: true,
        doctor: {
          include: {
            primaryDepartment: true,
          }
        },
        department: true,
        vitals: true,
        prescriptions: true,
        billing: true,
        followUpVisits: {
          include: {
            patient: true,
            doctor: true,
          }
        }
      }
    });

    if (!opdVisit) {
      throw new NotFoundException('OPD visit not found');
    }

    return this.mapToResponseDto(opdVisit);
  }

  async update(id: string, updateOPDVisitDto: UpdateOPDVisitDto): Promise<OPDVisitResponseDto> {
    const existingVisit = await this.findOne(id);
    
    const updateData: Prisma.OPDVisitUpdateInput = {};
    
    // Update basic fields
    if (updateOPDVisitDto.visitDate) updateData.visitDate = new Date(updateOPDVisitDto.visitDate);
    if (updateOPDVisitDto.visitTime) updateData.visitTime = updateOPDVisitDto.visitTime;
    if (updateOPDVisitDto.visitType) updateData.visitType = updateOPDVisitDto.visitType;
    if (updateOPDVisitDto.status !== undefined) updateData.status = updateOPDVisitDto.status;
    if (updateOPDVisitDto.chiefComplaint) updateData.chiefComplaint = updateOPDVisitDto.chiefComplaint;
    if (updateOPDVisitDto.provisionalDiagnosis) updateData.provisionalDiagnosis = updateOPDVisitDto.provisionalDiagnosis;
    if (updateOPDVisitDto.finalDiagnosis) updateData.finalDiagnosis = updateOPDVisitDto.finalDiagnosis;
    if (updateOPDVisitDto.treatmentPlan) updateData.treatmentPlan = updateOPDVisitDto.treatmentPlan;
    if (updateOPDVisitDto.notes) updateData.notes = updateOPDVisitDto.notes;

    const updatedVisit = await this.prisma.oPDVisit.update({
      where: { id: existingVisit.id },
      data: updateData,
      include: {
        patient: true,
        doctor: {
          include: {
            primaryDepartment: true,
          }
        },
        department: true,
        vitals: true,
        prescriptions: true,
        billing: true,
      }
    });

    return this.mapToResponseDto(updatedVisit);
  }

  async remove(id: string): Promise<void> {
    const existingVisit = await this.findOne(id);
    
    await this.prisma.oPDVisit.delete({
      where: { id: existingVisit.id }
    });
  }

  async getTodaysVisits(doctorId?: string): Promise<OPDVisitResponseDto[]> {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return this.findAll({
      doctorId,
      date: today.toISOString().split('T')[0],
    });
  }

  async getPatientHistory(patientId: string): Promise<OPDVisitResponseDto[]> {
    return this.findAll({ patientId });
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

  private mapToResponseDto(opdVisit: any): OPDVisitResponseDto {
    return {
      id: opdVisit.id,
      visitId: opdVisit.visitId,
      patientId: opdVisit.patientId,
      doctorId: opdVisit.doctorId,
      departmentId: opdVisit.departmentId,
      visitDate: opdVisit.visitDate,
      visitTime: opdVisit.visitTime,
      visitType: opdVisit.visitType,
      appointmentMode: opdVisit.appointmentMode,
      referralSource: opdVisit.referralSource,
      referredBy: opdVisit.referredBy,
      priority: opdVisit.priority,
      status: opdVisit.status,
      chiefComplaint: opdVisit.chiefComplaint,
      historyOfPresentIllness: opdVisit.historyOfPresentIllness,
      pastMedicalHistory: opdVisit.pastMedicalHistory,
      familyHistory: opdVisit.familyHistory,
      socialHistory: opdVisit.socialHistory,
      generalExamination: opdVisit.generalExamination,
      systemicExamination: opdVisit.systemicExamination,
      provisionalDiagnosis: opdVisit.provisionalDiagnosis,
      finalDiagnosis: opdVisit.finalDiagnosis,
      treatmentPlan: opdVisit.treatmentPlan,
      followUpDate: opdVisit.followUpDate,
      followUpInstructions: opdVisit.followUpInstructions,
      investigationRecommendations: opdVisit.investigationRecommendations,
      symptoms: opdVisit.symptoms,
      notes: opdVisit.notes,
      isFollowUp: opdVisit.isFollowUp,
      parentVisitId: opdVisit.parentVisitId,
      createdAt: opdVisit.createdAt,
      updatedAt: opdVisit.updatedAt,
      patient: opdVisit.patient ? {
        id: opdVisit.patient.id,
        patientId: opdVisit.patient.patientId,
        firstName: opdVisit.patient.firstName,
        lastName: opdVisit.patient.lastName,
        email: opdVisit.patient.email,
        phone: opdVisit.patient.phone,
        dateOfBirth: opdVisit.patient.dateOfBirth,
        gender: opdVisit.patient.gender,
        address: opdVisit.patient.address,
        city: opdVisit.patient.city,
        state: opdVisit.patient.state,
        zipCode: opdVisit.patient.zipCode,
        bloodGroup: opdVisit.patient.bloodGroup,
        allergies: opdVisit.patient.allergies,
        chronicConditions: opdVisit.patient.chronicConditions,
      } : null,
      doctor: opdVisit.doctor ? {
        id: opdVisit.doctor.id,
        doctorId: opdVisit.doctor.doctorId,
        firstName: opdVisit.doctor.firstName,
        lastName: opdVisit.doctor.lastName,
        specialization: opdVisit.doctor.specialization,
        consultationFee: opdVisit.doctor.consultationFee,
      } : null,
      department: opdVisit.department ? {
        id: opdVisit.department.id,
        name: opdVisit.department.name,
        description: opdVisit.department.description,
      } : null,
      vitals: opdVisit.vitals?.map((vital: any) => ({
        id: vital.id,
        bloodPressure: vital.bloodPressure,
        heartRate: vital.heartRate,
        temperature: vital.temperature,
        respiratoryRate: vital.respiratoryRate,
        oxygenSaturation: vital.oxygenSaturation,
        weight: vital.weight,
        height: vital.height,
        bmi: vital.bmi,
        recordedAt: vital.recordedAt,
        recordedBy: vital.recordedBy,
        notes: vital.notes,
      })),
      prescriptions: opdVisit.prescriptions?.map((prescription: any) => ({
        id: prescription.id,
        medicineName: prescription.medicineName,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        quantity: prescription.quantity,
        instructions: prescription.instructions,
        isGeneric: prescription.isGeneric,
        createdAt: prescription.createdAt,
      })),
      billing: opdVisit.billing ? {
        id: opdVisit.billing.id,
        consultationFee: opdVisit.billing.consultationFee,
        additionalCharges: opdVisit.billing.additionalCharges,
        discount: opdVisit.billing.discount,
        tax: opdVisit.billing.tax,
        totalAmount: opdVisit.billing.totalAmount,
        paymentStatus: opdVisit.billing.paymentStatus,
        paymentMethod: opdVisit.billing.paymentMethod,
        paidAmount: opdVisit.billing.paidAmount,
        balanceAmount: opdVisit.billing.balanceAmount,
        transactionId: opdVisit.billing.transactionId,
        paymentDate: opdVisit.billing.paymentDate,
        notes: opdVisit.billing.notes,
      } : null,
    } as OPDVisitResponseDto;
  }

  async getComprehensivePatientData(filters: {
    search?: string;
    date?: string;
    department?: string;
    limit?: number;
    offset?: number;
  }) {
    const { search, date, department, limit = 50, offset = 0 } = filters;

    // Build where clause for filtering
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        {
          patient: {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { phone: { contains: search } },
              { patientId: { contains: search } },
              { email: { contains: search } }
            ]
          }
        }
      ];
    }

    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      whereClause.visitDate = {
        gte: targetDate,
        lt: nextDay
      };
    }

    if (department) {
      whereClause.department = {
        name: { contains: department }
      };
    }

    // Get comprehensive OPD data
    const opdVisits = await this.prisma.oPDVisit.findMany({
      where: whereClause,
      include: {
        patient: true,
        doctor: {
          include: {
            departments: {
              include: {
                department: true
              }
            }
          }
        },
        department: true,
        vitals: true,
        prescriptions: {
          include: {
            doctor: {
              select: {
                firstName: true,
                lastName: true,
                specialization: true
              }
            }
          }
        },
        investigations: true,
        billing: true,
        followUpVisits: {
          include: {
            patient: true,
            doctor: true
          }
        }
      },
      orderBy: [
        { visitDate: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await this.prisma.oPDVisit.count({ where: whereClause });

    // Transform data to include comprehensive patient information
    const comprehensiveData = opdVisits.map(visit => {
      // Calculate age from date of birth
      const age = new Date().getFullYear() - new Date(visit.patient.dateOfBirth).getFullYear();
      
      return {
        // Patient Information
        patient: {
          id: visit.patient.id,
          patientId: visit.patient.patientId,
          firstName: visit.patient.firstName,
          lastName: visit.patient.lastName,
          fullName: `${visit.patient.firstName} ${visit.patient.lastName}`,
          email: visit.patient.email,
          phone: visit.patient.phone,
          age: age,
          gender: visit.patient.gender,
          dateOfBirth: visit.patient.dateOfBirth,
          address: visit.patient.address,
          city: visit.patient.city,
          state: visit.patient.state,
          zipCode: visit.patient.zipCode,
          bloodGroup: visit.patient.bloodGroup,
          allergies: visit.patient.allergies,
          guardianName: visit.patient.guardianName,
          guardianRelation: visit.patient.guardianRelation,
          occupation: visit.patient.occupation,
          idProofType: visit.patient.idProofType,
          idProofNumber: visit.patient.idProofNumber,
          patientType: visit.patient.patientType,
          emergencyContact: {
            name: visit.patient.emergencyContactName,
            phone: visit.patient.emergencyContactPhone,
            relationship: visit.patient.emergencyContactRelationship
          },
          insurance: {
            provider: visit.patient.insuranceProvider,
            policyNumber: visit.patient.insurancePolicyNumber
          },
          medicalHistory: {
            chronicConditions: visit.patient.chronicConditions,
            currentMedications: visit.patient.currentMedications
          }
        },
        
        // Visit Information
        visit: {
          id: visit.id,
          visitId: visit.visitId,
          visitDate: visit.visitDate,
          visitTime: visit.visitTime,
          visitType: visit.visitType,
          appointmentMode: visit.appointmentMode,
          referralSource: visit.referralSource,
          referredBy: visit.referredBy,
          priority: visit.priority,
          status: visit.status,
          isFollowUp: visit.isFollowUp,
          followUpDate: visit.followUpDate,
          followUpInstructions: visit.followUpInstructions
        },

        // Clinical Information
        clinical: {
          chiefComplaint: visit.chiefComplaint,
          historyOfPresentIllness: visit.historyOfPresentIllness,
          pastMedicalHistory: visit.pastMedicalHistory,
          familyHistory: visit.familyHistory,
          socialHistory: visit.socialHistory,
          generalExamination: visit.generalExamination,
          systemicExamination: visit.systemicExamination,
          provisionalDiagnosis: visit.provisionalDiagnosis,
          finalDiagnosis: visit.finalDiagnosis,
          treatmentPlan: visit.treatmentPlan,
          symptoms: visit.symptoms,
          notes: visit.notes
        },

        // Doctor Information
        doctor: {
          id: visit.doctor.id,
          doctorId: visit.doctor.doctorId,
          name: `Dr. ${visit.doctor.firstName} ${visit.doctor.lastName}`,
          specialization: visit.doctor.specialization,
          phone: visit.doctor.phone,
          email: visit.doctor.email,
          departments: visit.doctor.departments.map(dept => dept.department.name)
        },

        // Department Information
        department: {
          id: visit.department.id,
          name: visit.department.name,
          description: visit.department.description
        },

        // Vitals
        vitals: visit.vitals.map(vital => ({
          id: vital.id,
          bloodPressure: vital.bloodPressure,
          heartRate: vital.heartRate,
          temperature: vital.temperature,
          respiratoryRate: vital.respiratoryRate,
          oxygenSaturation: vital.oxygenSaturation,
          weight: vital.weight,
          height: vital.height,
          bmi: vital.bmi,
          recordedAt: vital.recordedAt,
          recordedBy: vital.recordedBy,
          notes: vital.notes
        })),

        // Prescriptions
        prescriptions: visit.prescriptions.map(prescription => ({
          id: prescription.id,
          drugName: prescription.drugName,
          strength: prescription.strength,
          dosage: prescription.dosage,
          frequency: prescription.frequency,
          duration: prescription.duration,
          route: prescription.route,
          instructions: prescription.instructions,
          notes: prescription.notes,
          quantity: prescription.quantity,
          isGeneric: prescription.isGeneric,
          prescribedBy: prescription.doctor ? 
            `Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName}` : null,
          prescribedAt: prescription.createdAt
        })),

        // Investigations
        investigations: visit.investigations?.map(investigation => ({
          id: investigation.id,
          testName: investigation.testName,
          testType: investigation.testType,
          urgency: investigation.urgency,
          instructions: investigation.instructions,
          status: investigation.status,
          orderedBy: investigation.orderedBy,
          orderedAt: investigation.createdAt
        })) || [],

        // Billing Information
        billing: visit.billing ? {
          id: visit.billing.id,
          consultationFee: visit.billing.consultationFee,
          additionalCharges: visit.billing.additionalCharges,
          discount: visit.billing.discount,
          tax: visit.billing.tax,
          totalAmount: visit.billing.totalAmount,
          paymentStatus: visit.billing.paymentStatus,
          paymentMethod: visit.billing.paymentMethod,
          paidAmount: visit.billing.paidAmount,
          balanceAmount: visit.billing.balanceAmount,
          transactionId: visit.billing.transactionId,
          paymentDate: visit.billing.paymentDate,
          notes: visit.billing.notes
        } : null,

        // Follow-up visits
        followUpVisits: visit.followUpVisits.map(followUp => ({
          id: followUp.id,
          visitId: followUp.visitId,
          visitDate: followUp.visitDate,
          status: followUp.status,
          doctor: `Dr. ${followUp.doctor.firstName} ${followUp.doctor.lastName}`,
          chiefComplaint: followUp.chiefComplaint
        })),

        // Missing IPD data placeholders (for future implementation)
        ipdData: {
          hasAdmissions: false,
          admissions: [],
          // This will be populated when IPD integration is complete
          note: "IPD data integration pending"
        }
      };
    });

    return {
      data: comprehensiveData,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasNext: offset + limit < totalCount,
        hasPrevious: offset > 0
      }
    };
  }
}
