import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ScheduleResponseDto } from './dto/schedule-response.dto';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<ScheduleResponseDto> {
    // Check if doctor exists
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: createScheduleDto.doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Check if schedule already exists for this doctor and day
    const existingSchedule = await this.prisma.schedule.findUnique({
      where: {
        doctorId_dayOfWeek: {
          doctorId: createScheduleDto.doctorId,
          dayOfWeek: createScheduleDto.dayOfWeek.toLowerCase(),
        },
      },
    });

    if (existingSchedule) {
      throw new ConflictException(
        `Schedule already exists for ${createScheduleDto.dayOfWeek}`,
      );
    }

    // Validate time format and logic
    this.validateTimeFormat(createScheduleDto.startTime);
    this.validateTimeFormat(createScheduleDto.endTime);
    
    if (createScheduleDto.breakStartTime) {
      this.validateTimeFormat(createScheduleDto.breakStartTime);
    }
    
    if (createScheduleDto.breakEndTime) {
      this.validateTimeFormat(createScheduleDto.breakEndTime);
    }

    if (!this.isValidTimeRange(createScheduleDto.startTime, createScheduleDto.endTime)) {
      throw new BadRequestException('End time must be after start time');
    }

    // Create schedule
    const schedule = await this.prisma.schedule.create({
      data: {
        doctorId: createScheduleDto.doctorId,
        dayOfWeek: createScheduleDto.dayOfWeek.toLowerCase(),
        startTime: createScheduleDto.startTime,
        endTime: createScheduleDto.endTime,
        maxPatients: createScheduleDto.maxPatients,
        consultationType: createScheduleDto.consultationType || 'OPD',
        status: createScheduleDto.status || 'ACTIVE',
        validFrom: createScheduleDto.validFrom ? new Date(createScheduleDto.validFrom) : new Date(),
        validTo: createScheduleDto.validTo ? new Date(createScheduleDto.validTo) : null,
        breakStartTime: createScheduleDto.breakStartTime,
        breakEndTime: createScheduleDto.breakEndTime,
        notes: createScheduleDto.notes,
      },
      include: {
        doctor: {
          include: {
            primaryDepartment: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return this.mapToResponseDto(schedule);
  }

  async findAll(): Promise<ScheduleResponseDto[]> {
    const schedules = await this.prisma.schedule.findMany({
      include: {
        doctor: {
          include: {
            primaryDepartment: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { doctor: { lastName: 'asc' } },
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return schedules.map((schedule) => this.mapToResponseDto(schedule));
  }

  async findByDoctor(doctorId: string): Promise<ScheduleResponseDto[]> {
    const schedules = await this.prisma.schedule.findMany({
      where: { doctorId },
      include: {
        doctor: {
          include: {
            primaryDepartment: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return schedules.map((schedule) => this.mapToResponseDto(schedule));
  }

  async findByDepartment(departmentId: string): Promise<ScheduleResponseDto[]> {
    const schedules = await this.prisma.schedule.findMany({
      where: {
        doctor: {
          departmentId: departmentId,
        },
      },
      include: {
        doctor: {
          include: {
            primaryDepartment: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { doctor: { lastName: 'asc' } },
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return schedules.map((schedule) => this.mapToResponseDto(schedule));
  }

  async findOne(id: string): Promise<ScheduleResponseDto> {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        doctor: {
          include: {
            primaryDepartment: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    return this.mapToResponseDto(schedule);
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<ScheduleResponseDto> {
    const existingSchedule = await this.prisma.schedule.findUnique({
      where: { id },
    });

    if (!existingSchedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    // If updating doctor or day, check for conflicts
    if (updateScheduleDto.doctorId || updateScheduleDto.dayOfWeek) {
      const doctorId = updateScheduleDto.doctorId || existingSchedule.doctorId;
      const dayOfWeek = updateScheduleDto.dayOfWeek?.toLowerCase() || existingSchedule.dayOfWeek;

      if (doctorId !== existingSchedule.doctorId || dayOfWeek !== existingSchedule.dayOfWeek) {
        const conflictingSchedule = await this.prisma.schedule.findUnique({
          where: {
            doctorId_dayOfWeek: {
              doctorId: doctorId,
              dayOfWeek: dayOfWeek,
            },
          },
        });

        if (conflictingSchedule && conflictingSchedule.id !== id) {
          throw new ConflictException(
            `Schedule already exists for this doctor on ${dayOfWeek}`,
          );
        }
      }
    }

    // Validate time formats if provided
    if (updateScheduleDto.startTime) {
      this.validateTimeFormat(updateScheduleDto.startTime);
    }
    if (updateScheduleDto.endTime) {
      this.validateTimeFormat(updateScheduleDto.endTime);
    }
    if (updateScheduleDto.breakStartTime) {
      this.validateTimeFormat(updateScheduleDto.breakStartTime);
    }
    if (updateScheduleDto.breakEndTime) {
      this.validateTimeFormat(updateScheduleDto.breakEndTime);
    }

    // Validate time range
    const startTime = updateScheduleDto.startTime || existingSchedule.startTime;
    const endTime = updateScheduleDto.endTime || existingSchedule.endTime;
    
    if (!this.isValidTimeRange(startTime, endTime)) {
      throw new BadRequestException('End time must be after start time');
    }

    const schedule = await this.prisma.schedule.update({
      where: { id },
      data: {
        ...updateScheduleDto,
        dayOfWeek: updateScheduleDto.dayOfWeek?.toLowerCase(),
        validFrom: updateScheduleDto.validFrom ? new Date(updateScheduleDto.validFrom) : undefined,
        validTo: updateScheduleDto.validTo ? new Date(updateScheduleDto.validTo) : undefined,
      },
      include: {
        doctor: {
          include: {
            primaryDepartment: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return this.mapToResponseDto(schedule);
  }

  async remove(id: string): Promise<void> {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    await this.prisma.schedule.delete({
      where: { id },
    });
  }

  private validateTimeFormat(time: string): void {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      throw new BadRequestException(`Invalid time format: ${time}. Expected format: HH:MM`);
    }
  }

  private isValidTimeRange(startTime: string, endTime: string): boolean {
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    return end > start;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Migration method to convert workingHours JSON to Schedule records
  async migrateWorkingHoursToSchedules(doctorId: string): Promise<ScheduleResponseDto[]> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { workingHours: true },
    });

    if (!doctor || !doctor.workingHours) {
      return [];
    }

    try {
      const workingHours = JSON.parse(doctor.workingHours);
      const schedules: ScheduleResponseDto[] = [];

      // Convert workingHours JSON to Schedule records
      for (const [day, hours] of Object.entries(workingHours)) {
        if (hours && typeof hours === 'object' && (hours as any).start && (hours as any).end) {
          const hourData = hours as any;
          
          // Check if schedule already exists for this day
          const existingSchedule = await this.prisma.schedule.findUnique({
            where: {
              doctorId_dayOfWeek: {
                doctorId: doctorId,
                dayOfWeek: day.toLowerCase(),
              },
            },
          });

          if (!existingSchedule) {
            const createDto: CreateScheduleDto = {
              doctorId: doctorId,
              dayOfWeek: day,
              startTime: hourData.start,
              endTime: hourData.end,
              maxPatients: hourData.maxPatients || 20,
              consultationType: hourData.consultationType || 'OPD',
              status: 'ACTIVE' as any,
              breakStartTime: hourData.breakStart,
              breakEndTime: hourData.breakEnd,
              notes: `Migrated from workingHours JSON`,
            };

            const newSchedule = await this.create(createDto);
            schedules.push(newSchedule);
          }
        }
      }

      return schedules;
    } catch (error) {
      console.error('Error migrating working hours:', error);
      return [];
    }
  }

  // Method to get schedules with fallback to workingHours JSON
  async findByDoctorWithFallback(doctorId: string): Promise<ScheduleResponseDto[]> {
    // First try to get from Schedule model
    let schedules = await this.findByDoctor(doctorId);

    // If no schedules found, try to migrate from workingHours
    if (schedules.length === 0) {
      schedules = await this.migrateWorkingHoursToSchedules(doctorId);
    }

    return schedules;
  }

  // Add missing findByFilters method
  async findByFilters(filters: { dayOfWeek?: string; status?: string }): Promise<ScheduleResponseDto[]> {
    const where: any = {};
    
    if (filters.dayOfWeek) {
      where.dayOfWeek = filters.dayOfWeek.toLowerCase();
    }
    
    if (filters.status) {
      where.status = filters.status;
    }

    const schedules = await this.prisma.schedule.findMany({
      where,
      include: {
        doctor: {
          include: {
            primaryDepartment: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { doctor: { lastName: 'asc' } },
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return schedules.map((schedule) => this.mapToResponseDto(schedule));
  }

  private mapToResponseDto(schedule: any): ScheduleResponseDto {
    return {
      id: schedule.id,
      doctorId: schedule.doctorId,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      maxPatients: schedule.maxPatients,
      consultationType: schedule.consultationType,
      status: schedule.status,
      validFrom: schedule.validFrom,
      validTo: schedule.validTo,
      breakStartTime: schedule.breakStartTime,
      breakEndTime: schedule.breakEndTime,
      notes: schedule.notes,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
      doctor: schedule.doctor ? {
        id: schedule.doctor.id,
        firstName: schedule.doctor.firstName,
        lastName: schedule.doctor.lastName,
        specialization: schedule.doctor.specialization,
        email: schedule.doctor.email,
        primaryDepartment: schedule.doctor.primaryDepartment,
      } : undefined,
    };
  }
}