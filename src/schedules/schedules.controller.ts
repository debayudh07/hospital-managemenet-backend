import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ScheduleResponseDto } from './dto/schedule-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('schedules')
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new schedule' })
  @ApiResponse({
    status: 201,
    description: 'Schedule created successfully',
    type: ScheduleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  @ApiResponse({ status: 409, description: 'Schedule already exists for this day' })
  async create(
    @Body() createScheduleDto: CreateScheduleDto,
  ): Promise<ScheduleResponseDto> {
    return this.schedulesService.create(createScheduleDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'RECEPTIONIST', 'DOCTOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all schedules' })
  @ApiQuery({
    name: 'doctorId',
    required: false,
    description: 'Filter schedules by doctor ID',
    type: String,
  })
  @ApiQuery({
    name: 'departmentId',
    required: false,
    description: 'Filter schedules by department ID',
    type: String,
  })
  @ApiQuery({
    name: 'dayOfWeek',
    required: false,
    description: 'Filter schedules by day of week',
    type: String,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter schedules by status',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all schedules',
    type: [ScheduleResponseDto],
  })
  async findAll(
    @Query('doctorId') doctorId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('dayOfWeek') dayOfWeek?: string,
    @Query('status') status?: string,
  ): Promise<ScheduleResponseDto[]> {
    if (doctorId) {
      return this.schedulesService.findByDoctor(doctorId);
    }
    if (departmentId) {
      return this.schedulesService.findByDepartment(departmentId);
    }
    if (dayOfWeek || status) {
      return this.schedulesService.findByFilters({ dayOfWeek, status });
    }
    return this.schedulesService.findAll();
  }

  @Get('doctor/:doctorId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'RECEPTIONIST', 'DOCTOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get schedules by doctor ID' })
  @ApiParam({ name: 'doctorId', description: 'Doctor ID' })
  @ApiResponse({
    status: 200,
    description: 'List of schedules for the doctor',
    type: [ScheduleResponseDto],
  })
  async findByDoctor(
    @Param('doctorId') doctorId: string,
  ): Promise<ScheduleResponseDto[]> {
    return this.schedulesService.findByDoctor(doctorId);
  }

  @Get('department/:departmentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'RECEPTIONIST', 'DOCTOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get schedules by department ID' })
  @ApiParam({ name: 'departmentId', description: 'Department ID' })
  @ApiResponse({
    status: 200,
    description: 'List of schedules for the department',
    type: [ScheduleResponseDto],
  })
  async findByDepartment(
    @Param('departmentId') departmentId: string,
  ): Promise<ScheduleResponseDto[]> {
    return this.schedulesService.findByDepartment(departmentId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a schedule by ID' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiResponse({
    status: 200,
    description: 'Schedule details',
    type: ScheduleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async findOne(@Param('id') id: string): Promise<ScheduleResponseDto> {
    return this.schedulesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a schedule' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiResponse({
    status: 200,
    description: 'Schedule updated successfully',
    type: ScheduleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ): Promise<ScheduleResponseDto> {
    return this.schedulesService.update(id, updateScheduleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a schedule' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiResponse({
    status: 200,
    description: 'Schedule deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.schedulesService.remove(id);
  }

  @Post('migrate/:doctorId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Migrate working hours JSON to schedule records' })
  @ApiParam({ name: 'doctorId', description: 'Doctor ID' })
  @ApiResponse({
    status: 201,
    description: 'Working hours migrated successfully',
    type: [ScheduleResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async migrateWorkingHours(
    @Param('doctorId') doctorId: string,
  ): Promise<ScheduleResponseDto[]> {
    return this.schedulesService.migrateWorkingHoursToSchedules(doctorId);
  }
}