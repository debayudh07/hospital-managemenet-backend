import { ApiProperty } from '@nestjs/swagger';

export class ScheduleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  doctorId: string;

  @ApiProperty()
  dayOfWeek: string;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty()
  maxPatients: number;

  @ApiProperty()
  consultationType: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  validFrom: Date;

  @ApiProperty({ required: false })
  validTo?: Date;

  @ApiProperty({ required: false })
  breakStartTime?: string;

  @ApiProperty({ required: false })
  breakEndTime?: string;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Doctor information
  @ApiProperty({ required: false })
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
    specialization: string;
    email: string;
    primaryDepartment?: {
      id: string;
      name: string;
    };
  };
}