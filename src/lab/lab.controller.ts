import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  Res
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiQuery,
  ApiParam,
  ApiBearerAuth 
} from '@nestjs/swagger';
import type { Response } from 'express';
import { LabService } from './lab.service';
import { LabReportService } from './lab-report.service';
import { 
  CreateLabTestDto, 
  UpdateLabTestDto,
  CreateLabOrderDto,
  UpdateLabOrderStatusDto,
  CreateLabResultDto,
  UpdateLabResultDto,
  VerifyLabResultDto,
  CreateLabDepartmentDto,
  CreateLabTemplateDto
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { UserRole, LabOrderStatus, Priority } from '@prisma/client';

@ApiTags('Laboratory Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lab')
export class LabController {
  constructor(
    private readonly labService: LabService,
    private readonly labReportService: LabReportService,
  ) {}

  // Test Management Endpoints
  @Get('tests')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.LAB_TECHNICIAN, UserRole.NURSE)
  @ApiOperation({ summary: 'Get all lab tests' })
  @ApiQuery({ name: 'department', required: false, description: 'Filter by department' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiResponse({ status: 200, description: 'List of lab tests retrieved successfully' })
  async findAllTests(
    @Query('department') department?: string,
    @Query('category') category?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.labService.findAllTests({ department, category, isActive });
  }

  @Get('tests/:id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.LAB_TECHNICIAN, UserRole.NURSE)
  @ApiOperation({ summary: 'Get lab test by ID' })
  @ApiParam({ name: 'id', description: 'Test ID' })
  @ApiResponse({ status: 200, description: 'Lab test retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Lab test not found' })
  async findTestById(@Param('id') id: string) {
    return this.labService.findTestById(id);
  }

  @Post('tests')
  @Roles(UserRole.ADMIN, UserRole.LAB_TECHNICIAN)
  @ApiOperation({ summary: 'Create new lab test' })
  @ApiResponse({ status: 201, description: 'Lab test created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  async createTest(@Body() createLabTestDto: CreateLabTestDto) {
    return this.labService.createTest(createLabTestDto);
  }

  @Put('tests/:id')
  @Roles(UserRole.ADMIN, UserRole.LAB_TECHNICIAN)
  @ApiOperation({ summary: 'Update lab test' })
  @ApiParam({ name: 'id', description: 'Test ID' })
  @ApiResponse({ status: 200, description: 'Lab test updated successfully' })
  @ApiResponse({ status: 404, description: 'Lab test not found' })
  async updateTest(
    @Param('id') id: string,
    @Body() updateLabTestDto: UpdateLabTestDto,
  ) {
    return this.labService.updateTest(id, updateLabTestDto);
  }

  @Delete('tests/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate lab test' })
  @ApiParam({ name: 'id', description: 'Test ID' })
  @ApiResponse({ status: 200, description: 'Lab test deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Lab test not found' })
  async deleteTest(@Param('id') id: string) {
    return this.labService.deleteTest(id);
  }

  // Department Management Endpoints
  @Get('departments')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.LAB_TECHNICIAN, UserRole.NURSE)
  @ApiOperation({ summary: 'Get all lab departments' })
  @ApiResponse({ status: 200, description: 'List of lab departments retrieved successfully' })
  async findAllDepartments() {
    return this.labService.findAllDepartments();
  }

  @Post('departments')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new lab department' })
  @ApiResponse({ status: 201, description: 'Lab department created successfully' })
  async createDepartment(@Body() createLabDepartmentDto: CreateLabDepartmentDto) {
    return this.labService.createDepartment(createLabDepartmentDto);
  }

  // Template Management Endpoints
  @Get('templates')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.LAB_TECHNICIAN)
  @ApiOperation({ summary: 'Get all lab templates' })
  @ApiResponse({ status: 200, description: 'List of lab templates retrieved successfully' })
  async findAllTemplates() {
    return this.labService.findAllTemplates();
  }

  @Post('templates')
  @Roles(UserRole.ADMIN, UserRole.LAB_TECHNICIAN)
  @ApiOperation({ summary: 'Create new lab template' })
  @ApiResponse({ status: 201, description: 'Lab template created successfully' })
  async createTemplate(@Body() createLabTemplateDto: CreateLabTemplateDto) {
    return this.labService.createTemplate(createLabTemplateDto);
  }

  // Order Management Endpoints
  @Get('orders')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.LAB_TECHNICIAN, UserRole.NURSE)
  @ApiOperation({ summary: 'Get all lab orders' })
  @ApiQuery({ name: 'patientId', required: false, description: 'Filter by patient ID' })
  @ApiQuery({ name: 'doctorId', required: false, description: 'Filter by doctor ID' })
  @ApiQuery({ name: 'status', required: false, enum: LabOrderStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'priority', required: false, enum: Priority, description: 'Filter by priority' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit results' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination' })
  @ApiResponse({ status: 200, description: 'List of lab orders retrieved successfully' })
  async findAllOrders(
    @Query('patientId') patientId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('status') status?: LabOrderStatus,
    @Query('priority') priority?: Priority,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.labService.findAllOrders({
      patientId,
      doctorId,
      status,
      priority,
      limit,
      offset,
    });
  }

  @Get('orders/:id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.LAB_TECHNICIAN, UserRole.NURSE)
  @ApiOperation({ summary: 'Get lab order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Lab order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Lab order not found' })
  async findOrderById(@Param('id') id: string) {
    return this.labService.findOrderById(id);
  }

  @Post('orders')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Create new lab order' })
  @ApiResponse({ status: 201, description: 'Lab order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  async createOrder(@Body() createLabOrderDto: CreateLabOrderDto) {
    return this.labService.createOrder(createLabOrderDto);
  }

  @Put('orders/:id/status')
  @Roles(UserRole.ADMIN, UserRole.LAB_TECHNICIAN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Update lab order status' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Lab order status updated successfully' })
  @ApiResponse({ status: 404, description: 'Lab order not found' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateLabOrderStatusDto: UpdateLabOrderStatusDto,
    @GetUser('id') userId: string,
  ) {
    return this.labService.updateOrderStatus(id, updateLabOrderStatusDto, userId);
  }

  @Put('orders/:id/report')
  @Roles(UserRole.ADMIN, UserRole.LAB_TECHNICIAN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Update lab order report' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Lab order report updated successfully' })
  @ApiResponse({ status: 404, description: 'Lab order not found' })
  async updateOrderReport(
    @Param('id') id: string,
    @Body() body: { report: string },
  ) {
    return this.labService.updateOrderReport(id, body.report);
  }

  // Result Management Endpoints
  @Get('orders/:orderId/results')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.LAB_TECHNICIAN, UserRole.NURSE)
  @ApiOperation({ summary: 'Get results for lab order' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Lab results retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Lab order not found' })
  async findResultsByOrder(@Param('orderId') orderId: string) {
    return this.labService.findResultsByOrder(orderId);
  }

  @Post('orders/:orderId/results')
  @Roles(UserRole.ADMIN, UserRole.LAB_TECHNICIAN)
  @ApiOperation({ summary: 'Add result to lab order' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({ status: 201, description: 'Lab result added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Lab order not found' })
  async addResult(
    @Param('orderId') orderId: string,
    @Body() createLabResultDto: CreateLabResultDto,
  ) {
    return this.labService.addResult(orderId, createLabResultDto);
  }

  @Put('results/:id')
  @Roles(UserRole.ADMIN, UserRole.LAB_TECHNICIAN)
  @ApiOperation({ summary: 'Update lab result' })
  @ApiParam({ name: 'id', description: 'Result ID' })
  @ApiResponse({ status: 200, description: 'Lab result updated successfully' })
  @ApiResponse({ status: 404, description: 'Lab result not found' })
  @ApiResponse({ status: 400, description: 'Cannot update verified result' })
  async updateResult(
    @Param('id') id: string,
    @Body() updateLabResultDto: UpdateLabResultDto,
  ) {
    return this.labService.updateResult(id, updateLabResultDto);
  }

  @Put('results/:id/verify')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Verify lab result' })
  @ApiParam({ name: 'id', description: 'Result ID' })
  @ApiResponse({ status: 200, description: 'Lab result verified successfully' })
  @ApiResponse({ status: 404, description: 'Lab result not found' })
  @ApiResponse({ status: 400, description: 'Result already verified or invalid verifier' })
  async verifyResult(
    @Param('id') id: string,
    @Body() verifyLabResultDto: VerifyLabResultDto,
  ) {
    return this.labService.verifyResult(id, verifyLabResultDto);
  }

  // Report Generation Endpoints
  @Get('reports/patient/:patientId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({ summary: 'Generate patient lab report PDF' })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  @ApiResponse({ status: 200, description: 'Patient lab report generated successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async generatePatientReport(
    @Param('patientId') patientId: string,
    @Res() res: Response,
  ) {
    const reportBuffer = await this.labReportService.generatePatientReport(patientId);
    const filename = `patient-lab-report-${patientId}-${new Date().toISOString().split('T')[0]}.pdf`;
    
    await this.labReportService.sendReportResponse(res, reportBuffer, filename);
  }

  @Get('reports/order/:orderId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.LAB_TECHNICIAN, UserRole.NURSE)
  @ApiOperation({ summary: 'Generate lab order report PDF' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Lab order report generated successfully' })
  @ApiResponse({ status: 404, description: 'Lab order not found' })
  async generateOrderReport(
    @Param('orderId') orderId: string,
    @Res() res: Response,
  ) {
    const reportBuffer = await this.labReportService.generateOrderReport(orderId);
    const filename = `lab-order-report-${orderId}-${new Date().toISOString().split('T')[0]}.pdf`;
    
    await this.labReportService.sendReportResponse(res, reportBuffer, filename);
  }

  @Get('reports/department')
  @Roles(UserRole.ADMIN, UserRole.LAB_TECHNICIAN)
  @ApiOperation({ summary: 'Generate department summary report PDF' })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filter by department ID' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Start date filter (YYYY-MM-DD)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'End date filter (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Department report generated successfully' })
  async generateDepartmentReport(
    @Res() res: Response,
    @Query('departmentId') departmentId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const dateFromParsed = dateFrom ? new Date(dateFrom) : undefined;
    const dateToParsed = dateTo ? new Date(dateTo) : undefined;
    
    const reportBuffer = await this.labReportService.generateDepartmentReport(
      departmentId,
      dateFromParsed,
      dateToParsed,
    );
    
    const filename = `department-report-${departmentId || 'all'}-${new Date().toISOString().split('T')[0]}.pdf`;
    
    await this.labReportService.sendReportResponse(res, reportBuffer, filename);
  }
}
