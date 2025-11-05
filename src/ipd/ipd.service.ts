import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdmissionStatus } from '@prisma/client';

@Injectable()
export class IpdService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get current admissions
    const totalAdmissions = await this.prisma.admission.count({
      where: {
        status: { not: AdmissionStatus.DISCHARGED },
      },
    });

    // Today's admissions and discharges
    const todaysAdmissions = await this.prisma.admission.count({
      where: {
        admissionDate: { gte: startOfToday },
      },
    });

    const todaysDischarges = await this.prisma.discharge.count({
      where: {
        dischargeDate: { gte: startOfToday },
      },
    });

    // Ward occupancy
    const wards = await this.prisma.ward.findMany({
      select: {
        id: true,
        name: true,
        totalBeds: true,
        availableBeds: true,
      },
    });

    const totalBeds = wards.reduce((sum, ward) => sum + ward.totalBeds, 0);
    const availableBeds = wards.reduce((sum, ward) => sum + ward.availableBeds, 0);
    const occupiedBeds = totalBeds - availableBeds;

    // Critical patients
    const criticalPatients = await this.prisma.admission.count({
      where: {
        status: AdmissionStatus.CRITICAL,
      },
    });

    // Pending discharges
    const pendingDischarges = await this.prisma.admission.count({
      where: {
        status: { not: AdmissionStatus.DISCHARGED },
        expectedDischargeDate: { lte: new Date() },
      },
    });

    // Recent activities
    const recentAdmissions = await this.prisma.admission.findMany({
      where: {
        createdAt: { gte: startOfToday },
      },
      include: {
        patient: true,
        bed: { include: { ward: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentDischarges = await this.prisma.discharge.findMany({
      where: {
        dischargeDate: { gte: startOfToday },
      },
      include: {
        admission: {
          include: {
            patient: true,
          },
        },
      },
      orderBy: { dischargeDate: 'desc' },
      take: 5,
    });

    return {
      summary: {
        totalAdmissions,
        todaysAdmissions,
        todaysDischarges,
        criticalPatients,
        pendingDischarges,
        occupancyRate: totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : 0,
      },
      beds: {
        totalBeds,
        occupiedBeds,
        availableBeds,
      },
      wards: wards.map(ward => ({
        ...ward,
        occupancyRate: ward.totalBeds > 0 
          ? (((ward.totalBeds - ward.availableBeds) / ward.totalBeds) * 100).toFixed(1)
          : 0,
      })),
      recentActivities: {
        admissions: recentAdmissions,
        discharges: recentDischarges,
      },
    };
  }

  async getCurrentCensus(filters: {
    wardId?: string;
    departmentId?: string;
  }) {
    const where: any = {
      status: { not: AdmissionStatus.DISCHARGED },
    };

    if (filters.wardId) {
      where.bed = { wardId: filters.wardId };
    }

    if (filters.departmentId) {
      where.bed = {
        ...where.bed,
        ward: { departmentId: filters.departmentId },
      };
    }

    const currentPatients = await this.prisma.admission.findMany({
      where,
      include: {
        patient: true,
        doctor: true,
        bed: {
          include: {
            ward: {
              include: {
                department: true,
              },
            },
          },
        },
        vitals: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
        treatments: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: [
        { bed: { ward: { name: 'asc' } } },
        { bed: { bedNumber: 'asc' } },
      ],
    });

    // Group by ward
    const patientsByWard = currentPatients.reduce((acc, admission) => {
      const wardId = admission.bed.ward.id;
      if (!acc[wardId]) {
        acc[wardId] = {
          ward: {
            id: admission.bed.ward.id,
            name: admission.bed.ward.name,
            type: admission.bed.ward.type,
            department: admission.bed.ward.department,
          },
          patients: [],
        };
      }
      acc[wardId].patients.push({
        admission,
        lengthOfStay: Math.ceil(
          (new Date().getTime() - new Date(admission.admissionDate).getTime()) / (1000 * 3600 * 24)
        ),
      });
      return acc;
    }, {} as Record<string, any>);

    return {
      totalPatients: currentPatients.length,
      patientsByWard: Object.values(patientsByWard),
      allPatients: currentPatients.map(admission => ({
        admission,
        lengthOfStay: Math.ceil(
          (new Date().getTime() - new Date(admission.admissionDate).getTime()) / (1000 * 3600 * 24)
        ),
      })),
    };
  }

  async getIpdOverview() {
    const [
      dashboardStats,
      currentCensus,
      wardAvailability,
      recentTransfers,
      upcomingDischarges,
    ] = await Promise.all([
      this.getDashboardStats(),
      this.getCurrentCensus({}),
      this.getWardAvailabilityOverview(),
      this.getRecentTransfers(),
      this.getUpcomingDischarges(),
    ]);

    return {
      dashboard: dashboardStats,
      census: currentCensus,
      wardAvailability,
      recentTransfers,
      upcomingDischarges,
    };
  }

  async getStatistics(filters: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const period = filters.period || 'monthly';
    let startDate = filters.startDate ? new Date(filters.startDate) : null;
    let endDate = filters.endDate ? new Date(filters.endDate) : new Date();

    // Set default date range based on period
    if (!startDate) {
      const today = new Date();
      switch (period) {
        case 'daily':
          startDate = new Date(today.setDate(today.getDate() - 30));
          break;
        case 'weekly':
          startDate = new Date(today.setDate(today.getDate() - (7 * 12)));
          break;
        case 'monthly':
          startDate = new Date(today.setMonth(today.getMonth() - 12));
          break;
        case 'yearly':
          startDate = new Date(today.setFullYear(today.getFullYear() - 5));
          break;
        default:
          startDate = new Date(today.setMonth(today.getMonth() - 12));
      }
    }

    // Admission statistics
    const admissionStats = await this.prisma.admission.groupBy({
      by: ['status'],
      where: {
        admissionDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
    });

    // Average length of stay
    const discharges = await this.prisma.discharge.findMany({
      where: {
        dischargeDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        admission: true,
      },
    });

    const avgLengthOfStay = discharges.length > 0
      ? discharges.reduce((sum, discharge) => {
          const los = Math.ceil(
            (new Date(discharge.dischargeDate).getTime() - 
             new Date(discharge.admission.admissionDate).getTime()) / (1000 * 3600 * 24)
          );
          return sum + los;
        }, 0) / discharges.length
      : 0;

    // Ward utilization
    const wardUtilization = await this.prisma.ward.findMany({
      include: {
        beds: {
          include: {
            admissions: {
              where: {
                admissionDate: {
                  gte: startDate,
                  lte: endDate,
                },
              },
            },
          },
        },
      },
    });

    // Readmission rates
    const readmissions = await this.prisma.admission.findMany({
      where: {
        admissionDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        patient: {
          include: {
            admissions: {
              where: {
                admissionDate: {
                  lt: startDate,
                },
              },
            },
          },
        },
      },
    });

    const readmissionRate = readmissions.filter(
      admission => admission.patient.admissions.length > 0
    ).length / readmissions.length * 100;

    return {
      period: {
        type: period,
        startDate,
        endDate,
      },
      admissions: {
        total: admissionStats.reduce((sum, stat) => sum + stat._count.id, 0),
        byStatus: admissionStats,
      },
      discharges: {
        total: discharges.length,
        avgLengthOfStay: Math.round(avgLengthOfStay * 100) / 100,
      },
      readmissionRate: Math.round(readmissionRate * 100) / 100,
      wardUtilization: wardUtilization.map(ward => ({
        ward: {
          id: ward.id,
          name: ward.name,
          type: ward.type,
        },
        totalBeds: ward.totalBeds,
        admissionsInPeriod: ward.beds.reduce(
          (sum, bed) => sum + bed.admissions.length, 0
        ),
        utilizationRate: ward.totalBeds > 0 
          ? (ward.beds.reduce((sum, bed) => sum + bed.admissions.length, 0) / ward.totalBeds) * 100
          : 0,
      })),
    };
  }

  private async getWardAvailabilityOverview() {
    const wards = await this.prisma.ward.findMany({
      include: {
        department: true,
        beds: {
          where: { isActive: true },
        },
      },
      where: { isActive: true },
    });

    return wards.map(ward => {
      const occupiedBeds = ward.beds.filter(bed => bed.isOccupied).length;
      return {
        id: ward.id,
        name: ward.name,
        type: ward.type,
        department: ward.department.name,
        totalBeds: ward.totalBeds,
        occupiedBeds,
        availableBeds: ward.availableBeds,
        occupancyRate: ward.totalBeds > 0 
          ? ((occupiedBeds / ward.totalBeds) * 100).toFixed(1)
          : 0,
      };
    });
  }

  private async getRecentTransfers() {
    return this.prisma.bedTransfer.findMany({
      include: {
        admission: {
          include: {
            patient: true,
          },
        },
        fromBed: {
          include: {
            ward: true,
          },
        },
        toBed: {
          include: {
            ward: true,
          },
        },
      },
      orderBy: { transferDate: 'desc' },
      take: 10,
    });
  }

  private async getUpcomingDischarges() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.admission.findMany({
      where: {
        status: { not: AdmissionStatus.DISCHARGED },
        expectedDischargeDate: {
          lte: tomorrow,
        },
      },
      include: {
        patient: true,
        doctor: true,
        bed: {
          include: {
            ward: true,
          },
        },
      },
      orderBy: { expectedDischargeDate: 'asc' },
    });
  }
}
