import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';

export class DoctorResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  doctorId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  specialization: string;

  @ApiProperty()
  licenseNumber: string;

  @ApiProperty()
  experience: number;

  @ApiProperty()
  qualification: string;

  @ApiProperty()
  consultationFee: number;

  @ApiPropertyOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ enum: Gender })
  gender?: Gender;

  @ApiPropertyOptional()
  address?: string;

  @ApiProperty()
  isAvailable: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional()
  avatar?: string;

  @ApiProperty()
  workingHours: string;

  @ApiPropertyOptional()
  notes?: string;

    @ApiPropertyOptional()
    city?: string;

    @ApiPropertyOptional()
    state?: string;

    @ApiPropertyOptional()
    zipCode?: string;

    @ApiPropertyOptional()
    emergencyContactName?: string;

    @ApiPropertyOptional()
    emergencyContactPhone?: string;

    @ApiPropertyOptional()
    emergencyContactRelationship?: string;

    @ApiPropertyOptional()
    bloodGroup?: string;

    @ApiPropertyOptional()
    joiningDate?: Date;

    @ApiPropertyOptional()
    department?: string; // Department name for backward compatibility

    @ApiPropertyOptional()
    departmentId?: string;

    @ApiPropertyOptional()
    primaryDepartment?: {
      id: string;
      name: string;
      description?: string;
    };

  // Availability & Schedule fields
  @ApiPropertyOptional()
  workingDays?: string[];

  @ApiPropertyOptional()
  opdStartTime?: string;

  @ApiPropertyOptional()
  opdEndTime?: string;

  @ApiPropertyOptional()
  consultationType?: string;

  @ApiPropertyOptional()
  maxPatientsPerDay?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
