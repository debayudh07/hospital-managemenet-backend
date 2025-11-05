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
import { TreatmentsService } from './treatments.service';
import { CreateTreatmentDto , UpdateTreatmentDto } from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('IPD Treatments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ipd/treatments')
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({ summary: 'Create treatment record' })
  @ApiResponse({ status: 201, description: 'Treatment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - admission not found' })
  async create(@Body() createTreatmentDto: CreateTreatmentDto) {
    try {
      return await this.treatmentsService.create(createTreatmentDto);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get all treatments with filters' })
  @ApiQuery({ name: 'admissionId', required: false, description: 'Filter by admission ID' })
  @ApiQuery({ name: 'patientId', required: false, description: 'Filter by patient ID' })
  @ApiQuery({ name: 'doctorId', required: false, description: 'Filter by doctor ID' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by treatment type' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by treatment status' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit results' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination' })
  @ApiResponse({ status: 200, description: 'List of treatments' })
  async findAll(
    @Query('admissionId') admissionId?: string,
    @Query('patientId') patientId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.treatmentsService.findAll({
      admissionId,
      patientId,
      doctorId,
      type,
      status,
      startDate,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get treatment by ID' })
  @ApiResponse({ status: 200, description: 'Treatment found' })
  @ApiResponse({ status: 404, description: 'Treatment not found' })
  async findOne(@Param('id') id: string) {
    return this.treatmentsService.findOne(id);
  }

  @Get('admission/:admissionId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get treatments by admission ID' })
  @ApiResponse({ status: 200, description: 'Treatments found' })
  async findByAdmission(@Param('admissionId') admissionId: string) {
    return this.treatmentsService.findByAdmission(admissionId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({ summary: 'Update treatment' })
  @ApiResponse({ status: 200, description: 'Treatment updated successfully' })
  @ApiResponse({ status: 404, description: 'Treatment not found' })
  async update(@Param('id') id: string, @Body() updateTreatmentDto: UpdateTreatmentDto) {
    return this.treatmentsService.update(id, updateTreatmentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Delete treatment record' })
  @ApiResponse({ status: 200, description: 'Treatment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Treatment not found' })
  async remove(@Param('id') id: string) {
    return this.treatmentsService.remove(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({ summary: 'Update treatment status' })
  @ApiResponse({ status: 200, description: 'Treatment status updated successfully' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; endDate?: string; notes?: string }
  ) {
    return this.treatmentsService.updateStatus(id, body.status, body.endDate, body.notes);
  }
}
