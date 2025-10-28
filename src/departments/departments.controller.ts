import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }

  @Patch(':id/head-doctor/:doctorId')
  @Roles(UserRole.ADMIN)
  assignHeadDoctor(@Param('id') id: string, @Param('doctorId') doctorId: string) {
    return this.departmentsService.assignHeadDoctor(id, doctorId);
  }

  @Delete(':id/head-doctor')
  @Roles(UserRole.ADMIN)
  removeHeadDoctor(@Param('id') id: string) {
    return this.departmentsService.removeHeadDoctor(id);
  }
}