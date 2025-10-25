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

  async create(
    createPatientDto: CreatePatientDto,
  ): Promise<PatientResponseDto> {
    // Check if patient with email already exists
    const existingPatient = await this.prisma.patient.findFirst({
      where: { email: createPatientDto.email },
    });

    if (existingPatient) {
      throw new ConflictException('Patient with this email already exists');
    }

    // Generate unique patient ID
    const patientId = `PAT${Date.now()}`;

    // Create user account for patient login (only if password is provided)
    let user: any = null;
    if (createPatientDto.password) {
      const hashedPassword = await bcrypt.hash(createPatientDto.password, 10);
      user = await this.prisma.user.create({
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
    }

    // Create patient record
    const patient = await this.prisma.patient.create({
      data: {
        patientId,
        firstName: createPatientDto.firstName,
        lastName: createPatientDto.lastName,
        email: createPatientDto.email,
        phone: createPatientDto.phone,
        dateOfBirth: new Date(createPatientDto.dateOfBirth),
        gender: createPatientDto.gender,
        address: createPatientDto.address,
        city: createPatientDto.city,
        state: createPatientDto.state,
        zipCode: createPatientDto.zipCode,
        emergencyContactName: createPatientDto.emergencyContactName,
        emergencyContactPhone: createPatientDto.emergencyContactPhone,
        emergencyContactRelationship:
          createPatientDto.emergencyContactRelationship,
        bloodGroup: createPatientDto.bloodGroup,
        allergies: createPatientDto.allergies,
        chronicConditions: createPatientDto.chronicConditions,
        currentMedications: createPatientDto.currentMedications,
        insuranceProvider: createPatientDto.insuranceProvider,
        insurancePolicyNumber: createPatientDto.insurancePolicyNumber,
        userId: user ? user.id : null,
        createdById: user?.id || 'system', // Use system if no user created
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
      emergencyContactName: patientData.emergencyContactName,
      emergencyContactPhone: patientData.emergencyContactPhone,
      emergencyContactRelationship: patientData.emergencyContactRelationship,
      city: patientData.city,
      state: patientData.state,
      zipCode: patientData.zipCode,
      gender: patientData.gender,
      bloodGroup: patientData.bloodGroup,
      chronicConditions: patientData.chronicConditions,
      currentMedications: patientData.currentMedications,
      allergies: patientData.allergies,
      insuranceProvider: patientData.insuranceProvider,
      insurancePolicyNumber: patientData.insurancePolicyNumber,
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
      emergencyContactName: patient.emergencyContactName,
      emergencyContactPhone: patient.emergencyContactPhone,
      emergencyContactRelationship: patient.emergencyContactRelationship,
      city: patient.city,
      state: patient.state,
      zipCode: patient.zipCode,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      chronicConditions: patient.chronicConditions,
      currentMedications: patient.currentMedications,
      allergies: patient.allergies,
      insuranceProvider: patient.insuranceProvider,
      insurancePolicyNumber: patient.insurancePolicyNumber,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    }));
  }

  async findOne(id: string): Promise<PatientResponseDto> {
    const patient = await this.prisma.patient.findFirst({
      where: {
        OR: [{ id: id }, { userId: id }, { patientId: id }],
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
      emergencyContactName: patient.emergencyContactName,
      emergencyContactPhone: patient.emergencyContactPhone,
      emergencyContactRelationship: patient.emergencyContactRelationship,
      city: patient.city,
      state: patient.state,
      zipCode: patient.zipCode,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      chronicConditions: patient.chronicConditions,
      currentMedications: patient.currentMedications,
      allergies: patient.allergies,
      insuranceProvider: patient.insuranceProvider,
      insurancePolicyNumber: patient.insurancePolicyNumber,
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
        OR: [{ id: id }, { userId: id }, { patientId: id }],
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
    if (updatePatientDto.password && updatePatientDto.password.trim() !== '') {
      userUpdateData.password = await bcrypt.hash(
        updatePatientDto.password,
        10,
      );
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
    if (updatePatientDto.gender)
      patientUpdateData.gender = updatePatientDto.gender;
    if (updatePatientDto.city) patientUpdateData.city = updatePatientDto.city;
    if (updatePatientDto.state)
      patientUpdateData.state = updatePatientDto.state;
    if (updatePatientDto.zipCode)
      patientUpdateData.zipCode = updatePatientDto.zipCode;
    if (updatePatientDto.emergencyContactName)
      patientUpdateData.emergencyContactName =
        updatePatientDto.emergencyContactName;
    if (updatePatientDto.emergencyContactPhone)
      patientUpdateData.emergencyContactPhone =
        updatePatientDto.emergencyContactPhone;
    if (updatePatientDto.emergencyContactRelationship)
      patientUpdateData.emergencyContactRelationship =
        updatePatientDto.emergencyContactRelationship;
    if (updatePatientDto.bloodGroup)
      patientUpdateData.bloodGroup = updatePatientDto.bloodGroup;
    if (updatePatientDto.allergies)
      patientUpdateData.allergies = updatePatientDto.allergies;
    if (updatePatientDto.chronicConditions)
      patientUpdateData.chronicConditions = updatePatientDto.chronicConditions;
    if (updatePatientDto.currentMedications)
      patientUpdateData.currentMedications =
        updatePatientDto.currentMedications;
    if (updatePatientDto.insuranceProvider)
      patientUpdateData.insuranceProvider = updatePatientDto.insuranceProvider;
    if (updatePatientDto.insurancePolicyNumber)
      patientUpdateData.insurancePolicyNumber =
        updatePatientDto.insurancePolicyNumber;

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

    const updatedData: any = updatedPatient;
    return {
      id: updatedData.user?.id || updatedData.id,
      email: updatedData.email || '',
      firstName: updatedData.firstName,
      lastName: updatedData.lastName,
      role: updatedData.user?.role || UserRole.PATIENT,
      phone: updatedData.phone,
      address: updatedData.address,
      dateOfBirth: updatedData.dateOfBirth,
      avatar: updatedData.user?.avatar,
      isActive: updatedData.user?.isActive || updatedData.isActive,
      emergencyContactName: updatedData.emergencyContactName,
      emergencyContactPhone: updatedData.emergencyContactPhone,
      emergencyContactRelationship: updatedData.emergencyContactRelationship,
      city: updatedData.city,
      state: updatedData.state,
      zipCode: updatedData.zipCode,
      gender: updatedData.gender,
      bloodGroup: updatedData.bloodGroup,
      chronicConditions: updatedData.chronicConditions,
      currentMedications: updatedData.currentMedications,
      allergies: updatedData.allergies,
      insuranceProvider: updatedData.insuranceProvider,
      insurancePolicyNumber: updatedData.insurancePolicyNumber,
      medicalHistory: updatedData.medicalHistory,
      createdAt: updatedData.createdAt,
      updatedAt: updatedData.updatedAt,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    // Check if patient exists
    const existingPatient = await this.prisma.patient.findFirst({
      where: {
        OR: [{ id: id }, { userId: id }, { patientId: id }],
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
        OR: [{ id: id }, { userId: id }, { patientId: id }],
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
        OR: [{ id: id }, { userId: id }, { patientId: id }],
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
