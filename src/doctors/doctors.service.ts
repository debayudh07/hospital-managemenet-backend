import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { DoctorResponseDto } from './dto/doctor-response.dto';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<DoctorResponseDto> {
    // Check if doctor with email already exists
    const existingDoctor = await this.prisma.doctor.findFirst({
      where: { email: createDoctorDto.email },
    });

    if (existingDoctor) {
      throw new ConflictException('Doctor with this email already exists');
    }

    // Check if license number already exists
    const existingLicense = await this.prisma.doctor.findFirst({
      where: { licenseNumber: createDoctorDto.licenseNumber },
    });

    if (existingLicense) {
      throw new ConflictException(
        'Doctor with this license number already exists',
      );
    }

    // Generate unique doctor ID
    const doctorId = `DOC${Date.now()}`;

    // Build working hours JSON from individual fields
    const workingHours = this.buildWorkingHoursJson(createDoctorDto);

    // Handle department assignment
    let departmentId = createDoctorDto.departmentId;
    
    // If department name is provided but no departmentId, find or create department
    if (createDoctorDto.department && !departmentId) {
      departmentId = await this.findOrCreateDepartment(createDoctorDto.department);
    }

    // Create doctor record
    const doctor = await this.prisma.doctor.create({
      data: {
        doctorId,
        firstName: createDoctorDto.firstName,
        lastName: createDoctorDto.lastName,
        email: createDoctorDto.email,
        phone: createDoctorDto.phone,
        specialization: createDoctorDto.specialization,
        licenseNumber: createDoctorDto.licenseNumber,
        experience: createDoctorDto.experience,
        qualification: createDoctorDto.qualification,
        consultationFee: createDoctorDto.consultationFee,
        dateOfBirth: createDoctorDto.dateOfBirth ? new Date(createDoctorDto.dateOfBirth) : null,
        gender: createDoctorDto.gender,
        address: createDoctorDto.address,
        city: createDoctorDto.city,
        state: createDoctorDto.state,
        zipCode: createDoctorDto.zipCode,
        emergencyContactName: createDoctorDto.emergencyContactName,
        emergencyContactPhone: createDoctorDto.emergencyContactPhone,
        emergencyContactRelationship: createDoctorDto.emergencyContactRelationship,
        bloodGroup: createDoctorDto.bloodGroup,
        joiningDate: createDoctorDto.joiningDate ? new Date(createDoctorDto.joiningDate) : null,
        departmentId: departmentId,
        isAvailable: createDoctorDto.isAvailable ?? true,
        isActive: createDoctorDto.isActive ?? true,
        avatar: createDoctorDto.avatar,
        workingHours: workingHours,
        notes: createDoctorDto.notes,
      },
      include: {
        primaryDepartment: true,
      },
    });

    // Create doctor-department relationship in junction table if department is assigned
    if (departmentId) {
      await this.prisma.doctorDepartment.create({
        data: {
          doctorId: doctor.id,
          departmentId: departmentId,
        },
      });
    }

    return this.mapToResponseDto(doctor);
  }


  async findAll(): Promise<DoctorResponseDto[]> {
    const doctors = await this.prisma.doctor.findMany({
      include: {
        primaryDepartment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return doctors.map((doctor) => this.mapToResponseDto(doctor));
  }

  async findDoctorsByDepartment(departmentId: string): Promise<DoctorResponseDto[]> {
    const doctors = await this.prisma.doctor.findMany({
      where: {
        departmentId: departmentId,
      },
      include: {
        primaryDepartment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return doctors.map((doctor) => this.mapToResponseDto(doctor));
  }

  async findOne(id: string): Promise<DoctorResponseDto> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        primaryDepartment: true,
        appointments: true,
        departments: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    return this.mapToResponseDto(doctor);
  }

  async findByDoctorId(doctorId: string): Promise<DoctorResponseDto> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { doctorId },
      include: {
        primaryDepartment: true,
      },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    return this.mapToResponseDto(doctor);
  }

  async update(
    id: string,
    updateDoctorDto: UpdateDoctorDto,
  ): Promise<DoctorResponseDto> {
    const existingDoctor = await this.prisma.doctor.findUnique({
      where: { id },
    });

    if (!existingDoctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    // Check for email conflicts
    if (updateDoctorDto.email && updateDoctorDto.email !== existingDoctor.email) {
      const emailConflict = await this.prisma.doctor.findFirst({
        where: {
          email: updateDoctorDto.email,
          id: { not: id },
        },
      });

      if (emailConflict) {
        throw new ConflictException('Email already in use by another doctor');
      }
    }

    // Check for license number conflicts
    if (
      updateDoctorDto.licenseNumber &&
      updateDoctorDto.licenseNumber !== existingDoctor.licenseNumber
    ) {
      const licenseConflict = await this.prisma.doctor.findFirst({
        where: {
          licenseNumber: updateDoctorDto.licenseNumber,
          id: { not: id },
        },
      });

      if (licenseConflict) {
        throw new ConflictException(
          'License number already in use by another doctor',
        );
      }
    }

    // Build working hours JSON if schedule fields are provided
    const workingHours = this.buildWorkingHoursJson(updateDoctorDto);
    
    // Handle department assignment
    let departmentId = updateDoctorDto.departmentId;
    
    // If department name is provided but no departmentId, find or create department
    if (updateDoctorDto.department && !departmentId) {
      departmentId = await this.findOrCreateDepartment(updateDoctorDto.department);
    }
    
    const doctor = await this.prisma.doctor.update({
      where: { id },
      data: {
        ...updateDoctorDto,
        departmentId: departmentId,
        dateOfBirth: updateDoctorDto.dateOfBirth
          ? new Date(updateDoctorDto.dateOfBirth)
          : undefined,
        joiningDate: updateDoctorDto.joiningDate
          ? new Date(updateDoctorDto.joiningDate)
          : undefined,
        workingHours: workingHours !== '{}' ? workingHours : undefined,
      },
      include: {
        primaryDepartment: true,
      },
    });

    return this.mapToResponseDto(doctor);
  }

  async remove(id: string): Promise<void> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    await this.prisma.doctor.delete({
      where: { id },
    });
  }

  async findAvailableDoctors(): Promise<DoctorResponseDto[]> {
    const doctors = await this.prisma.doctor.findMany({
      where: {
        isAvailable: true,
        isActive: true,
      },
      include: {
        primaryDepartment: true,
      },
      orderBy: { firstName: 'asc' },
    });

    return doctors.map((doctor) => this.mapToResponseDto(doctor));
  }

  async findDoctorsBySpecialization(
    specialization: string,
  ): Promise<DoctorResponseDto[]> {
    const doctors = await this.prisma.doctor.findMany({
      where: {
        specialization: {
          contains: specialization,
        },
        isActive: true,
      },
      include: {
        primaryDepartment: true,
      },
      orderBy: { firstName: 'asc' },
    });

    return doctors.map((doctor) => this.mapToResponseDto(doctor));
  }

  private buildWorkingHoursJson(dto: any): string {
    // If workingHours is already provided as a string, use it
    if (dto.workingHours && typeof dto.workingHours === 'string') {
      return dto.workingHours;
    }

    // Build from individual fields
    const workingHoursData: any = {};
    
    if (dto.workingDays) workingHoursData.days = dto.workingDays;
    if (dto.opdStartTime) workingHoursData.startTime = dto.opdStartTime;
    if (dto.opdEndTime) workingHoursData.endTime = dto.opdEndTime;
    if (dto.consultationType) workingHoursData.consultationType = dto.consultationType;
    if (dto.maxPatientsPerDay) workingHoursData.maxPatients = dto.maxPatientsPerDay;

    return Object.keys(workingHoursData).length > 0 ? JSON.stringify(workingHoursData) : '{}';
  }

  private parseWorkingHours(workingHours: string): any {
    try {
      return JSON.parse(workingHours || '{}');
    } catch {
      return {};
    }
  }

  private async findOrCreateDepartment(departmentName: string): Promise<string> {
    // Try to find existing department by name
    let department = await this.prisma.department.findUnique({
      where: { name: departmentName },
    });

    // If department doesn't exist, create it
    if (!department) {
      department = await this.prisma.department.create({
        data: {
          name: departmentName,
          description: `${departmentName} Department`,
        },
      });
    }

    return department.id;
  }

  private mapToResponseDto(doctor: any): DoctorResponseDto {
    const workingHoursData = this.parseWorkingHours(doctor.workingHours);

    return {
      id: doctor.id,
      doctorId: doctor.doctorId,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      phone: doctor.phone,
      specialization: doctor.specialization,
      licenseNumber: doctor.licenseNumber,
      experience: doctor.experience,
      qualification: doctor.qualification,
      consultationFee: doctor.consultationFee,
      dateOfBirth: doctor.dateOfBirth,
      gender: doctor.gender,
      address: doctor.address,
      city: doctor.city,
      state: doctor.state,
      zipCode: doctor.zipCode,
      emergencyContactName: doctor.emergencyContactName,
      emergencyContactPhone: doctor.emergencyContactPhone,
      emergencyContactRelationship: doctor.emergencyContactRelationship,
      bloodGroup: doctor.bloodGroup,
      joiningDate: doctor.joiningDate,
      department: doctor.primaryDepartment?.name || null, // For backward compatibility
      departmentId: doctor.departmentId,
      primaryDepartment: doctor.primaryDepartment,
      isAvailable: doctor.isAvailable,
      isActive: doctor.isActive,
      avatar: doctor.avatar,
      workingHours: doctor.workingHours,
      // Extract individual fields from workingHours JSON
      workingDays: workingHoursData.days,
      opdStartTime: workingHoursData.startTime,
      opdEndTime: workingHoursData.endTime,
      consultationType: workingHoursData.consultationType,
      maxPatientsPerDay: workingHoursData.maxPatients,
      notes: doctor.notes,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt,
    };
  }
}
