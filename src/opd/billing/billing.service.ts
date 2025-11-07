import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus, PaymentMethod } from '@prisma/client';

export interface CreateOPDBillingDto {
  opdVisitId: string;
  consultationFee: number;
  additionalCharges?: number;
  discount?: number;
  tax?: number;
  paymentMethod?: PaymentMethod;
  paidAmount?: number;
  transactionId?: string;
  notes?: string;
}

export interface UpdateOPDBillingDto {
  consultationFee?: number;
  additionalCharges?: number;
  discount?: number;
  tax?: number;
  paymentMethod?: PaymentMethod;
  paidAmount?: number;
  transactionId?: string;
  notes?: string;
}

export interface PaymentDto {
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  notes?: string;
}

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async create(createOPDBillingDto: CreateOPDBillingDto) {
    // Verify OPD visit exists
    const opdVisit = await this.prisma.oPDVisit.findUnique({
      where: { id: createOPDBillingDto.opdVisitId }
    });

    if (!opdVisit) {
      throw new NotFoundException('OPD visit not found');
    }

    // Check if billing already exists for this visit
    const existingBilling = await this.prisma.oPDBilling.findUnique({
      where: { opdVisitId: createOPDBillingDto.opdVisitId }
    });

    if (existingBilling) {
      throw new Error('Billing already exists for this OPD visit');
    }

    // Calculate totals
    const consultationFee = createOPDBillingDto.consultationFee;
    const additionalCharges = createOPDBillingDto.additionalCharges || 0;
    const discount = createOPDBillingDto.discount || 0;
    const tax = createOPDBillingDto.tax || 0;
    const totalAmount = consultationFee + additionalCharges + tax - discount;
    const paidAmount = createOPDBillingDto.paidAmount || 0;
    const balanceAmount = totalAmount - paidAmount;

    return this.prisma.oPDBilling.create({
      data: {
        opdVisitId: createOPDBillingDto.opdVisitId,
        consultationFee,
        additionalCharges,
        discount,
        tax,
        totalAmount,
        paymentStatus: paidAmount >= totalAmount ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
        paymentMethod: createOPDBillingDto.paymentMethod,
        paidAmount,
        balanceAmount,
        transactionId: createOPDBillingDto.transactionId,
        paymentDate: paidAmount > 0 ? new Date() : null,
        notes: createOPDBillingDto.notes,
      },
      include: {
        opdVisit: {
          include: {
            patient: true,
            doctor: true,
          }
        }
      }
    });
  }

  async findByVisitId(opdVisitId: string) {
    return this.prisma.oPDBilling.findUnique({
      where: { opdVisitId },
      include: {
        opdVisit: {
          include: {
            patient: true,
            doctor: true,
          }
        }
      }
    });
  }

  async findOne(id: string) {
    const billing = await this.prisma.oPDBilling.findUnique({
      where: { id },
      include: {
        opdVisit: {
          include: {
            patient: true,
            doctor: true,
          }
        }
      }
    });

    if (!billing) {
      throw new NotFoundException('Billing record not found');
    }

    return billing;
  }

  async update(id: string, updateOPDBillingDto: UpdateOPDBillingDto) {
    const existingBilling = await this.findOne(id);

    // Recalculate totals
    const consultationFee = updateOPDBillingDto.consultationFee ?? existingBilling.consultationFee;
    const additionalCharges = updateOPDBillingDto.additionalCharges ?? existingBilling.additionalCharges;
    const discount = updateOPDBillingDto.discount ?? existingBilling.discount;
    const tax = updateOPDBillingDto.tax ?? existingBilling.tax;
    const totalAmount = consultationFee + additionalCharges + tax - discount;
    const paidAmount = updateOPDBillingDto.paidAmount ?? existingBilling.paidAmount;
    const balanceAmount = totalAmount - paidAmount;

    return this.prisma.oPDBilling.update({
      where: { id },
      data: {
        ...updateOPDBillingDto,
        totalAmount,
        balanceAmount,
        paymentStatus: paidAmount >= totalAmount ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
      },
      include: {
        opdVisit: {
          include: {
            patient: true,
            doctor: true,
          }
        }
      }
    });
  }

  async recordPayment(id: string, paymentDto: PaymentDto) {
    const existingBilling = await this.findOne(id);
    const newPaidAmount = existingBilling.paidAmount + paymentDto.amount;
    const newBalanceAmount = existingBilling.totalAmount - newPaidAmount;

    return this.prisma.oPDBilling.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        balanceAmount: newBalanceAmount,
        paymentStatus: newPaidAmount >= existingBilling.totalAmount ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
        paymentMethod: paymentDto.paymentMethod,
        transactionId: paymentDto.transactionId,
        paymentDate: new Date(),
        notes: paymentDto.notes ? `${existingBilling.notes || ''}\n${paymentDto.notes}` : existingBilling.notes,
      },
      include: {
        opdVisit: {
          include: {
            patient: true,
            doctor: true,
          }
        }
      }
    });
  }

  async getPendingPayments(departmentId?: string, doctorId?: string) {
    const where: any = {
      paymentStatus: PaymentStatus.PENDING,
      balanceAmount: {
        gt: 0
      }
    };

    if (departmentId) {
      where.opdVisit = {
        ...where.opdVisit,
        departmentId: departmentId
      };
    }

    if (doctorId) {
      where.opdVisit = {
        ...where.opdVisit,
        doctorId: doctorId
      };
    }

    return this.prisma.oPDBilling.findMany({
      where,
      include: {
        opdVisit: {
          include: {
            patient: true,
            doctor: true,
            department: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getDailyCollections(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);

    const result = await this.prisma.oPDBilling.aggregate({
      where: {
        paymentDate: {
          gte: targetDate,
          lt: nextDay
        },
        paymentStatus: PaymentStatus.COMPLETED
      },
      _sum: {
        paidAmount: true,
        totalAmount: true
      },
      _count: {
        id: true
      }
    });

    return {
      date: targetDate.toISOString().split('T')[0],
      totalCollections: result._sum.paidAmount || 0,
      totalBillings: result._sum.totalAmount || 0,
      transactionCount: result._count.id || 0
    };
  }

  async getPaymentMethodSummary(fromDate?: string, toDate?: string) {
    const where: any = {
      paymentStatus: PaymentStatus.COMPLETED
    };

    if (fromDate && toDate) {
      where.paymentDate = {
        gte: new Date(fromDate),
        lte: new Date(toDate)
      };
    }

    return this.prisma.oPDBilling.groupBy({
      by: ['paymentMethod'],
      where,
      _sum: {
        paidAmount: true
      },
      _count: {
        id: true
      }
    });
  }

  async findAll(filters: {
    status?: string;
    departmentId?: string;
    doctorId?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    const where: any = {};

    if (filters.status && filters.status !== 'ALL') {
      where.paymentStatus = filters.status as PaymentStatus;
    }

    if (filters.departmentId) {
      where.opdVisit = {
        ...where.opdVisit,
        departmentId: filters.departmentId
      };
    }

    if (filters.doctorId) {
      where.opdVisit = {
        ...where.opdVisit,
        doctorId: filters.doctorId
      };
    }

    if (filters.fromDate && filters.toDate) {
      where.createdAt = {
        gte: new Date(filters.fromDate),
        lte: new Date(filters.toDate)
      };
    }

    return this.prisma.oPDBilling.findMany({
      where,
      include: {
        opdVisit: {
          include: {
            patient: true,
            doctor: true,
            department: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}
