import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, IsDateString, IsEnum, Min, Max } from 'class-validator';

export enum ScheduleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TEMPORARY = 'TEMPORARY',
}

export class CreateScheduleDto {
  @ApiProperty({
    description: 'Doctor ID',
    example: 'cm2tq9xyz123456789',
  })
  @IsString()
  doctorId: string;

  @ApiProperty({
    description: 'Day of the week',
    example: 'monday',
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  })
  @IsString()
  dayOfWeek: string;

  @ApiProperty({
    description: 'Start time in HH:MM format',
    example: '09:00',
  })
  @IsString()
  startTime: string;

  @ApiProperty({
    description: 'End time in HH:MM format',
    example: '17:00',
  })
  @IsString()
  endTime: string;

  @ApiProperty({
    description: 'Maximum patients per day',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  maxPatients: number;

  @ApiProperty({
    description: 'Type of consultation',
    example: 'OPD',
    required: false,
  })
  @IsOptional()
  @IsString()
  consultationType?: string;

  @ApiProperty({
    description: 'Schedule status',
    enum: ScheduleStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;

  @ApiProperty({
    description: 'Valid from date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiProperty({
    description: 'Valid to date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  validTo?: string;

  @ApiProperty({
    description: 'Break start time in HH:MM format',
    example: '13:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  breakStartTime?: string;

  @ApiProperty({
    description: 'Break end time in HH:MM format',
    example: '14:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  breakEndTime?: string;

  @ApiProperty({
    description: 'Additional notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}