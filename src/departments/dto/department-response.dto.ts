export class DepartmentResponseDto {
  id: string;
  name: string;
  description?: string;
  location?: string;
  established?: string;
  headDoctorId?: string;
  headDoctor?: {
    id: string;
    firstName: string;
    lastName: string;
    specialization: string;
    email: string;
  };
  doctorCount?: number;
}