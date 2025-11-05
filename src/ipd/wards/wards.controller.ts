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
import { WardsService } from './wards.service';
import { CreateWardDto , UpdateWardDto , CreateBedDto , UpdateBedDto } from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('IPD Wards & Beds')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ipd/wards')
export class WardsController {
  constructor(private readonly wardsService: WardsService) {}

  // Ward Management
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new ward' })
  @ApiResponse({ status: 201, description: 'Ward created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - ward number already exists' })
  async createWard(@Body() createWardDto: CreateWardDto) {
    try {
      return await this.wardsService.createWard(createWardDto);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get all wards with filters' })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filter by department ID' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by ward type' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'hasAvailableBeds', required: false, type: Boolean, description: 'Filter wards with available beds' })
  @ApiResponse({ status: 200, description: 'List of wards' })
  async findAllWards(
    @Query('departmentId') departmentId?: string,
    @Query('type') type?: string,
    @Query('isActive') isActive?: boolean,
    @Query('hasAvailableBeds') hasAvailableBeds?: boolean,
  ) {
    console.log('GET /ipd/wards called with filters:', { departmentId, type, isActive, hasAvailableBeds });
    const result = await this.wardsService.findAllWards({
      departmentId,
      type,
      isActive,
      hasAvailableBeds,
    });
    console.log('Wards result:', result);
    return result;
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get ward by ID' })
  @ApiResponse({ status: 200, description: 'Ward found' })
  @ApiResponse({ status: 404, description: 'Ward not found' })
  async findOneWard(@Param('id') id: string) {
    return this.wardsService.findOneWard(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update ward' })
  @ApiResponse({ status: 200, description: 'Ward updated successfully' })
  @ApiResponse({ status: 404, description: 'Ward not found' })
  async updateWard(@Param('id') id: string, @Body() updateWardDto: UpdateWardDto) {
    return this.wardsService.updateWard(id, updateWardDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete ward' })
  @ApiResponse({ status: 200, description: 'Ward deleted successfully' })
  @ApiResponse({ status: 404, description: 'Ward not found' })
  async removeWard(@Param('id') id: string) {
    return this.wardsService.removeWard(id);
  }

  // Bed Management
  @Post(':wardId/beds')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Add bed to ward' })
  @ApiResponse({ status: 201, description: 'Bed created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - bed number already exists in ward' })
  async createBed(@Param('wardId') wardId: string, @Body() createBedDto: CreateBedDto) {
    try {
      return await this.wardsService.createBed(wardId, createBedDto);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':wardId/beds')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get all beds in ward' })
  @ApiQuery({ name: 'isOccupied', required: false, type: Boolean, description: 'Filter by occupancy status' })
  @ApiQuery({ name: 'bedType', required: false, description: 'Filter by bed type' })
  @ApiResponse({ status: 200, description: 'List of beds in ward' })
  async findBedsByWard(
    @Param('wardId') wardId: string,
    @Query('isOccupied') isOccupied?: boolean,
    @Query('bedType') bedType?: string,
  ) {
    return this.wardsService.findBedsByWard(wardId, {
      isOccupied,
      bedType,
    });
  }

  @Get('beds/:bedId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get bed by ID' })
  @ApiResponse({ status: 200, description: 'Bed found' })
  @ApiResponse({ status: 404, description: 'Bed not found' })
  async findOneBed(@Param('bedId') bedId: string) {
    return this.wardsService.findOneBed(bedId);
  }

  @Patch('beds/:bedId')
  @Roles(UserRole.ADMIN, UserRole.NURSE)
  @ApiOperation({ summary: 'Update bed' })
  @ApiResponse({ status: 200, description: 'Bed updated successfully' })
  @ApiResponse({ status: 404, description: 'Bed not found' })
  async updateBed(@Param('bedId') bedId: string, @Body() updateBedDto: UpdateBedDto) {
    return this.wardsService.updateBed(bedId, updateBedDto);
  }

  @Delete('beds/:bedId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete bed' })
  @ApiResponse({ status: 200, description: 'Bed deleted successfully' })
  @ApiResponse({ status: 404, description: 'Bed not found' })
  async removeBed(@Param('bedId') bedId: string) {
    return this.wardsService.removeBed(bedId);
  }

  // Availability and Statistics
  @Get(':wardId/availability')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get ward bed availability summary' })
  @ApiResponse({ status: 200, description: 'Ward availability information' })
  async getWardAvailability(@Param('wardId') wardId: string) {
    return this.wardsService.getWardAvailability(wardId);
  }

  @Get('department/:departmentId/availability')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get department-wise bed availability' })
  @ApiResponse({ status: 200, description: 'Department bed availability' })
  async getDepartmentAvailability(@Param('departmentId') departmentId: string) {
    return this.wardsService.getDepartmentAvailability(departmentId);
  }

  @Get('available-beds/all')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get all available beds across all wards' })
  @ApiQuery({ name: 'wardType', required: false, description: 'Filter by ward type' })
  @ApiQuery({ name: 'bedType', required: false, description: 'Filter by bed type' })
  @ApiResponse({ status: 200, description: 'List of available beds' })
  async getAllAvailableBeds(
    @Query('wardType') wardType?: string,
    @Query('bedType') bedType?: string,
  ) {
    return this.wardsService.getAllAvailableBeds({
      wardType,
      bedType,
    });
  }
}
