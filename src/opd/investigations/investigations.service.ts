import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InvestigationType, InvestigationUrgency, InvestigationStatus } from '@prisma/client';

export interface CreateOPDInvestigationDto {
  opdVisitId: string;
  testName: string;
  testType?: InvestigationType;
  urgency?: InvestigationUrgency;
  instructions?: string;
  orderedBy: string;
}

export interface UpdateOPDInvestigationDto {
  testName?: string;
  testType?: InvestigationType;
  urgency?: InvestigationUrgency;
  instructions?: string;
  status?: InvestigationStatus;
}

@Injectable()
export class InvestigationsService {
  constructor(private prisma: PrismaService) {}

  async create(createOPDInvestigationDto: CreateOPDInvestigationDto) {
    // Verify OPD visit exists
    const opdVisit = await this.prisma.oPDVisit.findUnique({
      where: { id: createOPDInvestigationDto.opdVisitId }
    });

    if (!opdVisit) {
      throw new NotFoundException('OPD visit not found');
    }

    return this.prisma.oPDInvestigation.create({
      data: {
        opdVisitId: createOPDInvestigationDto.opdVisitId,
        testName: createOPDInvestigationDto.testName,
        testType: createOPDInvestigationDto.testType || InvestigationType.LAB,
        urgency: createOPDInvestigationDto.urgency || InvestigationUrgency.ROUTINE,
        instructions: createOPDInvestigationDto.instructions,
        orderedBy: createOPDInvestigationDto.orderedBy,
        status: InvestigationStatus.ORDERED,
      },
      include: {
        opdVisit: {
          include: {
            patient: true,
          }
        },
      },
    });
  }

  async findAll() {
    return this.prisma.oPDInvestigation.findMany({
      include: {
        opdVisit: {
          include: {
            patient: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const investigation = await this.prisma.oPDInvestigation.findUnique({
      where: { id },
      include: {
        opdVisit: {
          include: {
            patient: true,
          }
        },
      },
    });

    if (!investigation) {
      throw new NotFoundException('Investigation not found');
    }

    return investigation;
  }

  async findByVisit(visitId: string) {
    return this.prisma.oPDInvestigation.findMany({
      where: { opdVisitId: visitId },
      include: {
        opdVisit: {
          include: {
            patient: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, updateOPDInvestigationDto: UpdateOPDInvestigationDto) {
    const investigation = await this.prisma.oPDInvestigation.findUnique({
      where: { id }
    });

    if (!investigation) {
      throw new NotFoundException('Investigation not found');
    }

    return this.prisma.oPDInvestigation.update({
      where: { id },
      data: updateOPDInvestigationDto,
      include: {
        opdVisit: {
          include: {
            patient: true,
          }
        },
      },
    });
  }

  async remove(id: string) {
    const investigation = await this.prisma.oPDInvestigation.findUnique({
      where: { id }
    });

    if (!investigation) {
      throw new NotFoundException('Investigation not found');
    }

    return this.prisma.oPDInvestigation.delete({
      where: { id },
    });
  }

  // Get investigations by status
  async findByStatus(status: InvestigationStatus) {
    return this.prisma.oPDInvestigation.findMany({
      where: { status },
      include: {
        opdVisit: {
          include: {
            patient: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get investigations by type
  async findByType(type: InvestigationType) {
    return this.prisma.oPDInvestigation.findMany({
      where: { testType: type },
      include: {
        opdVisit: {
          include: {
            patient: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Update investigation status
  async updateStatus(id: string, status: InvestigationStatus) {
    const investigation = await this.prisma.oPDInvestigation.findUnique({
      where: { id }
    });

    if (!investigation) {
      throw new NotFoundException('Investigation not found');
    }

    return this.prisma.oPDInvestigation.update({
      where: { id },
      data: { status },
      include: {
        opdVisit: {
          include: {
            patient: true,
          }
        },
      },
    });
  }
}