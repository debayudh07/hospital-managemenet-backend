import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IPDBillingService } from '../billing/billing.service';
import { 
  CreateInsuranceClaimDto, 
  UpdateInsuranceClaimDto, 
  CreatePreAuthDto, 
  UpdatePreAuthDto,
  ApplyInsuranceDto,
  ClaimStatus,
  ClaimType
} from './dto';

@Injectable()
export class InsuranceService {
  constructor(
    private prisma: PrismaService,
    private billingService: IPDBillingService
  ) {}

  // Create new insurance claim
  async createClaim(createClaimDto: CreateInsuranceClaimDto) {
    // Verify admission and billing exist
    const admission = await this.prisma.admission.findUnique({
      where: { id: createClaimDto.admissionId },
      include: {
        patient: true,
        billing: true
      }
    });

    if (!admission) {
      throw new NotFoundException('Admission not found');
    }

    if (!admission.billing) {
      throw new BadRequestException('No billing record found for this admission');
    }

    // Generate unique claim number
    const claimNumber = await this.generateClaimNumber();

    return this.prisma.insuranceClaim.create({
      data: {
        claimNumber,
        admissionId: createClaimDto.admissionId,
        billingId: admission.billing.id,
        policyNumber: createClaimDto.policyNumber,
        insuranceProvider: createClaimDto.insuranceProvider,
        tpaName: createClaimDto.tpaName,
        claimType: createClaimDto.claimType,
        claimedAmount: createClaimDto.claimedAmount,
        diagnosisCode: createClaimDto.diagnosisCode,
        treatmentCode: createClaimDto.treatmentCode,
        preAuthNumber: createClaimDto.preAuthNumber,
        preAuthDate: createClaimDto.preAuthDate ? new Date(createClaimDto.preAuthDate) : null,
        preAuthAmount: createClaimDto.preAuthAmount,
        remarks: createClaimDto.remarks,
        attachments: createClaimDto.attachments,
        isEmergency: createClaimDto.isEmergency || false,
        contactPerson: createClaimDto.contactPerson,
        contactPhone: createClaimDto.contactPhone,
        urgency: createClaimDto.urgency,
        status: 'PENDING'
      },
      include: {
        admission: {
          include: {
            patient: true,
            doctor: true,
            bed: {
              include: {
                ward: true
              }
            }
          }
        },
        billing: true
      }
    });
  }

  // Update insurance claim
  async updateClaim(id: string, updateClaimDto: UpdateInsuranceClaimDto) {
    const existingClaim = await this.findOne(id);

    const updatedClaim = await this.prisma.insuranceClaim.update({
      where: { id },
      data: {
        ...updateClaimDto,
        reviewedDate: updateClaimDto.reviewedDate ? new Date(updateClaimDto.reviewedDate) : undefined,
        settlementDate: updateClaimDto.settlementDate ? new Date(updateClaimDto.settlementDate) : undefined,
        updatedAt: new Date()
      },
      include: {
        admission: {
          include: {
            patient: true,
            doctor: true,
            bed: {
              include: {
                ward: true
              }
            }
          }
        },
        billing: true
      }
    });

    // If claim is approved, automatically apply insurance to billing
    if (updateClaimDto.status === ClaimStatus.APPROVED && updateClaimDto.approvedAmount) {
      await this.applyInsuranceToBilling(id, {
        admissionId: existingClaim.admissionId,
        claimId: id,
        amountToApply: updateClaimDto.approvedAmount
      });
    }

    return updatedClaim;
  }

  // Apply approved insurance amount to billing
  async applyInsuranceToBilling(claimId: string, applyDto: ApplyInsuranceDto) {
    const claim = await this.findOne(claimId);
    
    if (claim.status !== 'APPROVED') {
      throw new BadRequestException('Insurance claim must be approved before applying to billing');
    }

    const billing = await this.billingService.findByAdmissionId(applyDto.admissionId);
    const amountToApply = applyDto.amountToApply || claim.approvedAmount;

    if (amountToApply > claim.approvedAmount) {
      throw new BadRequestException('Cannot apply more than approved amount');
    }

    // Calculate new insurance amounts
    const newInsuranceClaimed = billing.insuranceClaimed + amountToApply;
    const newInsuranceApproved = billing.insuranceApproved + amountToApply;
    const newBalanceAmount = billing.totalAmount - billing.paidAmount - newInsuranceApproved;

    // Update billing with insurance amounts
    await this.billingService.update(billing.id, {
      insuranceClaimed: newInsuranceClaimed,
      insuranceApproved: newInsuranceApproved,
      balanceAmount: Math.max(0, newBalanceAmount) // Ensure balance doesn't go negative
    });

    // Update claim with settlement details
    await this.prisma.insuranceClaim.update({
      where: { id: claimId },
      data: {
        settlementAmount: amountToApply,
        settlementDate: new Date()
      }
    });

    return this.findOne(claimId);
  }

