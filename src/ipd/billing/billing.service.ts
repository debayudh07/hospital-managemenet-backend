import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus, PaymentMethod } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateIPDBillingDto, UpdateIPDBillingDto, PaymentDto, AddChargeDto, DailyChargeDto } from './dto';

@Injectable()
export class IPDBillingService {
  constructor(private prisma: PrismaService) {}

  // Create new IPD billing record
  async create(createIPDBillingDto: CreateIPDBillingDto) {
    // Verify admission exists
    const admission = await this.prisma.admission.findUnique({
      where: { id: createIPDBillingDto.admissionId },
      include: {
        patient: true,
        doctor: true,
        bed: {
          include: {
            ward: true
          }
        }
      }
    });

    if (!admission) {
      throw new NotFoundException('Admission not found');
    }

    // Check if billing already exists for this admission
    const existingBilling = await this.prisma.iPDBilling.findUnique({
      where: { admissionId: createIPDBillingDto.admissionId }
    });

    if (existingBilling) {
      throw new BadRequestException('Billing already exists for this admission');
    }

    // Generate unique bill number
    const billNumber = await this.generateBillNumber();

    // Calculate totals
    const {
      subtotal,
      totalAmount,
      balanceAmount
    } = this.calculateTotals(createIPDBillingDto);

    // Calculate initial day count (from admission date to now)
    const admissionDate = new Date(admission.admissionDate);
    const currentDate = new Date();
    const dayCount = Math.ceil((currentDate.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24));

    return this.prisma.iPDBilling.create({
      data: {
        admissionId: createIPDBillingDto.admissionId,
        billNumber,
        bedCharges: createIPDBillingDto.bedCharges || 0,
        roomCharges: createIPDBillingDto.roomCharges || 0,
        icuCharges: createIPDBillingDto.icuCharges || 0,
        nursingCharges: createIPDBillingDto.nursingCharges || 0,
        doctorFees: createIPDBillingDto.doctorFees || 0,
        consultationFees: createIPDBillingDto.consultationFees || 0,
        procedureFees: createIPDBillingDto.procedureFees || 0,
        surgeryFees: createIPDBillingDto.surgeryFees || 0,
        labCharges: createIPDBillingDto.labCharges || 0,
        radiologyCharges: createIPDBillingDto.radiologyCharges || 0,
        pathologyCharges: createIPDBillingDto.pathologyCharges || 0,
        medicineCharges: createIPDBillingDto.medicineCharges || 0,
        injectionCharges: createIPDBillingDto.injectionCharges || 0,
        equipmentCharges: createIPDBillingDto.equipmentCharges || 0,
        miscellaneousCharges: createIPDBillingDto.miscellaneousCharges || 0,
        ambulanceCharges: createIPDBillingDto.ambulanceCharges || 0,
        subtotal,
        discount: createIPDBillingDto.discount || 0,
        tax: createIPDBillingDto.tax || 0,
        totalAmount,
        paymentStatus: createIPDBillingDto.paidAmount && createIPDBillingDto.paidAmount >= totalAmount 
          ? PaymentStatus.COMPLETED 
          : PaymentStatus.PENDING,
        paymentMethod: createIPDBillingDto.paymentMethod,
        paidAmount: createIPDBillingDto.paidAmount || 0,
        balanceAmount,
        depositAmount: createIPDBillingDto.depositAmount || 0,
        insuranceClaimed: createIPDBillingDto.insuranceClaimed || 0,
        transactionId: createIPDBillingDto.transactionId,
        paymentDate: createIPDBillingDto.paymentDate ? new Date(createIPDBillingDto.paymentDate) : null,
        notes: createIPDBillingDto.notes,
        dayCount,
        lastChargeDate: new Date()
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
        }
      }
    });
  }

  // Get billing by admission ID
  async findByAdmissionId(admissionId: string) {
    const billing = await this.prisma.iPDBilling.findUnique({
      where: { admissionId },
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
        }
      }
    });

    if (!billing) {
      throw new NotFoundException('Billing record not found');
    }

    return billing;
  }

  // Get billing by ID
  async findOne(id: string) {
    const billing = await this.prisma.iPDBilling.findUnique({
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
        }
      }
    });

    if (!billing) {
      throw new NotFoundException('Billing record not found');
    }

    return billing;
  }

  // Get all IPD billings with filters
  async findAll(filters: {
    status?: string;
    wardId?: string;
    departmentId?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    const where: any = {};

    if (filters.status && filters.status !== 'ALL') {
      where.paymentStatus = filters.status as PaymentStatus;
    }

    if (filters.wardId) {
      where.admission = {
        ...where.admission,
        bed: {
          wardId: filters.wardId
        }
      };
    }

    if (filters.departmentId) {
      where.admission = {
        ...where.admission,
        bed: {
          ward: {
            departmentId: filters.departmentId
          }
        }
      };
    }

    if (filters.fromDate && filters.toDate) {
      where.createdAt = {
        gte: new Date(filters.fromDate),
        lte: new Date(filters.toDate)
      };
    }

    return this.prisma.iPDBilling.findMany({
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Update IPD billing
  async update(id: string, updateIPDBillingDto: UpdateIPDBillingDto) {
    const existingBilling = await this.findOne(id);

    // Recalculate totals
    const updatedData = { ...existingBilling, ...updateIPDBillingDto };
    const {
      subtotal,
      totalAmount,
      balanceAmount
    } = this.calculateTotals(updatedData);

    return this.prisma.iPDBilling.update({
      where: { id },
      data: {
        ...updateIPDBillingDto,
        subtotal,
        totalAmount,
        balanceAmount,
        paymentStatus: updatedData.paidAmount >= totalAmount 
          ? PaymentStatus.COMPLETED 
          : PaymentStatus.PENDING,
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
        }
      }
    });
  }

  // Record payment
  async recordPayment(id: string, paymentDto: PaymentDto) {
    const billing = await this.findOne(id);
    const newPaidAmount = billing.paidAmount + paymentDto.amount;
    const newBalanceAmount = billing.totalAmount - newPaidAmount;

    if (newPaidAmount > billing.totalAmount) {
      throw new BadRequestException('Payment amount exceeds total amount');
    }

    return this.prisma.iPDBilling.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        balanceAmount: newBalanceAmount,
        paymentStatus: newBalanceAmount <= 0 ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
        paymentMethod: paymentDto.paymentMethod,
        transactionId: paymentDto.transactionId,
        paymentDate: new Date(),
        notes: paymentDto.notes ? `${billing.notes || ''}\nPayment: ${paymentDto.notes}` : billing.notes
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
        }
      }
    });
  }

  // Add additional charges
  async addCharge(id: string, addChargeDto: AddChargeDto) {
    const billing = await this.findOne(id);
    
    const updateData: any = {};
    
    switch (addChargeDto.chargeType.toLowerCase()) {
      case 'bed':
        updateData.bedCharges = billing.bedCharges + addChargeDto.amount;
        break;
      case 'room':
        updateData.roomCharges = billing.roomCharges + addChargeDto.amount;
        break;
      case 'icu':
        updateData.icuCharges = billing.icuCharges + addChargeDto.amount;
        break;
      case 'nursing':
        updateData.nursingCharges = billing.nursingCharges + addChargeDto.amount;
        break;
      case 'doctor':
        updateData.doctorFees = billing.doctorFees + addChargeDto.amount;
        break;
      case 'consultation':
        updateData.consultationFees = billing.consultationFees + addChargeDto.amount;
        break;
      case 'procedure':
        updateData.procedureFees = billing.procedureFees + addChargeDto.amount;
        break;
      case 'surgery':
        updateData.surgeryFees = billing.surgeryFees + addChargeDto.amount;
        break;
      case 'lab':
        updateData.labCharges = billing.labCharges + addChargeDto.amount;
        break;
      case 'radiology':
        updateData.radiologyCharges = billing.radiologyCharges + addChargeDto.amount;
        break;
      case 'pathology':
        updateData.pathologyCharges = billing.pathologyCharges + addChargeDto.amount;
        break;
      case 'medicine':
        updateData.medicineCharges = billing.medicineCharges + addChargeDto.amount;
        break;
      case 'injection':
        updateData.injectionCharges = billing.injectionCharges + addChargeDto.amount;
        break;
      case 'equipment':
        updateData.equipmentCharges = billing.equipmentCharges + addChargeDto.amount;
        break;
      case 'ambulance':
        updateData.ambulanceCharges = billing.ambulanceCharges + addChargeDto.amount;
        break;
      case 'miscellaneous':
        updateData.miscellaneousCharges = billing.miscellaneousCharges + addChargeDto.amount;
        break;
      default:
        updateData.miscellaneousCharges = billing.miscellaneousCharges + addChargeDto.amount;
    }

    // Add description to notes
    if (addChargeDto.description) {
      updateData.notes = `${billing.notes || ''}\n${addChargeDto.chargeType}: ${addChargeDto.description} - ₹${addChargeDto.amount}`;
    }

    return this.update(id, updateData);
  }

  // Manual daily charge application
  async applyDailyCharges(dailyChargeDto: DailyChargeDto) {
    const billing = await this.findByAdmissionId(dailyChargeDto.admissionId);
    const bed = billing.admission.bed;
    
    if (!bed.dailyRate) {
      throw new BadRequestException('No daily rate set for this bed');
    }

    const currentCharges = billing.bedCharges + bed.dailyRate;
    const newDayCount = billing.dayCount + 1;

    return this.update(billing.id, {
      bedCharges: currentCharges,
      dayCount: newDayCount,
      lastChargeDate: dailyChargeDto.chargeDate ? dailyChargeDto.chargeDate : new Date().toISOString()
    });
  }

  // Automatic daily charge cron job (runs at 00:00 every day)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyCharges() {
    const startTime = new Date().toISOString();
    console.log(`🏥 [${startTime}] Starting daily IPD bed charges cron job at midnight...`);
    
    try {
      // Get all active admissions with billing that haven't been discharged
      const activeAdmissions = await this.prisma.admission.findMany({
        where: {
          actualDischargeDate: null,
          billing: {
            isNot: null
          }
        },
        include: {
          billing: true,
          bed: true,
          patient: true
        }
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const admission of activeAdmissions) {
        const billing = admission.billing;
        const bed = admission.bed;

        // Skip if billing is null (shouldn't happen with our query, but safety check)
        if (!billing) {
          continue;
        }

        // Check if charges have already been applied today
        const lastChargeDate = billing.lastChargeDate ? new Date(billing.lastChargeDate) : null;
        if (lastChargeDate) {
          lastChargeDate.setHours(0, 0, 0, 0);
          if (lastChargeDate.getTime() === today.getTime()) {
            continue; // Skip if already charged today
          }
        }

        // Apply daily bed charges if bed has daily rate
        if (bed.dailyRate && bed.dailyRate > 0) {
          const newBedCharges = billing.bedCharges + bed.dailyRate;
          const newDayCount = billing.dayCount + 1;

          // Calculate new totals
          const updatedBilling = {
            ...billing,
            bedCharges: newBedCharges,
            dayCount: newDayCount
          };

          const { subtotal, totalAmount, balanceAmount } = this.calculateTotals(updatedBilling);

          await this.prisma.iPDBilling.update({
            where: { id: billing.id },
            data: {
              bedCharges: newBedCharges,
              dayCount: newDayCount,
              subtotal,
              totalAmount,
              balanceAmount: totalAmount - billing.paidAmount,
              lastChargeDate: today
            }
          });

          console.log(`✅ Applied daily charge of ₹${bed.dailyRate} for patient ${admission.patient.firstName} ${admission.patient.lastName} (Admission: ${admission.admissionId})`);
        }
      }

      console.log('✅ Daily IPD charges completed successfully');
    } catch (error) {
      console.error('❌ Error applying daily IPD charges:', error);
    }
    
    const endTime = new Date().toISOString();
    console.log(`🏥 [${endTime}] Daily IPD bed charges cron job completed.`);
  }

  // Get pending payments
  async getPendingPayments(wardId?: string, departmentId?: string) {
    return this.findAll({
      status: 'PENDING',
      wardId,
      departmentId
    });
  }

  // Get completed payments
  async getCompletedPayments(wardId?: string, departmentId?: string) {
    return this.findAll({
      status: 'COMPLETED',
      wardId,
      departmentId
    });
  }

  // Private helper methods
  private calculateTotals(billingData: any) {
    const subtotal = 
      (billingData.bedCharges || 0) +
      (billingData.roomCharges || 0) +
      (billingData.icuCharges || 0) +
      (billingData.nursingCharges || 0) +
      (billingData.doctorFees || 0) +
      (billingData.consultationFees || 0) +
      (billingData.procedureFees || 0) +
      (billingData.surgeryFees || 0) +
      (billingData.labCharges || 0) +
      (billingData.radiologyCharges || 0) +
      (billingData.pathologyCharges || 0) +
      (billingData.medicineCharges || 0) +
      (billingData.injectionCharges || 0) +
      (billingData.equipmentCharges || 0) +
      (billingData.miscellaneousCharges || 0) +
      (billingData.ambulanceCharges || 0);

    const discount = billingData.discount || 0;
    const tax = billingData.tax || 0;
    const totalAmount = subtotal + tax - discount;
    const paidAmount = billingData.paidAmount || 0;
    const balanceAmount = totalAmount - paidAmount;

    return {
      subtotal,
      totalAmount,
      balanceAmount
    };
  }

  private async generateBillNumber(): Promise<string> {
    const prefix = 'IPD';
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Find the last bill number for this month
    const lastBill = await this.prisma.iPDBilling.findFirst({
      where: {
        billNumber: {
          startsWith: `${prefix}${year}${month}`
        }
      },
      orderBy: {
        billNumber: 'desc'
      }
    });

    let nextNumber = 1;
    if (lastBill) {
      const lastNumber = parseInt(lastBill.billNumber.slice(-6));
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${year}${month}${String(nextNumber).padStart(6, '0')}`;
  }
}
