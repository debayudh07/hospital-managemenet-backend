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
import { DischargeService } from './discharge.service';
import { CreateDischargeDto, UpdateDischargeDto  } from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('IPD Discharge')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ipd/discharge')
export class DischargeController {
  constructor(private readonly dischargeService: DischargeService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Create patient discharge record' })
  @ApiResponse({ status: 201, description: 'Discharge created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - admission not found or already discharged' })
  async create(@Body() createDischargeDto: CreateDischargeDto) {
    try {
      return await this.dischargeService.create(createDischargeDto);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get all discharge records with filters' })
  @ApiQuery({ name: 'patientId', required: false, description: 'Filter by patient ID' })
  @ApiQuery({ name: 'doctorId', required: false, description: 'Filter by doctor ID' })
  @ApiQuery({ name: 'dischargeDate', required: false, description: 'Filter by discharge date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit results' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination' })
  @ApiResponse({ status: 200, description: 'List of discharge records' })
  async findAll(
    @Query('patientId') patientId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('dischargeDate') dischargeDate?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.dischargeService.findAll({
      patientId,
      doctorId,
      dischargeDate,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get discharge record by ID' })
  @ApiResponse({ status: 200, description: 'Discharge record found' })
  @ApiResponse({ status: 404, description: 'Discharge record not found' })
  async findOne(@Param('id') id: string) {
    return this.dischargeService.findOne(id);
  }

  @Get('admission/:admissionId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get discharge record by admission ID' })
  @ApiResponse({ status: 200, description: 'Discharge record found' })
  @ApiResponse({ status: 404, description: 'Discharge record not found' })
  async findByAdmission(@Param('admissionId') admissionId: string) {
    return this.dischargeService.findByAdmission(admissionId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Update discharge record' })
  @ApiResponse({ status: 200, description: 'Discharge record updated successfully' })
  @ApiResponse({ status: 404, description: 'Discharge record not found' })
  async update(@Param('id') id: string, @Body() updateDischargeDto: UpdateDischargeDto) {
    return this.dischargeService.update(id, updateDischargeDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete discharge record' })
  @ApiResponse({ status: 200, description: 'Discharge record deleted successfully' })
  @ApiResponse({ status: 404, description: 'Discharge record not found' })
  async remove(@Param('id') id: string) {
    return this.dischargeService.remove(id);
  }

  @Post(':admissionId/prepare-discharge')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({ summary: 'Prepare discharge summary and billing' })
  @ApiResponse({ status: 200, description: 'Discharge preparation completed' })
  async prepareDischarge(@Param('admissionId') admissionId: string) {
    return this.dischargeService.prepareDischarge(admissionId);
  }
}
