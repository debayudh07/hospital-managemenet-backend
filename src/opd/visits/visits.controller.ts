import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { VisitsService } from './visits.service';
import { CreateOPDVisitDto, UpdateOPDVisitDto, OPDVisitResponseDto } from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole, VisitStatus } from '@prisma/client';

@ApiTags('OPD Visits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('opd/visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Create OPD visit with auto patient creation' })
  @ApiResponse({ status: 201, description: 'OPD visit created successfully', type: OPDVisitResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Doctor or department not found' })
  async create(@Body() createOPDVisitDto: CreateOPDVisitDto): Promise<OPDVisitResponseDto> {
    return this.visitsService.create(createOPDVisitDto);
  }

  @Get('patients/comprehensive')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get comprehensive OPD patient data with all visits and details' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by patient name, phone, or ID' })
  @ApiQuery({ name: 'date', required: false, description: 'Filter by visit date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'department', required: false, description: 'Filter by department' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit results (default: 50)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination' })
  @ApiResponse({ status: 200, description: 'Comprehensive OPD patient data' })
  async getComprehensivePatientData(
    @Query('search') search?: string,
    @Query('date') date?: string,
    @Query('department') department?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.visitsService.getComprehensivePatientData({
      search,
      date,
      department,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    });
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get all OPD visits with filters' })
  @ApiQuery({ name: 'patientId', required: false, description: 'Filter by patient ID' })
  @ApiQuery({ name: 'doctorId', required: false, description: 'Filter by doctor ID' })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filter by department ID' })
  @ApiQuery({ name: 'status', required: false, enum: VisitStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'date', required: false, description: 'Filter by date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit results' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination' })
  @ApiResponse({ status: 200, description: 'List of OPD visits', type: [OPDVisitResponseDto] })
  async findAll(
    @Query('patientId') patientId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: VisitStatus,
    @Query('date') date?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<OPDVisitResponseDto[]> {
    return this.visitsService.findAll({
      patientId,
      doctorId,
      departmentId,
      status,
      date,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get('today')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get today\'s OPD visits' })
  @ApiQuery({ name: 'doctorId', required: false, description: 'Filter by doctor ID' })
  @ApiResponse({ status: 200, description: 'Today\'s OPD visits', type: [OPDVisitResponseDto] })
  async getTodaysVisits(@Query('doctorId') doctorId?: string): Promise<OPDVisitResponseDto[]> {
    return this.visitsService.getTodaysVisits(doctorId);
  }

  @Get('patient/:patientId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({ summary: 'Get patient\'s OPD visit history' })
  @ApiResponse({ status: 200, description: 'Patient\'s OPD visit history', type: [OPDVisitResponseDto] })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getPatientHistory(@Param('patientId') patientId: string): Promise<OPDVisitResponseDto[]> {
    return this.visitsService.getPatientHistory(patientId);
  }

  @Get('doctor/:doctorId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({ summary: 'Get doctor\'s OPD visits' })
  @ApiQuery({ name: 'date', required: false, description: 'Filter by date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'status', required: false, enum: VisitStatus, description: 'Filter by status' })
  @ApiResponse({ status: 200, description: 'Doctor\'s OPD visits', type: [OPDVisitResponseDto] })
  async getDoctorVisits(
    @Param('doctorId') doctorId: string,
    @Query('date') date?: string,
    @Query('status') status?: VisitStatus,
  ): Promise<OPDVisitResponseDto[]> {
    return this.visitsService.findAll({ doctorId, date, status });
  }

  @Get('department/:departmentId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get department\'s OPD visits' })
  @ApiQuery({ name: 'date', required: false, description: 'Filter by date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'status', required: false, enum: VisitStatus, description: 'Filter by status' })
  @ApiResponse({ status: 200, description: 'Department\'s OPD visits', type: [OPDVisitResponseDto] })
  async getDepartmentVisits(
    @Param('departmentId') departmentId: string,
    @Query('date') date?: string,
    @Query('status') status?: VisitStatus,
  ): Promise<OPDVisitResponseDto[]> {
    return this.visitsService.findAll({ departmentId, date, status });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get OPD visit by ID' })
  @ApiResponse({ status: 200, description: 'OPD visit details', type: OPDVisitResponseDto })
  @ApiResponse({ status: 404, description: 'OPD visit not found' })
  async findOne(@Param('id') id: string): Promise<OPDVisitResponseDto> {
    return this.visitsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({ summary: 'Update OPD visit' })
  @ApiResponse({ status: 200, description: 'OPD visit updated successfully', type: OPDVisitResponseDto })
  @ApiResponse({ status: 404, description: 'OPD visit not found' })
  async update(
    @Param('id') id: string,
    @Body() updateOPDVisitDto: UpdateOPDVisitDto,
  ): Promise<OPDVisitResponseDto> {
    return this.visitsService.update(id, updateOPDVisitDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Cancel/Delete OPD visit' })
  @ApiResponse({ status: 204, description: 'OPD visit deleted successfully' })
  @ApiResponse({ status: 404, description: 'OPD visit not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.visitsService.remove(id);
  }
}
