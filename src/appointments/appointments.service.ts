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
          include: { user: true },
        },
      },
    });

    return this.mapToResponseDto(appointment);
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

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'asc' },
        include: {
          patient: {
            include: { user: true },
          },
          doctor: {
            include: { user: true },
          },
        },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      appointments: appointments.map((appointment: any) =>
        this.mapToResponseDto(appointment),
      ),
      total,
      page,
      limit,
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
          include: { user: true },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return this.mapToResponseDto(appointment);
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
          include: { user: true },
        },
      },
    });

    return this.mapToResponseDto(appointment);
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
          include: { user: true },
        },
      },
    });

    return appointments.map((appointment: any) =>
      this.mapToResponseDto(appointment),
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
          include: { user: true },
        },
      },
    });

    return appointments.map((appointment: any) =>
      this.mapToResponseDto(appointment),
    );
  }

  private mapToResponseDto(appointmentData: any): AppointmentResponseDto {
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
    };
  }
}
