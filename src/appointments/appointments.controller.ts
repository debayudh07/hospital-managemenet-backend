import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AppointmentStatus } from '@prisma/client';

@ApiTags('appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles('ADMIN', 'DOCTOR', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({
    status: 201,
    description: 'Appointment created successfully',
    type: AppointmentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Patient or doctor not found' })
  @ApiResponse({ status: 409, description: 'Appointment conflict' })
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Request() req: any,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.create(createAppointmentDto, req.user.sub);
  }

  @Get()
  @Roles('ADMIN', 'DOCTOR', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Get all appointments with pagination and filters' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: AppointmentStatus,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'doctorId',
    required: false,
    type: String,
    description: 'Filter by doctor ID',
  })
  @ApiQuery({
    name: 'patientId',
    required: false,
    type: String,
    description: 'Filter by patient ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointments retrieved successfully',
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: AppointmentStatus,
    @Query('doctorId') doctorId?: string,
    @Query('patientId') patientId?: string,
  ) {
    return this.appointmentsService.findAll(
      page,
      limit,
      status,
      doctorId,
      patientId,
    );
  }

  @Get('doctor/:doctorId')
  @Roles('ADMIN', 'DOCTOR', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Get appointments by doctor ID' })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Filter by specific date (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Doctor appointments retrieved successfully',
    type: [AppointmentResponseDto],
  })
  async findByDoctor(
    @Param('doctorId') doctorId: string,
    @Query('date') date?: string,
  ): Promise<AppointmentResponseDto[]> {
    return this.appointmentsService.findByDoctor(doctorId, date);
  }

  @Get('patient/:patientId')
  @Roles('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')
  @ApiOperation({ summary: 'Get appointments by patient ID' })
  @ApiResponse({
    status: 200,
    description: 'Patient appointments retrieved successfully',
    type: [AppointmentResponseDto],
  })
  async findByPatient(
    @Param('patientId') patientId: string,
  ): Promise<AppointmentResponseDto[]> {
    return this.appointmentsService.findByPatient(patientId);
  }

  @Get('opd-visits')
  @Roles('ADMIN', 'DOCTOR', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Get OPD visits formatted as appointments' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'doctorId',
    required: false,
    type: String,
    description: 'Filter by doctor ID',
  })
  @ApiQuery({
    name: 'patientId',
    required: false,
    type: String,
    description: 'Filter by patient ID',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Filter by date (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'OPD visits retrieved as appointments successfully',
    type: [AppointmentResponseDto],
  })
  async getOPDVisitsAsAppointments(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('doctorId') doctorId?: string,
    @Query('patientId') patientId?: string,
    @Query('date') date?: string,
  ) {
    return this.appointmentsService.getOPDVisitsAsAppointments(
      page,
      limit,
      doctorId,
      patientId,
      date,
    );
  }

  @Get(':id')
  @Roles('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Appointment retrieved successfully',
    type: AppointmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async findOne(@Param('id') id: string): Promise<AppointmentResponseDto> {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'DOCTOR', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Update appointment' })
  @ApiResponse({
    status: 200,
    description: 'Appointment updated successfully',
    type: AppointmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @ApiResponse({ status: 409, description: 'Appointment conflict' })
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Delete appointment' })
  @ApiResponse({ status: 200, description: 'Appointment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.appointmentsService.remove(id);
    return { message: 'Appointment deleted successfully' };
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'DOCTOR', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Update appointment status' })
  @ApiResponse({
    status: 200,
    description: 'Appointment status updated successfully',
    type: AppointmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: AppointmentStatus,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.update(id, { status });
  }

  @Get('doctor/:doctorId/available-slots')
  @Roles('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')
  @ApiOperation({ summary: 'Get available time slots for a doctor on a specific date' })
  @ApiQuery({
    name: 'date',
    required: true,
    type: String,
    description: 'Date to check availability (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Available slots retrieved successfully',
  })
  async getAvailableSlots(
    @Param('doctorId') doctorId: string,
    @Query('date') date: string,
  ) {
    return this.appointmentsService.getAvailableSlots(doctorId, date);
  }

  @Get('department/:departmentId/doctors')
  @Roles('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')
  @ApiOperation({ summary: 'Get doctors by department with their appointment counts' })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Date to check appointment counts (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Department doctors retrieved successfully',
  })
  async getDoctorsByDepartment(
    @Param('departmentId') departmentId: string,
    @Query('date') date?: string,
  ) {
    return this.appointmentsService.getDoctorsByDepartment(departmentId, date);
  }

  @Post('book-with-opd')
  @Roles('ADMIN', 'DOCTOR', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Create appointment during OPD visit creation' })
  @ApiResponse({
    status: 201,
    description: 'Appointment created with OPD visit successfully',
    type: AppointmentResponseDto,
  })
  async createWithOPD(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Request() req: any,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.createWithOPD(createAppointmentDto, req.user.sub);
  }
}
