import { 
  Controller, 
  Get, 
  Query,
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { IpdService } from './ipd.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('IPD Main')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ipd')
export class IpdController {
  constructor(private readonly ipdService: IpdService) {}

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get IPD dashboard statistics' })
  @ApiResponse({ status: 200, description: 'IPD dashboard data' })
  async getDashboard() {
    return this.ipdService.getDashboardStats();
  }

  @Get('census')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get current IPD patient census' })
  @ApiQuery({ name: 'wardId', required: false, description: 'Filter by ward ID' })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filter by department ID' })
  @ApiResponse({ status: 200, description: 'Current IPD census' })
  async getCurrentCensus(
    @Query('wardId') wardId?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.ipdService.getCurrentCensus({ wardId, departmentId });
  }

  @Get('overview')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get comprehensive IPD overview' })
  @ApiResponse({ status: 200, description: 'IPD overview with all relevant data' })
  async getIpdOverview() {
    return this.ipdService.getIpdOverview();
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({ summary: 'Get detailed IPD statistics and analytics' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period (daily, weekly, monthly, yearly)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for statistics (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for statistics (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'IPD statistics and analytics' })
  async getStatistics(
    @Query('period') period?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.ipdService.getStatistics({ period, startDate, endDate });
  }
}
