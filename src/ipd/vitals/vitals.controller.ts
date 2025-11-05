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
  HttpStatus,
  HttpException 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { VitalsService } from './vitals.service';
import { CreateVitalsDto , UpdateVitalsDto } from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('IPD Vitals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ipd/vitals')
export class VitalsController {
  constructor(private readonly vitalsService: VitalsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({ summary: 'Record patient vitals' })
  @ApiResponse({ status: 201, description: 'Vitals recorded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - admission not found' })
  async create(@Body() createVitalsDto: CreateVitalsDto) {
    try {
      return await this.vitalsService.create(createVitalsDto);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get all vitals records with filters' })
  @ApiQuery({ name: 'admissionId', required: false, description: 'Filter by admission ID' })
  @ApiQuery({ name: 'patientId', required: false, description: 'Filter by patient ID' })
  @ApiQuery({ name: 'recordedBy', required: false, description: 'Filter by staff who recorded vitals' })
  @ApiQuery({ name: 'shift', required: false, description: 'Filter by shift (Morning, Evening, Night)' })
  @ApiQuery({ name: 'recordedDate', required: false, description: 'Filter by recorded date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit results' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination' })
  @ApiResponse({ status: 200, description: 'List of vitals records' })
  async findAll(
    @Query('admissionId') admissionId?: string,
    @Query('patientId') patientId?: string,
    @Query('recordedBy') recordedBy?: string,
    @Query('shift') shift?: string,
    @Query('recordedDate') recordedDate?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.vitalsService.findAll({
      admissionId,
      patientId,
      recordedBy,
      shift,
      recordedDate,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get vitals record by ID' })
  @ApiResponse({ status: 200, description: 'Vitals record found' })
  @ApiResponse({ status: 404, description: 'Vitals record not found' })
  async findOne(@Param('id') id: string) {
    return this.vitalsService.findOne(id);
  }

  @Get('admission/:admissionId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get vitals records by admission ID' })
  @ApiResponse({ status: 200, description: 'Vitals records found' })
  async findByAdmission(@Param('admissionId') admissionId: string) {
    return this.vitalsService.findByAdmission(admissionId);
  }

  @Get('admission/:admissionId/latest')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get latest vitals for admission' })
  @ApiResponse({ status: 200, description: 'Latest vitals found' })
  async getLatestVitals(@Param('admissionId') admissionId: string) {
    return this.vitalsService.getLatestVitals(admissionId);
  }

  @Get('admission/:admissionId/charts')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get vitals chart data for admission' })
  @ApiResponse({ status: 200, description: 'Vitals chart data' })
  async getVitalsChart(@Param('admissionId') admissionId: string) {
    return this.vitalsService.getVitalsChart(admissionId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({ summary: 'Update vitals record' })
  @ApiResponse({ status: 200, description: 'Vitals record updated successfully' })
  @ApiResponse({ status: 404, description: 'Vitals record not found' })
  async update(@Param('id') id: string, @Body() updateVitalsDto: UpdateVitalsDto) {
    return this.vitalsService.update(id, updateVitalsDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({ summary: 'Delete vitals record' })
  @ApiResponse({ status: 200, description: 'Vitals record deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vitals record not found' })
  async remove(@Param('id') id: string) {
    return this.vitalsService.remove(id);
  }
}
