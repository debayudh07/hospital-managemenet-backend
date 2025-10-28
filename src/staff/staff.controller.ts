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
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffResponseDto } from './dto/staff-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { StaffRole } from '@prisma/client';

@ApiTags('staff')
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new staff member' })
  @ApiResponse({
    status: 201,
    description: 'Staff member created successfully',
    type: StaffResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async create(@Body() createStaffDto: CreateStaffDto): Promise<StaffResponseDto> {
    return this.staffService.create(createStaffDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'RECEPTIONIST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all staff members' })
  @ApiResponse({
    status: 200,
    description: 'List of all staff members',
    type: [StaffResponseDto],
  })
  async findAll(): Promise<StaffResponseDto[]> {
    return this.staffService.findAll();
  }

  @Get('role/:role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'RECEPTIONIST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get staff members by role' })
  @ApiParam({ name: 'role', enum: StaffRole, description: 'Staff role' })
  @ApiResponse({
    status: 200,
    description: 'List of staff members with the specified role',
    type: [StaffResponseDto],
  })
  async findByRole(@Param('role') role: StaffRole): Promise<StaffResponseDto[]> {
    return this.staffService.findByRole(role);
  }

  @Get('department/:department')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'RECEPTIONIST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get staff members by department' })
  @ApiParam({ name: 'department', description: 'Department name' })
  @ApiResponse({
    status: 200,
    description: 'List of staff members in the specified department',
    type: [StaffResponseDto],
  })
  async findByDepartment(
    @Param('department') department: string,
  ): Promise<StaffResponseDto[]> {
    return this.staffService.findByDepartment(department);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a staff member by ID' })
  @ApiParam({ name: 'id', description: 'Staff member ID' })
  @ApiResponse({
    status: 200,
    description: 'Staff member details',
    type: StaffResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  async findOne(@Param('id') id: string): Promise<StaffResponseDto> {
    return this.staffService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a staff member' })
  @ApiParam({ name: 'id', description: 'Staff member ID' })
  @ApiResponse({
    status: 200,
    description: 'Staff member updated successfully',
    type: StaffResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  async update(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
  ): Promise<StaffResponseDto> {
    return this.staffService.update(id, updateStaffDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a staff member' })
  @ApiParam({ name: 'id', description: 'Staff member ID' })
  @ApiResponse({
    status: 200,
    description: 'Staff member deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.staffService.remove(id);
    return { message: 'Staff member deleted successfully' };
  }
}
