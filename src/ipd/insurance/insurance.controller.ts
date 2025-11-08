import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Query,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { InsuranceService } from './insurance.service';
import { 
  CreateInsuranceClaimDto, 
  UpdateInsuranceClaimDto, 
  CreatePreAuthDto, 
  UpdatePreAuthDto,
  ApplyInsuranceDto,
  ClaimStatus
} from './dto';

@Controller('ipd/insurance')
export class InsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  @Post('claims')
  @HttpCode(HttpStatus.CREATED)
  async createClaim(@Body() createClaimDto: CreateInsuranceClaimDto) {
    return this.insuranceService.createClaim(createClaimDto);
  }

  @Get('claims/admission/:admissionId')
  async getClaimsByAdmission(@Param('admissionId') admissionId: string) {
    return this.insuranceService.findByAdmissionId(admissionId);
  }

  @Get('claims/pending')
  async getPendingClaims(@Query('tpaName') tpaName?: string) {
    return this.insuranceService.getPendingClaims(tpaName);
  }

  @Get('claims/approved')
  async getApprovedClaims(@Query('tpaName') tpaName?: string) {
    return this.insuranceService.getApprovedClaims(tpaName);
  }

  @Get('claims')
  async getAllClaims(
    @Query('status') status?: string,
    @Query('claimType') claimType?: string,
    @Query('insuranceProvider') insuranceProvider?: string,
    @Query('tpaName') tpaName?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string
  ) {
    return this.insuranceService.findAll({
      status,
      claimType,
      insuranceProvider,
      tpaName,
      fromDate,
      toDate
    });
  }

  @Get('claims/:id')
  async getClaim(@Param('id') id: string) {
    return this.insuranceService.findOne(id);
  }

  @Put('claims/:id')
  async updateClaim(
    @Param('id') id: string,
    @Body() updateClaimDto: UpdateInsuranceClaimDto
  ) {
    return this.insuranceService.updateClaim(id, updateClaimDto);
  }

  @Post('claims/:claimId/apply')
  @HttpCode(HttpStatus.OK)
  async applyInsuranceToBilling(
    @Param('claimId') claimId: string,
    @Body() applyDto: ApplyInsuranceDto
  ) {
    return this.insuranceService.applyInsuranceToBilling(claimId, applyDto);
  }

  @Post('preauth')
  @HttpCode(HttpStatus.CREATED)
  async createPreAuth(@Body() createPreAuthDto: CreatePreAuthDto) {
    return this.insuranceService.createPreAuth(createPreAuthDto);
  }

  @Put('preauth/:claimId')
  async updatePreAuth(
    @Param('claimId') claimId: string,
    @Body() updatePreAuthDto: UpdatePreAuthDto
  ) {
    return this.insuranceService.updatePreAuth(claimId, updatePreAuthDto);
  }

  @Get('summary/:admissionId')
  async getInsuranceSummary(@Param('admissionId') admissionId: string) {
    return this.insuranceService.getInsuranceSummary(admissionId);
  }

  @Post('claims/:id/approve')
  @HttpCode(HttpStatus.OK)
  async approveClaim(
    @Param('id') id: string,
    @Body() body: { approvedAmount: number; reviewedBy: string; remarks?: string }
  ) {
    return this.insuranceService.updateClaim(id, {
      status: ClaimStatus.APPROVED,
      approvedAmount: body.approvedAmount,
      reviewedBy: body.reviewedBy,
      reviewRemarks: body.remarks,
      reviewedDate: new Date().toISOString()
    });
  }

  @Post('claims/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectClaim(
    @Param('id') id: string,
    @Body() body: { rejectionReason: string; reviewedBy: string; rejectedAmount?: number }
  ) {
    return this.insuranceService.updateClaim(id, {
      status: ClaimStatus.REJECTED,
      rejectionReason: body.rejectionReason,
      reviewedBy: body.reviewedBy,
      rejectedAmount: body.rejectedAmount || 0,
      reviewedDate: new Date().toISOString()
    });
  }

  @Post('claims/:id/submit')
  @HttpCode(HttpStatus.OK)
  async submitClaim(@Param('id') id: string) {
    return this.insuranceService.updateClaim(id, {
      status: ClaimStatus.SUBMITTED
    });
  }

  @Post('claims/:id/review')
  @HttpCode(HttpStatus.OK)
  async putUnderReview(@Param('id') id: string) {
    return this.insuranceService.updateClaim(id, {
      status: ClaimStatus.UNDER_REVIEW
    });
  }
}
