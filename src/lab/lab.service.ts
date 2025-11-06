import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
import { LabOrderStatus, Priority } from '@prisma/client';

@Injectable()
export class LabService {
  constructor(private prisma: PrismaService) {}

  // Test Management Methods
  async findAllTests(filters?: {
    department?: string;
    category?: string;
    isActive?: boolean;
  }) {
    return this.prisma.labTest.findMany({
      where: {
        ...(filters?.department && { department: filters.department }),
        ...(filters?.category && { category: filters.category }),
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findTestById(id: string) {
    const test = await this.prisma.labTest.findUnique({
      where: { id },
      include: {
        results: {
          select: {
            id: true,
          },
          take: 1,
        },
      },
    });

    if (!test) {
      throw new NotFoundException('Lab test not found');
    }

    return test;
  }

  async createTest(dto: CreateLabTestDto) {
    // Check if code already exists
    const existingTest = await this.prisma.labTest.findUnique({
      where: { code: dto.code },
    });

    if (existingTest) {
      throw new BadRequestException('Test code already exists');
    }

    // Verify department exists
    await this.findDepartmentByCode(dto.department);

    return this.prisma.labTest.create({
      data: dto,
    });
  }

  async updateTest(id: string, dto: UpdateLabTestDto) {
    await this.findTestById(id); // Check if exists

    return this.prisma.labTest.update({
      where: { id },
      data: dto,
    });
  }

  async deleteTest(id: string) {
    await this.findTestById(id); // Check if exists

    return this.prisma.labTest.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Department Management
  async findAllDepartments() {
    return this.prisma.labDepartment.findMany({
      where: { isActive: true },
      include: {
        head: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            tests: true,
          },
        },
      },
    });
  }

  async findDepartmentByCode(code: string) {
    const department = await this.prisma.labDepartment.findUnique({
      where: { code },
    });

    if (!department) {
      throw new NotFoundException('Lab department not found');
    }

    return department;
  }

  async createDepartment(dto: CreateLabDepartmentDto) {
    // Check if code already exists
    const existingDept = await this.prisma.labDepartment.findUnique({
      where: { code: dto.code },
    });

    if (existingDept) {
      throw new BadRequestException('Department code already exists');
    }

    return this.prisma.labDepartment.create({
      data: dto,
    });
  }

  // Template Management
  async findAllTemplates() {
    return this.prisma.labTemplate.findMany({
      where: { isActive: true },
    });
  }

  async createTemplate(dto: CreateLabTemplateDto) {
    // Validate that all test IDs exist
    const tests = await this.prisma.labTest.findMany({
      where: {
        id: { in: dto.testIds },
        isActive: true,
      },
    });

    if (tests.length !== dto.testIds.length) {
      throw new BadRequestException('One or more test IDs are invalid');
    }

    return this.prisma.labTemplate.create({
      data: {
        ...dto,
        testIds: JSON.stringify(dto.testIds),
      },
    });
  }

  // Order Management Methods
  async findAllOrders(filters?: {
    patientId?: string;
    doctorId?: string;
    status?: LabOrderStatus;
    priority?: Priority;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }) {
    const { limit = 50, offset = 0, ...whereFilters } = filters || {};

    return this.prisma.labOrder.findMany({
      where: {
        ...(whereFilters.patientId && { patientId: whereFilters.patientId }),
        ...(whereFilters.doctorId && { doctorId: whereFilters.doctorId }),
        ...(whereFilters.status && { status: whereFilters.status }),
        ...(whereFilters.priority && { priority: whereFilters.priority }),
        ...(whereFilters.dateFrom && whereFilters.dateTo && {
          orderedAt: {
            gte: whereFilters.dateFrom,
            lte: whereFilters.dateTo,
          },
        }),
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            patientId: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        tests: {
          select: {
            id: true,
            name: true,
            code: true,
            price: true,
          },
        },
        results: {
          select: {
            id: true,
            status: true,
            flagged: true,
          },
        },
        _count: {
          select: {
            results: true,
          },
        },
      },
      orderBy: {
        orderedAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
  }

  async createOrder(dto: CreateLabOrderDto) {
    // Validate patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Validate doctor exists
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: dto.doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Validate all test IDs exist
    const tests = await this.prisma.labTest.findMany({
      where: {
        id: { in: dto.testIds },
        isActive: true,
      },
    });

    if (tests.length !== dto.testIds.length) {
      throw new BadRequestException('One or more test IDs are invalid');
    }

    // Calculate total cost
    const totalCost = tests.reduce((sum, test) => sum + test.price, 0);

    // Generate order ID
    const orderCount = await this.prisma.labOrder.count();
    const orderId = `LAB${(orderCount + 1).toString().padStart(6, '0')}`;

    return this.prisma.$transaction(async (prisma) => {
      // Create the order
      const order = await prisma.labOrder.create({
        data: {
          orderId,
          patientId: dto.patientId,
          doctorId: dto.doctorId,
          testIds: JSON.stringify(dto.testIds),
          priority: dto.priority,
          notes: dto.notes,
          clinicalNotes: dto.clinicalNotes,
          requestedBy: dto.requestedBy,
          totalCost,
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              patientId: true,
            },
          },
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              userId: true,
            },
          },
          tests: true,
        },
      });

      // Create workflow entry - use userId if available, otherwise skip workflow
      if (order.doctor?.userId) {
        await prisma.labWorkflow.create({
          data: {
            orderId: order.id,
            status: LabOrderStatus.PENDING.toString(),
            changedBy: order.doctor.userId,
            notes: 'Order created',
          },
        });
      }

      return order;
    });
  }

  async findOrderById(id: string) {
    const order = await this.prisma.labOrder.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            patientId: true,
            phone: true,
            gender: true,
            dateOfBirth: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        collector: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        processor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        tests: true,
        results: {
          include: {
            test: {
              select: {
                name: true,
                normalRange: true,
                unit: true,
              },
            },
            technicianUser: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            verifier: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        workflows: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            changedAt: 'asc',
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Lab order not found');
    }

    return order;
  }

  async updateOrderStatus(id: string, dto: UpdateLabOrderStatusDto, userId: string) {
    const order = await this.findOrderById(id);

    // Validate status transition
    this.validateStatusTransition(order.status, dto.status);

    return this.prisma.$transaction(async (prisma) => {
      // Update order
      const updatedOrder = await prisma.labOrder.update({
        where: { id },
        data: {
          status: dto.status,
          ...(dto.status === LabOrderStatus.IN_PROGRESS && {
            collectedAt: new Date(),
            collectedBy: userId,
            processingAt: new Date(),
            processedBy: userId,
          }),
          ...(dto.status === LabOrderStatus.COMPLETED && {
            completedAt: new Date(),
            reviewedBy: userId,
          }),
          ...(dto.sampleCondition && { sampleCondition: dto.sampleCondition }),
        },
        include: {
          patient: true,
          doctor: true,
          tests: true,
        },
      });

      // Create workflow entry
      await prisma.labWorkflow.create({
        data: {
          orderId: id,
          status: dto.status.toString(),
          changedBy: userId,
          notes: dto.notes,
        },
      });

      return updatedOrder;
    });
  }

  private validateStatusTransition(currentStatus: LabOrderStatus, newStatus: LabOrderStatus) {
    const validTransitions: Record<LabOrderStatus, LabOrderStatus[]> = {
      [LabOrderStatus.PENDING]: [LabOrderStatus.IN_PROGRESS, LabOrderStatus.CANCELLED],
      [LabOrderStatus.IN_PROGRESS]: [LabOrderStatus.COMPLETED, LabOrderStatus.CANCELLED],
      [LabOrderStatus.COMPLETED]: [], // Terminal state
      [LabOrderStatus.CANCELLED]: [], // Terminal state
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }

  async updateOrderReport(id: string, report: string) {
    const order = await this.findOrderById(id);

    if (!order) {
      throw new NotFoundException(`Lab order with ID ${id} not found`);
    }

    return this.prisma.labOrder.update({
      where: { id },
      data: { reportContent: report },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            patientId: true,
            phone: true,
            gender: true,
            dateOfBirth: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        tests: true,
        results: {
          include: {
            test: true,
            technicianUser: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            verifier: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  // Result Management Methods
  async addResult(orderId: string, dto: CreateLabResultDto) {
    // Validate order exists
    const order = await this.findOrderById(orderId);

    // Validate test belongs to this order
    const orderTestIds = JSON.parse(order.testIds);
    if (!orderTestIds.includes(dto.testId)) {
      throw new BadRequestException('Test does not belong to this order');
    }

    // Check if result already exists for this test
    const existingResult = await this.prisma.labResult.findFirst({
      where: {
        orderId,
        testId: dto.testId,
      },
    });

    if (existingResult) {
      throw new BadRequestException('Result already exists for this test');
    }

    // Validate technician exists
    const technician = await this.prisma.user.findUnique({
      where: { id: dto.technician },
    });

    if (!technician) {
      throw new NotFoundException('Technician not found');
    }

    return this.prisma.labResult.create({
      data: {
        ...dto,
        orderId,
      },
      include: {
        test: {
          select: {
            name: true,
            normalRange: true,
            unit: true,
          },
        },
        technicianUser: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async updateResult(id: string, dto: UpdateLabResultDto) {
    const result = await this.prisma.labResult.findUnique({
      where: { id },
    });

    if (!result) {
      throw new NotFoundException('Lab result not found');
    }

    // Don't allow updating verified results
    if (result.verifiedBy) {
      throw new BadRequestException('Cannot update verified result');
    }

    return this.prisma.labResult.update({
      where: { id },
      data: dto,
      include: {
        test: {
          select: {
            name: true,
            normalRange: true,
            unit: true,
          },
        },
        technicianUser: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async verifyResult(id: string, dto: VerifyLabResultDto) {
    const result = await this.prisma.labResult.findUnique({
      where: { id },
      include: {
        order: true,
      },
    });

    if (!result) {
      throw new NotFoundException('Lab result not found');
    }

    if (result.verifiedBy) {
      throw new BadRequestException('Result already verified');
    }

    // Validate verifier exists and is a doctor
    const verifier = await this.prisma.user.findUnique({
      where: { id: dto.verifiedBy },
    });

    if (!verifier || !['DOCTOR', 'ADMIN'].includes(verifier.role)) {
      throw new BadRequestException('Only doctors can verify results');
    }

    return this.prisma.labResult.update({
      where: { id },
      data: {
        verifiedBy: dto.verifiedBy,
        verifiedAt: new Date(),
        notes: dto.verificationNotes ? 
          `${result.notes || ''}\n[VERIFIED] ${dto.verificationNotes}` : 
          result.notes,
      },
      include: {
        test: {
          select: {
            name: true,
            normalRange: true,
            unit: true,
          },
        },
        technicianUser: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        verifier: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findResultsByOrder(orderId: string) {
    const order = await this.findOrderById(orderId);

    return this.prisma.labResult.findMany({
      where: { orderId },
      include: {
        test: {
          select: {
            name: true,
            normalRange: true,
            unit: true,
          },
        },
        technicianUser: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        verifier: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        testedAt: 'asc',
      },
    });
  }
}