  // Create pre-authorization request
  async createPreAuth(createPreAuthDto: CreatePreAuthDto) {
    const admission = await this.prisma.admission.findUnique({
      where: { id: createPreAuthDto.admissionId },
      include: { patient: true, billing: true }
    });

    if (!admission) {
      throw new NotFoundException('Admission not found');
    }

    // Create claim with pre-auth status
    return this.createClaim({
      ...createPreAuthDto,
      claimType: ClaimType.CASHLESS,
      claimedAmount: createPreAuthDto.estimatedAmount,
      preAuthAmount: createPreAuthDto.estimatedAmount,
      urgency: createPreAuthDto.urgency
    });
  }

  // Update pre-authorization
  async updatePreAuth(claimId: string, updatePreAuthDto: UpdatePreAuthDto) {
    return this.updateClaim(claimId, {
      preAuthStatus: updatePreAuthDto.status,
      approvedAmount: updatePreAuthDto.approvedAmount,
      preAuthNumber: updatePreAuthDto.preAuthNumber,
      rejectionReason: updatePreAuthDto.rejectionReason,
      reviewedBy: updatePreAuthDto.reviewedBy,
      validityPeriod: updatePreAuthDto.validityPeriod,
      conditions: updatePreAuthDto.conditions,
      reviewedDate: new Date().toISOString()
    });
  }

  // Get claim by ID
  async findOne(id: string) {
    const claim = await this.prisma.insuranceClaim.findUnique({
      where: { id },
      include: {
        admission: {
          include: {
            patient: true,
            doctor: true,
            bed: {
              include: {
                ward: true
              }
            }
          }
        },
        billing: true
      }
    });

    if (!claim) {
      throw new NotFoundException('Insurance claim not found');
    }

    return claim;
  }

  // Get claims by admission ID
  async findByAdmissionId(admissionId: string) {
    return this.prisma.insuranceClaim.findMany({
      where: { admissionId },
      include: {
        admission: {
          include: {
            patient: true,
            doctor: true
          }
        },
        billing: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Get all claims with filters
  async findAll(filters: {
    status?: string;
    claimType?: string;
    insuranceProvider?: string;
    tpaName?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    const where: any = {};

    if (filters.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }

    if (filters.claimType) {
      where.claimType = filters.claimType;
    }

    if (filters.insuranceProvider) {
      where.insuranceProvider = {
        contains: filters.insuranceProvider,
        mode: 'insensitive'
      };
    }

    if (filters.tpaName) {
      where.tpaName = {
        contains: filters.tpaName,
        mode: 'insensitive'
      };
    }

    if (filters.fromDate && filters.toDate) {
      where.createdAt = {
        gte: new Date(filters.fromDate),
        lte: new Date(filters.toDate)
      };
    }

    return this.prisma.insuranceClaim.findMany({
      where,
      include: {
        admission: {
          include: {
            patient: true,
            doctor: true,
            bed: {
              include: {
                ward: true
              }
            }
          }
        },
        billing: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Get pending claims
  async getPendingClaims(tpaName?: string) {
    return this.findAll({
      status: 'PENDING',
      tpaName
    });
  }

  // Get approved claims
  async getApprovedClaims(tpaName?: string) {
    return this.findAll({
      status: 'APPROVED',
      tpaName
    });
  }

  // Calculate insurance summary for an admission
  async getInsuranceSummary(admissionId: string) {
    const claims = await this.findByAdmissionId(admissionId);
    const billing = await this.billingService.findByAdmissionId(admissionId);

    const summary = {
      totalClaimed: claims.reduce((sum, claim) => sum + claim.claimedAmount, 0),
      totalApproved: claims.reduce((sum, claim) => sum + claim.approvedAmount, 0),
      totalRejected: claims.reduce((sum, claim) => sum + claim.rejectedAmount, 0),
      totalSettled: claims.reduce((sum, claim) => sum + (claim.settlementAmount || 0), 0),
      billingInsuranceApproved: billing.insuranceApproved,
      billingInsuranceClaimed: billing.insuranceClaimed,
      billingInsurancePending: billing.insurancePending,
      claims: claims
    };

    return summary;
  }

  // Private helper methods
  private async generateClaimNumber(): Promise<string> {
    const prefix = 'INS';
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Find the last claim number for this month
    const lastClaim = await this.prisma.insuranceClaim.findFirst({
      where: {
        claimNumber: {
          startsWith: `${prefix}${year}${month}`
        }
      },
      orderBy: {
        claimNumber: 'desc'
      }
    });

    let nextNumber = 1;
    if (lastClaim) {
      const lastNumber = parseInt(lastClaim.claimNumber.slice(-6));
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${year}${month}${String(nextNumber).padStart(6, '0')}`;
  }
}
