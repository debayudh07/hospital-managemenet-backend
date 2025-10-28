import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientResponseDto } from './dto/patient-response.dto';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async create(createPatientDto: CreatePatientDto): Promise<PatientResponseDto> {
    if (createPatientDto.email) {
      const existingPatient = await this.prisma.patient.findFirst({
        where: { email: createPatientDto.email },
      });
      if (existingPatient) {
        throw new ConflictException('Patient with this email already exists');
      }
    }
    const patientId = `PAT${ Date.now()}`;
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
        emergencyContactRelationship: createPatientDto.emergencyContactRelationship,
        bloodGroup: createPatientDto.bloodGroup,
        allergies: createPatientDto.allergies,
        chronicConditions: createPatientDto.chronicConditions,
        currentMedications: createPatientDto.currentMedications,
        insuranceProvider: createPatientDto.insuranceProvider,
        insurancePolicyNumber: createPatientDto.insurancePolicyNumber,
        isActive: true,
      },
    });
    return this.mapToResponseDto(patient);
  }

  async findAll(): Promise<PatientResponseDto[]> {
    const patients = await this.prisma.patient.findMany({ orderBy: { createdAt: 'desc' } });
    return patients.map((patient) => this.mapToResponseDto(patient));
  }

  async findOne(id: string): Promise<PatientResponseDto> {
    const patient = await this.prisma.patient.findFirst({ where: { OR: [{ id }, { patientId: id }] } });
    if (!patient) throw new NotFoundException(`Patient with ID ${id} not found`);
    return this.mapToResponseDto(patient);
  }

  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<PatientResponseDto> {
    const existingPatient = await this.prisma.patient.findFirst({ where: { OR: [{ id }, { patientId: id }] } });
    if (!existingPatient) throw new NotFoundException(`Patient with ID ${id} not found`);
    const patient = await this.prisma.patient.update({ where: { id: existingPatient.id }, data: { ...updatePatientDto, dateOfBirth: updatePatientDto.dateOfBirth ? new Date(updatePatientDto.dateOfBirth) : undefined } });
    return this.mapToResponseDto(patient);
  }

  async remove(id: string): Promise<{ message: string }> {
    const patient = await this.prisma.patient.findFirst({ where: { OR: [{ id }, { patientId: id }] } });
    if (!patient) throw new NotFoundException(`Patient with ID ${id} not found`);
    await this.prisma.patient.delete({ where: { id: patient.id } });
    return { message: 'Patient deleted successfully' };
  }

  async deactivate(id: string): Promise<PatientResponseDto> {
    const existingPatient = await this.prisma.patient.findFirst({ where: { OR: [{ id }, { patientId: id }] } });
    if (!existingPatient) throw new NotFoundException(`Patient with ID ${id} not found`);
    const patient = await this.prisma.patient.update({ where: { id: existingPatient.id }, data: { isActive: false } });
    return this.mapToResponseDto(patient);
  }

  async activate(id: string): Promise<PatientResponseDto> {
    const existingPatient = await this.prisma.patient.findFirst({ where: { OR: [{ id }, { patientId: id }] } });
    if (!existingPatient) throw new NotFoundException(`Patient with ID ${id} not found`);
    const patient = await this.prisma.patient.update({ where: { id: existingPatient.id }, data: { isActive: true } });
    return this.mapToResponseDto(patient);
  }

  private mapToResponseDto(patient: any): PatientResponseDto {
    return {
      id: patient.id,
      patientId: patient.patientId,
      email: patient.email || '',
      firstName: patient.firstName,
      lastName: patient.lastName,
      phone: patient.phone,
      address: patient.address,
      dateOfBirth: patient.dateOfBirth,
      avatar: patient.avatar,
      isActive: patient.isActive,
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
}
