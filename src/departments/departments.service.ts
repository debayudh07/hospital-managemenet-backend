import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    // Check if head doctor exists and is valid
    if (createDepartmentDto.headDoctorId) {
      const doctor = await this.prisma.doctor.findUnique({
        where: { id: createDepartmentDto.headDoctorId },
      });
      if (!doctor) {
        throw new BadRequestException('Head doctor not found');
      }
    }

    const department = await this.prisma.department.create({
      data: createDepartmentDto,
      include: {
        headDoctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
            email: true,
          },
        },
        _count: {
          select: {
            doctors: true,
            primaryDoctors: true,
          },
        },
      },
    });

    return this.mapToResponseDto(department);
  }

  async findAll(): Promise<DepartmentResponseDto[]> {
    const departments = await this.prisma.department.findMany({
      include: {
        headDoctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
            email: true,
          },
        },
        _count: {
          select: {
            doctors: true,
            primaryDoctors: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return departments.map(this.mapToResponseDto);
  }

  async findOne(id: string): Promise<DepartmentResponseDto> {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        headDoctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
            email: true,
          },
        },
        _count: {
          select: {
            doctors: true,
            primaryDoctors: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return this.mapToResponseDto(department);
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<DepartmentResponseDto> {
    // Check if department exists
    const existingDepartment = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!existingDepartment) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    // Check if head doctor exists and is valid
    if (updateDepartmentDto.headDoctorId) {
      const doctor = await this.prisma.doctor.findUnique({
        where: { id: updateDepartmentDto.headDoctorId },
      });
      if (!doctor) {
        throw new BadRequestException('Head doctor not found');
      }
    }

    const department = await this.prisma.department.update({
      where: { id },
      data: updateDepartmentDto,
      include: {
        headDoctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
            email: true,
          },
        },
        _count: {
          select: {
            doctors: true,
            primaryDoctors: true,
          },
        },
      },
    });

    return this.mapToResponseDto(department);
  }

  async remove(id: string): Promise<void> {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            doctors: true,
            primaryDoctors: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    // Check if department has doctors assigned
    const totalDoctors = (department._count.doctors || 0) + (department._count.primaryDoctors || 0);
    if (totalDoctors > 0) {
      throw new BadRequestException('Cannot delete department with assigned doctors');
    }

    await this.prisma.department.delete({
      where: { id },
    });
  }

  async assignHeadDoctor(departmentId: string, doctorId: string): Promise<DepartmentResponseDto> {
    // Check if department exists
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${departmentId} not found`);
    }

    // Check if doctor exists
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    // Update department with new head doctor
    const updatedDepartment = await this.prisma.department.update({
      where: { id: departmentId },
      data: { headDoctorId: doctorId },
      include: {
        headDoctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
            email: true,
          },
        },
        _count: {
          select: {
            doctors: true,
            primaryDoctors: true,
          },
        },
      },
    });

    return this.mapToResponseDto(updatedDepartment);
  }

  async removeHeadDoctor(departmentId: string): Promise<DepartmentResponseDto> {
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${departmentId} not found`);
    }

    const updatedDepartment = await this.prisma.department.update({
      where: { id: departmentId },
      data: { headDoctorId: null },
      include: {
        headDoctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
            email: true,
          },
        },
        _count: {
          select: {
            doctors: true,
            primaryDoctors: true,
          },
        },
      },
    });

    return this.mapToResponseDto(updatedDepartment);
  }

  private mapToResponseDto(department: any): DepartmentResponseDto {
    return {
      id: department.id,
      name: department.name,
      description: department.description,
      location: department.location,
      established: department.established,
      headDoctorId: department.headDoctorId,
      headDoctor: department.headDoctor,
      doctorCount: (department._count?.doctors || 0) + (department._count?.primaryDoctors || 0),
    };
  }
}