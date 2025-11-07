import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWardDto, UpdateWardDto, CreateBedDto, UpdateBedDto } from './dto';

@Injectable()
export class WardsService {
  constructor(private prisma: PrismaService) {}

  // Ward Management
  async createWard(createWardDto: CreateWardDto) {
    // Check if ward number already exists
    const existingWard = await this.prisma.ward.findUnique({
      where: { wardNumber: createWardDto.wardNumber },
    });

    if (existingWard) {
      throw new ConflictException('Ward number already exists');
    }

    // Verify department exists
    const department = await this.prisma.department.findUnique({
      where: { id: createWardDto.departmentId },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // Create ward and beds in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create the ward first
      const ward = await tx.ward.create({
        data: {
          wardNumber: createWardDto.wardNumber,
          name: createWardDto.name,
          type: createWardDto.type,
          departmentId: createWardDto.departmentId,
          totalBeds: createWardDto.totalBeds,
          availableBeds: createWardDto.totalBeds, // Initially all beds are available
          floor: createWardDto.floor,
          description: createWardDto.description,
          isActive: true,
        },
      });

      // Create individual bed records
      for (let i = 1; i <= createWardDto.totalBeds; i++) {
        const bedNumber = `${createWardDto.wardNumber}-B${String(i).padStart(3, '0')}`;
        
        // Check if bed number already exists
        const existingBed = await tx.bed.findUnique({
          where: { bedNumber },
        });

        if (!existingBed) {
          await tx.bed.create({
            data: {
              bedNumber,
              wardId: ward.id,
              isOccupied: false,
              bedType: createWardDto.type === 'ICU' ? 'ICU' : 'General',
              dailyRate: createWardDto.type === 'ICU' ? 5000 : 2000, // Default rates
              isActive: true,
            },
          });
        }
      }

      // Return ward with beds
      return await tx.ward.findUnique({
        where: { id: ward.id },
        include: {
          department: true,
          beds: true,
        },
      });
    });

    return result;
  }

  async findAllWards(filters: {
    departmentId?: string;
    type?: string;
    isActive?: boolean;
    hasAvailableBeds?: boolean;
  }) {
    const where: any = {};

    if (filters.departmentId) {
      where.departmentId = filters.departmentId;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.hasAvailableBeds) {
      where.availableBeds = { gt: 0 };
    }

    console.log('Ward query where clause:', where);
    
    const wards = await this.prisma.ward.findMany({
      where,
      include: {
        department: true,
        beds: {
          select: {
            id: true,
            bedNumber: true,
            wardId: true,
            isOccupied: true,
            bedType: true,
            dailyRate: true,
            isActive: true,
          },
        },
      },
      orderBy: { wardNumber: 'asc' },
    });

    console.log('Found wards:', wards.length, wards);
    return wards;
  }

  async findOneWard(id: string) {
    const ward = await this.prisma.ward.findUnique({
      where: { id },
      include: {
        department: true,
        beds: {
          include: {
            admissions: {
              where: {
                status: { not: 'DISCHARGED' },
              },
              include: {
                patient: true,
              },
            },
          },
        },
      },
    });

    if (!ward) {
      throw new NotFoundException('Ward not found');
    }

    return ward;
  }

