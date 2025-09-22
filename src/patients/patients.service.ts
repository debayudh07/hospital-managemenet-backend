import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientResponseDto } from './dto/patient-response.dto';
import { UserRole, Gender } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async create(createPatientDto: CreatePatientDto): Promise<PatientResponseDto> {
    // Check if patient with email already exists
    const existingPatient = await this.prisma.patient.findFirst({
      where: { email: createPatientDto.email },
    });

    if (existingPatient) {
      throw new ConflictException('Patient with this email already exists');
    }

    // Generate unique patient ID
    const patientId = `PAT${Date.now()}`;

    // Create user account for patient login
    const hashedPassword = await bcrypt.hash(createPatientDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: createPatientDto.email,
        password: hashedPassword,
        firstName: createPatientDto.firstName,
        lastName: createPatientDto.lastName,
        role: UserRole.PATIENT,
        phone: createPatientDto.phone,
        address: createPatientDto.address,
        dateOfBirth: createPatientDto.dateOfBirth
          ? new Date(createPatientDto.dateOfBirth)
          : null,
      },
    });

    // Create patient record
    const patient = await this.prisma.patient.create({
      data: {
        patientId,
        firstName: createPatientDto.firstName,
        lastName: createPatientDto.lastName,
        email: createPatientDto.email,
        phone: createPatientDto.phone || '',
        dateOfBirth: createPatientDto.dateOfBirth ? new Date(createPatientDto.dateOfBirth) : new Date('1900-01-01'),
        gender: Gender.OTHER, // Default, can be updated later
        address: createPatientDto.address || '',
        emergencyContact: createPatientDto.emergencyContactName || '',
        allergies: createPatientDto.allergies,
        medicalHistory: createPatientDto.medicalHistory,
        insurance: createPatientDto.insuranceProvider,
        userId: user.id,
        createdById: user.id, // For now, patient creates themselves
      },
      include: {
        user: true,
      },
    });

    const patientData: any = patient;
    return {
      id: patientData.user?.id || patientData.id,
      email: patientData.email || '',
      firstName: patientData.firstName,
      lastName: patientData.lastName,
      role: patientData.user?.role || UserRole.PATIENT,
      phone: patientData.phone,
      address: patientData.address,
      dateOfBirth: patientData.dateOfBirth,
      avatar: patientData.user?.avatar,
      isActive: patientData.user?.isActive || patientData.isActive,
      emergencyContactName: patientData.emergencyContact,
      emergencyContactPhone: patientData.phone, // Using same phone for now
      medicalHistory: patientData.medicalHistory,
      currentMedications: '', // Not in schema, using empty string
      allergies: patientData.allergies,
      insuranceProvider: patientData.insurance,
      insurancePolicyNumber: '', // Not in schema, using empty string
      createdAt: patientData.createdAt,
      updatedAt: patientData.updatedAt,
    };
  }

  async findAll(): Promise<PatientResponseDto[]> {
    const patients = await this.prisma.patient.findMany({
      where: { isActive: true },
      include: { user: true },
    });

    return patients.map((patient: any) => ({
      id: patient.user?.id || patient.id,
      email: patient.email || '',
      firstName: patient.firstName,
      lastName: patient.lastName,
      role: patient.user?.role || UserRole.PATIENT,
      phone: patient.phone,
      address: patient.address,
      dateOfBirth: patient.dateOfBirth,
      avatar: patient.user?.avatar,
      isActive: patient.user?.isActive || patient.isActive,
      emergencyContactName: patient.emergencyContact,
      emergencyContactPhone: patient.phone,
      medicalHistory: patient.medicalHistory,
      currentMedications: '',
      allergies: patient.allergies,
      insuranceProvider: patient.insurance,
      insurancePolicyNumber: '',
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    }));
  }

  async findOne(id: string): Promise<PatientResponseDto> {
    const patient = await this.prisma.patient.findFirst({
      where: { 
        OR: [
          { id: id },
          { userId: id },
          { patientId: id }
        ]
      },
      include: {
        user: true,
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return {
      id: patient.user?.id || patient.id,
      email: patient.email || '',
      firstName: patient.firstName,
      lastName: patient.lastName,
      role: patient.user?.role || UserRole.PATIENT,
      phone: patient.phone,
      address: patient.address,
      dateOfBirth: patient.dateOfBirth,
      avatar: patient.user?.avatar,
      isActive: patient.user?.isActive || patient.isActive,
      emergencyContactName: patient.emergencyContact,
      emergencyContactPhone: patient.phone,
      medicalHistory: patient.medicalHistory,
      currentMedications: '',
      allergies: patient.allergies,
      insuranceProvider: patient.insurance,
      insurancePolicyNumber: '',
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };
  }

  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
  ): Promise<PatientResponseDto> {
    // Check if patient exists
    const existingPatient = await this.prisma.patient.findFirst({
      where: { 
        OR: [
          { id: id },
          { userId: id },
          { patientId: id }
        ]
      },
      include: { user: true },
    });

    if (!existingPatient) {
      throw new NotFoundException('Patient not found');
    }

    // Prepare user update data
    const userUpdateData: any = {};
    if (updatePatientDto.email) userUpdateData.email = updatePatientDto.email;
    if (updatePatientDto.firstName)
      userUpdateData.firstName = updatePatientDto.firstName;
    if (updatePatientDto.lastName)
      userUpdateData.lastName = updatePatientDto.lastName;
    if (updatePatientDto.phone) userUpdateData.phone = updatePatientDto.phone;
    if (updatePatientDto.address)
      userUpdateData.address = updatePatientDto.address;
    if (updatePatientDto.dateOfBirth)
      userUpdateData.dateOfBirth = new Date(updatePatientDto.dateOfBirth);
    if (updatePatientDto.password) {
      userUpdateData.password = await bcrypt.hash(updatePatientDto.password, 10);
    }

    // Prepare patient update data
    const patientUpdateData: any = {};
    if (updatePatientDto.firstName)
      patientUpdateData.firstName = updatePatientDto.firstName;
    if (updatePatientDto.lastName)
      patientUpdateData.lastName = updatePatientDto.lastName;
    if (updatePatientDto.email)
      patientUpdateData.email = updatePatientDto.email;
    if (updatePatientDto.phone)
      patientUpdateData.phone = updatePatientDto.phone;
    if (updatePatientDto.address)
      patientUpdateData.address = updatePatientDto.address;
    if (updatePatientDto.dateOfBirth)
      patientUpdateData.dateOfBirth = new Date(updatePatientDto.dateOfBirth);
    if (updatePatientDto.emergencyContactName)
      patientUpdateData.emergencyContact = updatePatientDto.emergencyContactName;
    if (updatePatientDto.medicalHistory)
      patientUpdateData.medicalHistory = updatePatientDto.medicalHistory;
    if (updatePatientDto.allergies)
      patientUpdateData.allergies = updatePatientDto.allergies;
    if (updatePatientDto.insuranceProvider)
      patientUpdateData.insurance = updatePatientDto.insuranceProvider;

    // Update user and patient in transaction
    const updatedPatient = await this.prisma.$transaction(async (prisma) => {
      // Update user if there's user data to update and user exists
      if (Object.keys(userUpdateData).length > 0 && existingPatient.userId) {
        await prisma.user.update({
          where: { id: existingPatient.userId },
          data: userUpdateData,
        });
      }

      // Update patient if there's patient data to update
      if (Object.keys(patientUpdateData).length > 0) {
        await prisma.patient.update({
          where: { id: existingPatient.id },
          data: patientUpdateData,
        });
      }

      // Return updated patient with user data
      return prisma.patient.findFirst({
        where: { id: existingPatient.id },
        include: {
          user: true,
        },
      });
    });

    if (!updatedPatient) {
      throw new NotFoundException('Patient not found after update');
    }

    return {
      id: updatedPatient.user?.id || updatedPatient.id,
      email: updatedPatient.email || '',
      firstName: updatedPatient.firstName,
      lastName: updatedPatient.lastName,
      role: updatedPatient.user?.role || UserRole.PATIENT,
      phone: updatedPatient.phone,
      address: updatedPatient.address,
      dateOfBirth: updatedPatient.dateOfBirth,
      avatar: updatedPatient.user?.avatar,
      isActive: updatedPatient.user?.isActive || updatedPatient.isActive,
      emergencyContactName: updatedPatient.emergencyContact,
      emergencyContactPhone: updatedPatient.phone,
      medicalHistory: updatedPatient.medicalHistory,
      currentMedications: '',
      allergies: updatedPatient.allergies,
      insuranceProvider: updatedPatient.insurance,
      insurancePolicyNumber: '',
      createdAt: updatedPatient.createdAt,
      updatedAt: updatedPatient.updatedAt,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    // Check if patient exists
    const existingPatient = await this.prisma.patient.findFirst({
      where: { 
        OR: [
          { id: id },
          { userId: id },
          { patientId: id }
        ]
      },
      include: { user: true },
    });

    if (!existingPatient) {
      throw new NotFoundException('Patient not found');
    }

    // Delete patient and user in transaction
    await this.prisma.$transaction(async (prisma) => {
      // Delete patient record first (due to foreign key constraint)
      await prisma.patient.delete({
        where: { id: existingPatient.id },
      });

      // Delete user record if it exists
      if (existingPatient.userId) {
        await prisma.user.delete({
          where: { id: existingPatient.userId },
        });
      }
    });

    return { message: 'Patient deleted successfully' };
  }

  async deactivate(id: string): Promise<PatientResponseDto> {
    const patient = await this.prisma.patient.findFirst({
      where: { 
        OR: [
          { id: id },
          { userId: id },
          { patientId: id }
        ]
      },
      include: { user: true },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Update patient status
    await this.prisma.patient.update({
      where: { id: patient.id },
      data: { isActive: false },
    });

    // Update user status if user exists
    if (patient.userId) {
      await this.prisma.user.update({
        where: { id: patient.userId },
        data: { isActive: false },
      });
    }

    return this.findOne(patient.id);
  }

  async activate(id: string): Promise<PatientResponseDto> {
    const patient = await this.prisma.patient.findFirst({
      where: { 
        OR: [
          { id: id },
          { userId: id },
          { patientId: id }
        ]
      },
      include: { user: true },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Update patient status
    await this.prisma.patient.update({
      where: { id: patient.id },
      data: { isActive: true },
    });

    // Update user status if user exists
    if (patient.userId) {
      await this.prisma.user.update({
        where: { id: patient.userId },
        data: { isActive: true },
      });
    }

    return this.findOne(patient.id);
  }
}
