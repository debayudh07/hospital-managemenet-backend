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
import { TransfersService } from './transfers.service';
import { CreateTransferDto , UpdateTransferDto } from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('IPD Bed Transfers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ipd/transfers')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({ summary: 'Create bed transfer request' })
  @ApiResponse({ status: 201, description: 'Bed transfer created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - target bed occupied or same as source' })
  async create(@Body() createTransferDto: CreateTransferDto) {
    try {
      return await this.transfersService.create(createTransferDto);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get all bed transfers with filters' })
  @ApiQuery({ name: 'admissionId', required: false, description: 'Filter by admission ID' })
  @ApiQuery({ name: 'patientId', required: false, description: 'Filter by patient ID' })
  @ApiQuery({ name: 'wardId', required: false, description: 'Filter by ward ID' })
  @ApiQuery({ name: 'transferDate', required: false, description: 'Filter by transfer date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit results' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination' })
  @ApiResponse({ status: 200, description: 'List of bed transfers' })
  async findAll(
    @Query('admissionId') admissionId?: string,
    @Query('patientId') patientId?: string,
    @Query('wardId') wardId?: string,
    @Query('transferDate') transferDate?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.transfersService.findAll({
      admissionId,
      patientId,
      wardId,
      transferDate,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get bed transfer by ID' })
  @ApiResponse({ status: 200, description: 'Bed transfer found' })
  @ApiResponse({ status: 404, description: 'Bed transfer not found' })
  async findOne(@Param('id') id: string) {
    return this.transfersService.findOne(id);
  }

  @Get('admission/:admissionId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get bed transfers by admission ID' })
  @ApiResponse({ status: 200, description: 'Bed transfers found' })
  async findByAdmission(@Param('admissionId') admissionId: string) {
    return this.transfersService.findByAdmission(admissionId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({ summary: 'Update bed transfer' })
  @ApiResponse({ status: 200, description: 'Bed transfer updated successfully' })
  @ApiResponse({ status: 404, description: 'Bed transfer not found' })
  async update(@Param('id') id: string, @Body() updateTransferDto: UpdateTransferDto) {
    return this.transfersService.update(id, updateTransferDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete bed transfer record' })
  @ApiResponse({ status: 200, description: 'Bed transfer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Bed transfer not found' })
  async remove(@Param('id') id: string) {
    return this.transfersService.remove(id);
  }

  @Get('available-beds/:wardId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get available beds in a ward for transfer' })
  @ApiResponse({ status: 200, description: 'Available beds found' })
  async getAvailableBeds(@Param('wardId') wardId: string) {
    return this.transfersService.getAvailableBeds(wardId);
  }
}