  async updateWard(id: string, updateWardDto: UpdateWardDto) {
    const existingWard = await this.prisma.ward.findUnique({
      where: { id },
      include: { beds: true },
    });

    if (!existingWard) {
      throw new NotFoundException('Ward not found');
    }

    // Check if ward number is being changed and already exists
    if (updateWardDto.wardNumber && updateWardDto.wardNumber !== existingWard.wardNumber) {
      const wardWithSameNumber = await this.prisma.ward.findUnique({
        where: { wardNumber: updateWardDto.wardNumber },
      });

      if (wardWithSameNumber) {
        throw new ConflictException('Ward number already exists');
      }
    }

    // Verify department if being changed
    if (updateWardDto.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: updateWardDto.departmentId },
      });

      if (!department) {
        throw new NotFoundException('Department not found');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // Update the ward first
      const updatedWard = await tx.ward.update({
        where: { id },
        data: updateWardDto,
      });

      // Handle bed count changes if totalBeds is being updated
      if (updateWardDto.totalBeds && updateWardDto.totalBeds !== existingWard.totalBeds) {
        const currentBedCount = existingWard.beds.length;
        
        if (updateWardDto.totalBeds > currentBedCount) {
          // Add new beds
          const bedsToAdd = updateWardDto.totalBeds - currentBedCount;
          const wardNumber = updateWardDto.wardNumber || existingWard.wardNumber;
          
          for (let i = currentBedCount + 1; i <= updateWardDto.totalBeds; i++) {
            const bedNumber = `${wardNumber}-B${String(i).padStart(3, '0')}`;
            
            // Check if bed number already exists
            const existingBed = await tx.bed.findUnique({
              where: { bedNumber },
            });

            if (!existingBed) {
              await tx.bed.create({
                data: {
                  bedNumber,
                  wardId: id,
                  isOccupied: false,
                  bedType: updatedWard.type === 'ICU' ? 'ICU' : 'General',
                  dailyRate: updatedWard.type === 'ICU' ? 5000 : 2000,
                  isActive: true,
                },
              });
            }
          }
          
          // Update available beds count
          await tx.ward.update({
            where: { id },
            data: { 
              availableBeds: existingWard.availableBeds + bedsToAdd 
            },
          });
        } else if (updateWardDto.totalBeds < currentBedCount) {
          // Remove excess beds (only if they're not occupied)
          const occupiedBeds = existingWard.beds.filter(bed => bed.isOccupied);
          
          if (occupiedBeds.length > updateWardDto.totalBeds) {
            throw new BadRequestException('Cannot reduce bed count below number of occupied beds');
          }
          
          // Remove unoccupied beds from the end
          const bedsToRemove = currentBedCount - updateWardDto.totalBeds;
          const unoccupiedBeds = existingWard.beds
            .filter(bed => !bed.isOccupied)
            .slice(-bedsToRemove);
          
          for (const bed of unoccupiedBeds) {
            await tx.bed.delete({
              where: { id: bed.id },
            });
          }
          
          // Update available beds count
          await tx.ward.update({
            where: { id },
            data: { 
              availableBeds: Math.max(0, existingWard.availableBeds - bedsToRemove)
            },
          });
        }
      }

      // Return updated ward with all relations
      return await tx.ward.findUnique({
        where: { id },
        include: {
          department: true,
          beds: true,
        },
      });
    });
  }

  async removeWard(id: string) {
    const ward = await this.prisma.ward.findUnique({
      where: { id },
      include: {
        beds: {
          where: { isOccupied: true },
        },
      },
    });

    if (!ward) {
      throw new NotFoundException('Ward not found');
    }

    if (ward.beds.length > 0) {
      throw new BadRequestException('Cannot delete ward with occupied beds');
    }

    await this.prisma.ward.delete({
      where: { id },
    });

    return { message: 'Ward deleted successfully' };
  }

  // Bed Management
  async createBed(wardId: string, createBedDto: CreateBedDto) {
    // Verify ward exists
    const ward = await this.prisma.ward.findUnique({
      where: { id: wardId },
      include: { beds: true },
    });

    if (!ward) {
      throw new NotFoundException('Ward not found');
    }

    // Check if bed number already exists in this ward
    const existingBed = await this.prisma.bed.findFirst({
      where: {
        wardId,
        bedNumber: createBedDto.bedNumber,
      },
    });

    if (existingBed) {
      throw new ConflictException('Bed number already exists in this ward');
    }

    // Check if adding this bed would exceed ward capacity
    if (ward.beds.length >= ward.totalBeds) {
      throw new BadRequestException('Ward is at maximum capacity');
    }

    return this.prisma.$transaction(async (prisma) => {
      // Create bed
      const bed = await prisma.bed.create({
        data: {
          bedNumber: createBedDto.bedNumber,
          wardId,
          bedType: createBedDto.bedType,
          dailyRate: createBedDto.dailyRate,
        },
        include: {
          ward: {
            include: {
              department: true,
            },
          },
        },
      });

      // Update ward available beds count
      await prisma.ward.update({
        where: { id: wardId },
        data: { availableBeds: { increment: 1 } },
      });

      return bed;
    });
  }

  async findBedsByWard(wardId: string, filters: {
    isOccupied?: boolean;
    bedType?: string;
  }) {
    const ward = await this.prisma.ward.findUnique({
      where: { id: wardId },
    });

    if (!ward) {
      throw new NotFoundException('Ward not found');
    }

    const where: any = { wardId };

    if (filters.isOccupied !== undefined) {
      where.isOccupied = filters.isOccupied;
    }

    if (filters.bedType) {
      where.bedType = filters.bedType;
    }

    const beds = await this.prisma.bed.findMany({
      where,
      include: {
        ward: {
          include: {
            department: true,
          },
        },
        admissions: {
          where: {
            status: { not: 'DISCHARGED' },
          },
          include: {
            patient: true,
          },
        },
      },
      orderBy: { bedNumber: 'asc' },
    });

    return beds;
  }

  async findOneBed(id: string) {
    const bed = await this.prisma.bed.findUnique({
      where: { id },
      include: {
        ward: {
          include: {
            department: true,
          },
        },
        admissions: {
          where: {
            status: { not: 'DISCHARGED' },
          },
          include: {
            patient: true,
            doctor: true,
          },
        },
      },
    });

    if (!bed) {
      throw new NotFoundException('Bed not found');
    }

    return bed;
  }

  async updateBed(id: string, updateBedDto: UpdateBedDto) {
    const existingBed = await this.prisma.bed.findUnique({
      where: { id },
    });

    if (!existingBed) {
      throw new NotFoundException('Bed not found');
    }

    // Check if bed number is being changed and already exists in ward
    if (updateBedDto.bedNumber && updateBedDto.bedNumber !== existingBed.bedNumber) {
      const bedWithSameNumber = await this.prisma.bed.findFirst({
        where: {
          wardId: existingBed.wardId,
          bedNumber: updateBedDto.bedNumber,
        },
      });

      if (bedWithSameNumber) {
        throw new ConflictException('Bed number already exists in this ward');
      }
    }

    const updatedBed = await this.prisma.bed.update({
      where: { id },
      data: updateBedDto,
      include: {
        ward: {
          include: {
            department: true,
          },
        },
      },
    });

    return updatedBed;
  }

  async removeBed(id: string) {
    const bed = await this.prisma.bed.findUnique({
      where: { id },
    });

    if (!bed) {
      throw new NotFoundException('Bed not found');
    }

    if (bed.isOccupied) {
      throw new BadRequestException('Cannot delete occupied bed');
    }

    return this.prisma.$transaction(async (prisma) => {
      // Delete bed
      await prisma.bed.delete({
        where: { id },
      });

      // Update ward available beds count
      await prisma.ward.update({
        where: { id: bed.wardId },
        data: { availableBeds: { decrement: 1 } },
      });

      return { message: 'Bed deleted successfully' };
    });
  }

  // Availability and Statistics
  async getWardAvailability(wardId: string) {
    const ward = await this.prisma.ward.findUnique({
      where: { id: wardId },
      include: {
        department: true,
        beds: {
          include: {
            admissions: {
              where: {
                status: { not: 'DISCHARGED' },
              },
              include: {
                patient: true,
              },
            },
          },
        },
      },
    });

    if (!ward) {
      throw new NotFoundException('Ward not found');
    }

    const occupiedBeds = ward.beds.filter(bed => bed.isOccupied).length;
    const availableBeds = ward.beds.filter(bed => !bed.isOccupied).length;
    
    const bedsByType = ward.beds.reduce((acc, bed) => {
      const type = bed.bedType || 'General';
      if (!acc[type]) {
        acc[type] = { total: 0, occupied: 0, available: 0 };
      }
      acc[type].total++;
      if (bed.isOccupied) {
        acc[type].occupied++;
      } else {
        acc[type].available++;
      }
      return acc;
    }, {} as Record<string, { total: number; occupied: number; available: number }>);

    return {
      ward: {
        id: ward.id,
        name: ward.name,
        wardNumber: ward.wardNumber,
        type: ward.type,
        department: ward.department,
      },
      summary: {
        totalBeds: ward.totalBeds,
        occupiedBeds,
        availableBeds,
        occupancyRate: ward.totalBeds > 0 ? (occupiedBeds / ward.totalBeds) * 100 : 0,
      },
      bedsByType,
      currentPatients: ward.beds
        .filter(bed => bed.admissions.length > 0)
        .map(bed => ({
          bedNumber: bed.bedNumber,
          bedType: bed.bedType,
          patient: bed.admissions[0].patient,
          admissionDate: bed.admissions[0].admissionDate,
        })),
    };
  }

  async getDepartmentAvailability(departmentId: string) {
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        wards: {
          include: {
            beds: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const wardSummaries = department.wards.map(ward => {
      const occupiedBeds = ward.beds.filter(bed => bed.isOccupied).length;
      const availableBeds = ward.beds.filter(bed => !bed.isOccupied).length;

      return {
        wardId: ward.id,
        wardName: ward.name,
        wardNumber: ward.wardNumber,
        wardType: ward.type,
        totalBeds: ward.totalBeds,
        occupiedBeds,
        availableBeds,
        occupancyRate: ward.totalBeds > 0 ? (occupiedBeds / ward.totalBeds) * 100 : 0,
      };
    });

    const totalBeds = department.wards.reduce((sum, ward) => sum + ward.totalBeds, 0);
    const totalOccupied = department.wards.reduce((sum, ward) => 
      sum + ward.beds.filter(bed => bed.isOccupied).length, 0);
    const totalAvailable = totalBeds - totalOccupied;

    return {
      department: {
        id: department.id,
        name: department.name,
      },
      summary: {
        totalBeds,
        occupiedBeds: totalOccupied,
        availableBeds: totalAvailable,
        occupancyRate: totalBeds > 0 ? (totalOccupied / totalBeds) * 100 : 0,
        totalWards: department.wards.length,
      },
      wards: wardSummaries,
    };
  }

  async getAllAvailableBeds(filters: {
    wardType?: string;
    bedType?: string;
  }) {
    const where: any = {
      isOccupied: false,
      isActive: true,
    };

    if (filters.bedType) {
      where.bedType = filters.bedType;
    }

    const wardWhere: any = {
      isActive: true,
    };

    if (filters.wardType) {
      wardWhere.type = filters.wardType;
    }

    const availableBeds = await this.prisma.bed.findMany({
      where: {
        ...where,
        ward: wardWhere,
      },
      include: {
        ward: {
          include: {
            department: true,
          },
        },
      },
      orderBy: [
        { ward: { name: 'asc' } },
        { bedNumber: 'asc' },
      ],
    });

    // Group by ward for easier consumption
    const bedsByWard = availableBeds.reduce((acc, bed) => {
      const wardId = bed.ward.id;
      if (!acc[wardId]) {
        acc[wardId] = {
          ward: {
            id: bed.ward.id,
            name: bed.ward.name,
            wardNumber: bed.ward.wardNumber,
            type: bed.ward.type,
            department: bed.ward.department,
          },
          beds: [],
        };
      }
      acc[wardId].beds.push({
        id: bed.id,
        bedNumber: bed.bedNumber,
        bedType: bed.bedType,
        dailyRate: bed.dailyRate,
      });
      return acc;
    }, {} as Record<string, any>);

    return {
      totalAvailableBeds: availableBeds.length,
      bedsByWard: Object.values(bedsByWard),
      allBeds: availableBeds,
    };
  }
}
