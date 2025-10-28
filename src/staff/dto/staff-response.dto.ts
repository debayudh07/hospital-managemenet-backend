import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, StaffRole } from '@prisma/client';

export class StaffResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  staffId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({ enum: StaffRole })
  role: StaffRole;

  @ApiPropertyOptional()
  department?: string;

  @ApiPropertyOptional()
  qualification?: string;

  @ApiPropertyOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ enum: Gender })
  gender?: Gender;

  @ApiPropertyOptional()
  address?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional()
  avatar?: string;

  @ApiProperty()
  joiningDate: Date;

  @ApiPropertyOptional()
  salary?: number;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
