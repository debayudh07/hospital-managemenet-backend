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
import { AdmissionsService } from './admissions.service';
import { CreateAdmissionDto, UpdateAdmissionDto } from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('IPD Admissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ipd/admissions')
export class AdmissionsController {
  constructor(private readonly admissionsService: AdmissionsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Create IPD admission with auto patient creation' })
  @ApiResponse({ status: 201, description: 'IPD admission created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - bed occupied or missing data' })
  @ApiResponse({ status: 404, description: 'Doctor, bed, or ward not found' })
  async create(@Body() createAdmissionDto: CreateAdmissionDto) {
    return this.admissionsService.create(createAdmissionDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get all IPD admissions with filters' })
  @ApiQuery({ name: 'patientId', required: false, description: 'Filter by patient ID' })
  @ApiQuery({ name: 'doctorId', required: false, description: 'Filter by doctor ID' })
  @ApiQuery({ name: 'wardId', required: false, description: 'Filter by ward ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by admission status' })
  @ApiQuery({ name: 'admissionDate', required: false, description: 'Filter by admission date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit results' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination' })
  @ApiResponse({ status: 200, description: 'List of IPD admissions' })
  async findAll(
    @Query('patientId') patientId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('wardId') wardId?: string,
    @Query('status') status?: any,
    @Query('admissionDate') admissionDate?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.admissionsService.findAll({
      patientId,
      doctorId,
      wardId,
      status,
      admissionDate,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get('active')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get active IPD admissions' })
  @ApiResponse({ status: 200, description: 'List of active IPD admissions' })
  async getActiveAdmissions() {
    return this.admissionsService.getActiveAdmissions();
  }

  @Get('patient/:patientId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({ summary: 'Get patient\'s admission history' })
  @ApiResponse({ status: 200, description: 'Patient\'s admission history' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getPatientAdmissions(@Param('patientId') patientId: string) {
    return this.admissionsService.getPatientAdmissions(patientId);
  }

  @Get('ward/:wardId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get ward admissions' })
  @ApiResponse({ status: 200, description: 'Ward admissions' })
  async getWardAdmissions(@Param('wardId') wardId: string) {
    return this.admissionsService.getWardAdmissions(wardId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get IPD admission by ID' })
  @ApiResponse({ status: 200, description: 'IPD admission details' })
  @ApiResponse({ status: 404, description: 'IPD admission not found' })
  async findOne(@Param('id') id: string) {
    return this.admissionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({ summary: 'Update IPD admission' })
  @ApiResponse({ status: 200, description: 'IPD admission updated successfully' })
  @ApiResponse({ status: 404, description: 'IPD admission not found' })
  async update(
    @Param('id') id: string,
    @Body() updateAdmissionDto: UpdateAdmissionDto,
  ) {
    return this.admissionsService.update(id, updateAdmissionDto);
  }
}
