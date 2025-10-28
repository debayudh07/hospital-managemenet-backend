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
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { DoctorResponseDto } from './dto/doctor-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('doctors')
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new doctor' })
  @ApiResponse({
    status: 201,
    description: 'Doctor created successfully',
    type: DoctorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email or license number already exists' })
  async create(
    @Body() createDoctorDto: CreateDoctorDto,
  ): Promise<DoctorResponseDto> {
    return this.doctorsService.create(createDoctorDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'RECEPTIONIST', 'DOCTOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all doctors' })
  @ApiQuery({
    name: 'departmentId',
    required: false,
    description: 'Filter doctors by department ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all doctors',
    type: [DoctorResponseDto],
  })
  async findAll(
    @Query('departmentId') departmentId?: string,
  ): Promise<DoctorResponseDto[]> {
    if (departmentId) {
      return this.doctorsService.findDoctorsByDepartment(departmentId);
    }
    return this.doctorsService.findAll();
  }

  @Get('available')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all available doctors' })
  @ApiResponse({
    status: 200,
    description: 'List of available doctors',
    type: [DoctorResponseDto],
  })
  async findAvailable(): Promise<DoctorResponseDto[]> {
    return this.doctorsService.findAvailableDoctors();
  }

  @Get('specialization/:specialization')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get doctors by specialization' })
  @ApiParam({ name: 'specialization', description: 'Doctor specialization' })
  @ApiResponse({
    status: 200,
    description: 'List of doctors with the specified specialization',
    type: [DoctorResponseDto],
  })
  async findBySpecialization(
    @Param('specialization') specialization: string,
  ): Promise<DoctorResponseDto[]> {
    return this.doctorsService.findDoctorsBySpecialization(specialization);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a doctor by ID' })
  @ApiParam({ name: 'id', description: 'Doctor ID' })
  @ApiResponse({
    status: 200,
    description: 'Doctor details',
    type: DoctorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async findOne(@Param('id') id: string): Promise<DoctorResponseDto> {
    return this.doctorsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a doctor' })
  @ApiParam({ name: 'id', description: 'Doctor ID' })
  @ApiResponse({
    status: 200,
    description: 'Doctor updated successfully',
    type: DoctorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ): Promise<DoctorResponseDto> {
    return this.doctorsService.update(id, updateDoctorDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a doctor' })
  @ApiParam({ name: 'id', description: 'Doctor ID' })
  @ApiResponse({
    status: 200,
    description: 'Doctor deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.doctorsService.remove(id);
    return { message: 'Doctor deleted successfully' };
  }
}
