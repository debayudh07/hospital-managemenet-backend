import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { DoctorsModule } from './doctors/doctors.module';
import { StaffModule } from './staff/staff.module';
import { DepartmentsModule } from './departments/departments.module';
import { SchedulesModule } from './schedules/schedules.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PatientsModule,
    DoctorsModule,
    StaffModule,
    AppointmentsModule,
    DepartmentsModule,
    SchedulesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
