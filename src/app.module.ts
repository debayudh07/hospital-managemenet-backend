import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { DoctorsModule } from './doctors/doctors.module';
import { StaffModule } from './staff/staff.module';
import { DepartmentsModule } from './departments/departments.module';
import { SchedulesModule } from './schedules/schedules.module';
import { OpdModule } from './opd/opd.module';
import { IpdModule } from './ipd/ipd.module';
import { WardsModule } from './wards/wards.module';
import { VitalsModule } from './vitals/vitals.module';
import { BillingModule } from './billing/billing.module';
import { ReportsModule } from './reports/reports.module';
import { FilesModule } from './files/files.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    CommonModule,
    PrismaModule,
    AuthModule,
    PatientsModule,
    DoctorsModule,
    StaffModule,
    AppointmentsModule,
    DepartmentsModule,
    SchedulesModule,
    OpdModule,
    IpdModule,
    WardsModule,
    VitalsModule,
    BillingModule,
    ReportsModule,
    FilesModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
