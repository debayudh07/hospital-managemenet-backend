import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
    createdById: string,
  ): Promise<AppointmentResponseDto> {
    // Check if patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: createAppointmentDto.patientId },
      include: { user: true },
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Check if doctor exists
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: createAppointmentDto.doctorId },
      include: { user: true },
    });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Check if doctor is available
    if (!doctor.isAvailable) {
      throw new BadRequestException('Doctor is not available');
    }

    // Check for conflicting appointments
    const appointmentDate = new Date(createAppointmentDto.date);
    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        doctorId: createAppointmentDto.doctorId,
        date: appointmentDate,
        startTime: createAppointmentDto.startTime,
        status: {
          not: AppointmentStatus.CANCELLED,
        },
      },
    });

    if (conflictingAppointment) {
      throw new ConflictException(
        'Doctor already has an appointment at this time',
      );
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        ...createAppointmentDto,
        date: appointmentDate,
        createdById,
      },
      include: {
        patient: {
          include: { user: true },
        },
        doctor: {
          include: { 
            user: true,
            primaryDepartment: true,
          },
        },
      },
    });

    return await this.mapToResponseDto(appointment);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: AppointmentStatus,
    doctorId?: string,
    patientId?: string,
  ): Promise<{
    appointments: AppointmentResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }
    if (doctorId) {
      where.doctorId = doctorId;
    }
    if (patientId) {
      where.patientId = patientId;
    }

    // Get both regular appointments and OPD visits
    const [appointments, opdVisits, totalAppointments, totalOpdVisits] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip: Math.floor(skip / 2), // Split the pagination between both sources
        take: Math.ceil(limit / 2),
        orderBy: { date: 'asc' },
        include: {
          patient: {
            include: { user: true },
          },
          doctor: {
            include: { 
              user: true,
              primaryDepartment: true,
            },
          },
        },
      }),
      this.prisma.oPDVisit.findMany({
        where: this.mapAppointmentFiltersToOPDFilters(where),
        skip: Math.floor(skip / 2),
        take: Math.ceil(limit / 2),
        orderBy: { visitDate: 'asc' },
        include: {
          patient: true,
          doctor: true,
        },
      }),
      this.prisma.appointment.count({ where }),
      this.prisma.oPDVisit.count({ where: this.mapAppointmentFiltersToOPDFilters(where) }),
    ]);

    // Convert OPD visits to appointment format
    const opdVisitsAsAppointments = opdVisits.map(visit => this.mapOPDVisitToAppointmentResponse(visit));

    // Map regular appointments with await
    const mappedAppointments = await Promise.all(
      appointments.map((appointment: any) => this.mapToResponseDto(appointment))
    );

    // Combine and sort by date
    const allAppointments = [
      ...mappedAppointments,
      ...opdVisitsAsAppointments
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      appointments: allAppointments,
      total: totalAppointments + totalOpdVisits,
      page,
      limit,
    };
  }

  // Helper method to map appointment filters to OPD visit filters
  private mapAppointmentFiltersToOPDFilters(appointmentWhere: any): any {
    const opdWhere: any = {};
    
    if (appointmentWhere.status) {
      // Map appointment status to OPD visit status
      const statusMap: Record<string, string> = {
        'SCHEDULED': 'PENDING',
        'CONFIRMED': 'IN_PROGRESS',
        'IN_PROGRESS': 'IN_PROGRESS',
        'COMPLETED': 'COMPLETED',
        'CANCELLED': 'CANCELLED',
      };
      opdWhere.status = statusMap[appointmentWhere.status] || appointmentWhere.status;
    }
    
    if (appointmentWhere.doctorId) {
      opdWhere.doctorId = appointmentWhere.doctorId;
    }
    
    if (appointmentWhere.patientId) {
      opdWhere.patientId = appointmentWhere.patientId;
    }
    
    return opdWhere;
  }

  // Helper method to convert OPD visit to appointment response format
  private mapOPDVisitToAppointmentResponse(opdVisit: any): AppointmentResponseDto {
    // Calculate end time (assume 30-minute appointments)
    const [hours, minutes] = opdVisit.visitTime.split(':').map(Number);
    const endTimeDate = new Date();
    endTimeDate.setHours(hours, minutes + 30, 0, 0);
    const endTime = endTimeDate.toTimeString().slice(0, 5);

    // Map OPD visit status to appointment status
    const statusMap: Record<string, AppointmentStatus> = {
      'PENDING': AppointmentStatus.SCHEDULED,
      'IN_PROGRESS': AppointmentStatus.IN_PROGRESS,
      'COMPLETED': AppointmentStatus.COMPLETED,
      'CANCELLED': AppointmentStatus.CANCELLED,
    };

    return {
      id: opdVisit.id,
      patientId: opdVisit.patientId,
      doctorId: opdVisit.doctorId,
      date: opdVisit.visitDate,
      startTime: opdVisit.visitTime,
      endTime: endTime,
      type: 'CONSULTATION' as any,
      status: statusMap[opdVisit.status] || AppointmentStatus.SCHEDULED,
      reason: opdVisit.chiefComplaint,
      notes: `OPD Visit: ${opdVisit.visitId}`,
      createdById: opdVisit.patientId, // Fallback
      createdAt: opdVisit.createdAt,
      updatedAt: opdVisit.updatedAt,
      patientName: `${opdVisit.patient.firstName} ${opdVisit.patient.lastName}`,
      patientEmail: opdVisit.patient.email,
      patientPhone: opdVisit.patient.phone,
      doctorName: `${opdVisit.doctor.firstName} ${opdVisit.doctor.lastName}`,
      doctorSpecialization: opdVisit.doctor.specialization,
      consultationFee: opdVisit.doctor.consultationFee,
      // Add department information
      departmentId: opdVisit.departmentId,
      department: opdVisit.department,
    };
  }

  async findOne(id: string): Promise<AppointmentResponseDto> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          include: { user: true },
        },
        doctor: {
          include: { 
            user: true,
            primaryDepartment: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return await this.mapToResponseDto(appointment);
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    const existingAppointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      throw new NotFoundException('Appointment not found');
    }

    // If updating date/time, check for conflicts
    if (
      updateAppointmentDto.date ||
      updateAppointmentDto.startTime ||
      updateAppointmentDto.doctorId
    ) {
      const appointmentDate = updateAppointmentDto.date
        ? new Date(updateAppointmentDto.date)
        : existingAppointment.date;
      const startTime =
        updateAppointmentDto.startTime || existingAppointment.startTime;
      const doctorId =
        updateAppointmentDto.doctorId || existingAppointment.doctorId;

      const conflictingAppointment = await this.prisma.appointment.findFirst({
        where: {
          id: { not: id },
          doctorId,
          date: appointmentDate,
          startTime,
          status: {
            not: AppointmentStatus.CANCELLED,
          },
        },
      });

      if (conflictingAppointment) {
        throw new ConflictException(
          'Doctor already has an appointment at this time',
        );
      }
    }

    const updateData: any = { ...updateAppointmentDto };
    if (updateAppointmentDto.date) {
      updateData.date = new Date(updateAppointmentDto.date);
    }

    const appointment = await this.prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          include: { user: true },
        },
        doctor: {
          include: { 
            user: true,
            primaryDepartment: true,
          },
        },
      },
    });

    return await this.mapToResponseDto(appointment);
  }

  async remove(id: string): Promise<void> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    await this.prisma.appointment.delete({
      where: { id },
    });
  }

  async findByDoctor(
    doctorId: string,
    date?: string,
  ): Promise<AppointmentResponseDto[]> {
    const where: any = { doctorId };

    if (date) {
      const appointmentDate = new Date(date);
      where.date = appointmentDate;
    }

    const appointments = await this.prisma.appointment.findMany({
      where,
      orderBy: { startTime: 'asc' },
      include: {
        patient: {
          include: { user: true },
        },
        doctor: {
          include: { 
            user: true,
            primaryDepartment: true,
          },
        },
      },
    });

    return Promise.all(
      appointments.map((appointment: any) =>
        this.mapToResponseDto(appointment),
      )
    );
  }

  async findByPatient(patientId: string): Promise<AppointmentResponseDto[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: { patientId },
      orderBy: { date: 'desc' },
      include: {
        patient: {
          include: { user: true },
        },
        doctor: {
          include: { 
            user: true,
            primaryDepartment: true,
          },
        },
      },
    });

    return Promise.all(
      appointments.map((appointment: any) =>
        this.mapToResponseDto(appointment),
      )
    );
  }

  async getAvailableSlots(doctorId: string, date: string) {
    // Verify doctor exists
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        schedules: {
          where: {
            dayOfWeek: new Date(date).getDay().toString(),
            status: 'ACTIVE',
          },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Get existing appointments for the date
    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        date: new Date(date),
        status: {
          not: AppointmentStatus.CANCELLED,
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Generate available slots based on doctor's schedule
    const availableSlots: Array<{
      startTime: string;
      endTime: string;
      available: boolean;
    }> = [];
    
    for (const schedule of doctor.schedules) {
      const startTime = new Date(`${date}T${schedule.startTime}`);
      const endTime = new Date(`${date}T${schedule.endTime}`);
      const slotDuration = 30; // 30 minutes per slot

      let currentSlot = new Date(startTime);
      
      while (currentSlot < endTime) {
        const slotEnd = new Date(currentSlot.getTime() + slotDuration * 60000);
        const slotTimeString = currentSlot.toTimeString().slice(0, 5);
        
        // Check if slot is not already booked
        const isBooked = existingAppointments.some(apt => 
          apt.startTime === slotTimeString
        );

        if (!isBooked && slotEnd <= endTime) {
          availableSlots.push({
            startTime: slotTimeString,
            endTime: slotEnd.toTimeString().slice(0, 5),
            available: true,
          });
        }

        currentSlot = slotEnd;
      }
    }

    return {
      doctorId,
      date,
      slots: availableSlots,
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      specialization: doctor.specialization,
    };
  }

  async getDoctorsByDepartment(departmentId: string, date?: string) {
    const doctors = await this.prisma.doctor.findMany({
      where: {
        departments: {
          some: {
            departmentId,
          },
        },
        isActive: true,
      },
      include: {
        user: true,
        departments: {
          include: {
            department: true,
          },
        },
        _count: {
          select: {
            appointments: date ? {
              where: {
                date: new Date(date),
                status: {
                  not: AppointmentStatus.CANCELLED,
                },
              },
            } : true,
          },
        },
      },
    });

    return doctors.map(doctor => ({
      id: doctor.id,
      doctorId: doctor.doctorId,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      fullName: `${doctor.firstName} ${doctor.lastName}`,
      specialization: doctor.specialization,
      consultationFee: doctor.consultationFee,
      isAvailable: doctor.isAvailable,
      opdIpdAvailability: doctor.opdIpdAvailability,
      appointmentCount: doctor._count.appointments,
      departments: doctor.departments.map(d => ({
        id: d.department.id,
        name: d.department.name,
      })),
    }));
  }

  async createWithOPD(
    createAppointmentDto: CreateAppointmentDto,
    createdById: string,
  ): Promise<AppointmentResponseDto> {
    // This method creates an appointment as part of OPD visit creation
    // It has similar logic to create() but may have different validations
    
    // Check if patient exists (will be created by OPD process if needed)
    const patient = await this.prisma.patient.findUnique({
      where: { id: createAppointmentDto.patientId },
      include: { user: true },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found. Please create patient first through OPD visit.');
    }

    // Check if doctor exists and is available
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: createAppointmentDto.doctorId },
      include: { user: true },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (!doctor.isAvailable) {
      throw new BadRequestException('Doctor is not available');
    }

    // Check for time slot availability
    const appointmentDate = new Date(createAppointmentDto.date);
    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        doctorId: createAppointmentDto.doctorId,
        date: appointmentDate,
        startTime: createAppointmentDto.startTime,
        status: {
          not: AppointmentStatus.CANCELLED,
        },
      },
    });

    if (conflictingAppointment) {
      throw new ConflictException(
        'Time slot is not available. Please select another time.',
      );
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        ...createAppointmentDto,
        date: appointmentDate,
        createdById,
        status: AppointmentStatus.SCHEDULED, // Default status for OPD appointments
      },
      include: {
        patient: {
          include: { user: true },
        },
        doctor: {
          include: { 
            user: true,
            primaryDepartment: true,
          },
        },
      },
    });

    return await this.mapToResponseDto(appointment);
  }

  async getOPDVisitsAsAppointments(
    page: number = 1,
    limit: number = 10,
    doctorId?: string,
    patientId?: string,
    date?: string,
  ): Promise<{
    appointments: AppointmentResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (doctorId) {
      where.doctorId = doctorId;
    }
    if (patientId) {
      where.patientId = patientId;
    }
    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(targetDate.getDate() + 1);
      
      where.visitDate = {
        gte: targetDate,
        lt: nextDay,
      };
    }

    const [opdVisits, total] = await Promise.all([
      this.prisma.oPDVisit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { visitDate: 'asc' },
        include: {
          patient: true,
          doctor: true,
          department: true,
        },
      }),
      this.prisma.oPDVisit.count({ where }),
    ]);

    const appointments = opdVisits.map(visit => this.mapOPDVisitToAppointmentResponse(visit));

    return {
      appointments,
      total,
      page,
      limit,
    };
  }

  private async mapToResponseDto(appointmentData: any): Promise<AppointmentResponseDto> {
    // Manually fetch department if not included and doctor has departmentId
    let department = appointmentData.doctor?.primaryDepartment;
    if (!department && appointmentData.doctor?.departmentId) {
      department = await this.prisma.department.findUnique({
        where: { id: appointmentData.doctor.departmentId }
      });
    }

    return {
      id: appointmentData.id,
      patientId: appointmentData.patientId,
      doctorId: appointmentData.doctorId,
      date: appointmentData.date,
      startTime: appointmentData.startTime,
      endTime: appointmentData.endTime,
      type: appointmentData.type,
      status: appointmentData.status,
      reason: appointmentData.reason,
      notes: appointmentData.notes,
      createdById: appointmentData.createdById,
      createdAt: appointmentData.createdAt,
      updatedAt: appointmentData.updatedAt,
      patientName:
        appointmentData.patient?.user?.firstName &&
        appointmentData.patient?.user?.lastName
          ? `${appointmentData.patient.user.firstName} ${appointmentData.patient.user.lastName}`
          : undefined,
      patientEmail: appointmentData.patient?.user?.email,
      patientPhone: appointmentData.patient?.phoneNumber,
      doctorName:
        appointmentData.doctor?.user?.firstName &&
        appointmentData.doctor?.user?.lastName
          ? `${appointmentData.doctor.user.firstName} ${appointmentData.doctor.user.lastName}`
          : undefined,
      doctorSpecialization: appointmentData.doctor?.specialization,
      consultationFee: appointmentData.doctor?.consultationFee,
      // Add department information
      departmentId: appointmentData.doctor?.departmentId,
      department: department,
    };
  }
}
