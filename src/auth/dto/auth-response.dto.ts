import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'clxxxxx',
  })
  id: string;

  @ApiProperty({
    description: 'User email',
    example: 'doctor@hospital.com',
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.DOCTOR,
  })
  role: UserRole;

  @ApiProperty({
    description: 'User active status',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
    nullable: true,
  })
  avatar?: string | null;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
    required: false,
    nullable: true,
  })
  phone?: string | null;

  @ApiProperty({
    description: 'User address',
    example: '123 Main St, City, State',
    required: false,
    nullable: true,
  })
  address?: string | null;

  @ApiProperty({
    description: 'User date of birth',
    example: '1990-01-01T00:00:00.000Z',
    required: false,
    nullable: true,
  })
  dateOfBirth?: Date | null;

  @ApiProperty({
    description: 'Account creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Account last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User information',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600,
  })
  expiresIn: number;
}
