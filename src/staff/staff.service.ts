import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffResponseDto } from './dto/staff-response.dto';
import { StaffRole } from '@prisma/client';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async create(createStaffDto: CreateStaffDto): Promise<StaffResponseDto> {
    // Check if staff with email already exists
    const existingStaff = await this.prisma.staff.findFirst({
      where: { email: createStaffDto.email },
    });

    if (existingStaff) {
      throw new ConflictException('Staff with this email already exists');
    }

    // Generate unique staff ID
    const staffId = `STF${Date.now()}`;

    // Create staff record
    const staff = await this.prisma.staff.create({
      data: {
        staffId,
        firstName: createStaffDto.firstName,
        lastName: createStaffDto.lastName,
        email: createStaffDto.email,
        phone: createStaffDto.phone,
        role: createStaffDto.role,
        department: createStaffDto.department,
        qualification: createStaffDto.qualification,
        dateOfBirth: createStaffDto.dateOfBirth
          ? new Date(createStaffDto.dateOfBirth)
          : null,
        gender: createStaffDto.gender,
        address: createStaffDto.address,
        isActive: createStaffDto.isActive ?? true,
        avatar: createStaffDto.avatar,
        joiningDate: createStaffDto.joiningDate
          ? new Date(createStaffDto.joiningDate)
          : new Date(),
        salary: createStaffDto.salary,
        notes: createStaffDto.notes,
      },
    });

    return this.mapToResponseDto(staff);
  }

  async findAll(): Promise<StaffResponseDto[]> {
    const staff = await this.prisma.staff.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return staff.map((s) => this.mapToResponseDto(s));
  }

  async findOne(id: string): Promise<StaffResponseDto> {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
    });

    if (!staff) {
      throw new NotFoundException(`Staff member with ID ${id} not found`);
    }

    return this.mapToResponseDto(staff);
  }

  async findByStaffId(staffId: string): Promise<StaffResponseDto> {
    const staff = await this.prisma.staff.findUnique({
      where: { staffId },
    });

    if (!staff) {
      throw new NotFoundException(`Staff member with ID ${staffId} not found`);
    }

    return this.mapToResponseDto(staff);
  }

  async findByRole(role: StaffRole): Promise<StaffResponseDto[]> {
    const staff = await this.prisma.staff.findMany({
      where: {
        role,
        isActive: true,
      },
      orderBy: { firstName: 'asc' },
    });

    return staff.map((s) => this.mapToResponseDto(s));
  }

  async findByDepartment(department: string): Promise<StaffResponseDto[]> {
    const staff = await this.prisma.staff.findMany({
      where: {
        department: {
          contains: department,
        },
        isActive: true,
      },
      orderBy: { firstName: 'asc' },
    });

    return staff.map((s) => this.mapToResponseDto(s));
  }

  async update(
    id: string,
    updateStaffDto: UpdateStaffDto,
  ): Promise<StaffResponseDto> {
    const existingStaff = await this.prisma.staff.findUnique({
      where: { id },
    });

    if (!existingStaff) {
      throw new NotFoundException(`Staff member with ID ${id} not found`);
    }

    // Check for email conflicts
    if (updateStaffDto.email && updateStaffDto.email !== existingStaff.email) {
      const emailConflict = await this.prisma.staff.findFirst({
        where: {
          email: updateStaffDto.email,
          id: { not: id },
        },
      });

      if (emailConflict) {
        throw new ConflictException(
          'Email already in use by another staff member',
        );
      }
    }

    const staff = await this.prisma.staff.update({
      where: { id },
      data: {
        ...updateStaffDto,
        dateOfBirth: updateStaffDto.dateOfBirth
          ? new Date(updateStaffDto.dateOfBirth)
          : undefined,
        joiningDate: updateStaffDto.joiningDate
          ? new Date(updateStaffDto.joiningDate)
          : undefined,
      },
    });

    return this.mapToResponseDto(staff);
  }

  async remove(id: string): Promise<void> {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
    });

    if (!staff) {
      throw new NotFoundException(`Staff member with ID ${id} not found`);
    }

    await this.prisma.staff.delete({
      where: { id },
    });
  }

  private mapToResponseDto(staff: any): StaffResponseDto {
    return {
      id: staff.id,
      staffId: staff.staffId,
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      department: staff.department,
      qualification: staff.qualification,
      dateOfBirth: staff.dateOfBirth,
      gender: staff.gender,
      address: staff.address,
      isActive: staff.isActive,
      avatar: staff.avatar,
      joiningDate: staff.joiningDate,
      salary: staff.salary,
      notes: staff.notes,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
    };
  }
}
