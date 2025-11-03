# OPD & IPD Implementation Guide

## 📋 Overview

This document provides a comprehensive guide for implementing **OPD (Outpatient Department)** and **IPD (Inpatient Department)** management in the Hospital Management System. The implementation will support automatic patient creation during OPD/IPD visits and maintain separate workflows for outpatient and inpatient care.

## 🏗️ Current System Architecture

### Existing Modules
```
src/
├── appointments/     ✅ Basic appointment management
├── auth/            ✅ Authentication & authorization
├── departments/     ✅ Department management  
├── doctors/         ✅ Doctor management
├── patients/        ✅ Patient management
├── schedules/       ✅ Doctor scheduling
├── staff/           ✅ Staff management
└── prisma/          ✅ Database service
```

### Current API Endpoints
- **Patients**: `/patients` (CRUD operations)
- **Doctors**: `/doctors` (CRUD operations)
- **Appointments**: `/appointments` (CRUD operations)
- **Departments**: `/departments` (CRUD operations)
- **Schedules**: `/schedules` (doctor scheduling)
- **Staff**: `/staff` (CRUD operations)

## 🎯 Implementation Plan

### Phase 1: Database Schema Updates

#### 1.1 OPD Models to Add
```prisma
// Add to schema.prisma

model OPDVisit {
  id                    String              @id @default(cuid())
  visitId               String              @unique
  patientId             String
  doctorId              String
  departmentId          String
  visitDate             DateTime
  visitType             VisitType           @default(OPD)
  appointmentMode       AppointmentMode     @default(WALK_IN)
  visitStatus           VisitStatus         @default(PENDING)
  visitPriority         VisitPriority       @default(NORMAL)
  tokenNumber           String?
  appointmentSlot       String?
  referralSource        ReferralSource?
  followUpSuggestedDays Int?
  
  // Clinical Data
  chiefComplaint        String
  durationOfSymptoms    String?
  historyOfPresentIllness String
  pastMedicalHistory    String?
  familyHistory         String?
  personalHistory       String?
  generalExamination    String?
  systemicExamination   String?
  allergiesDetailed     String?
  
  // Diagnosis
  provisionalDiagnosis  String?
  finalDiagnosis        String?
  icd10Codes           String?              // JSON array
  
  // Treatment Notes
  proceduresDone        String?             // JSON array
  treatmentNotes        String?
  
  // Investigations
  recommendedLabTests   String?             // JSON array
  radiologyTests        String?             // JSON array
  investigationUrgency  InvestigationUrgency?
  
  // Follow-up
  followUpDate          DateTime?
  followUpInstructions  String?
  referToIPD            Boolean             @default(false)
  referralNote          String?
  
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  
  // Relations
  patient       Patient           @relation(fields: [patientId], references: [id])
  doctor        Doctor            @relation(fields: [doctorId], references: [id])
  department    Department        @relation(fields: [departmentId], references: [id])
  vitals        OPDVitals[]
  prescriptions OPDPrescription[]
  billing       OPDBilling?

  @@map("opd_visits")
}

model OPDVitals {
  id              String   @id @default(cuid())
  opdVisitId      String
  heightCm        Float?
  weightKg        Float?
  bmi             Float?
  temperature     Float
  bloodPressure   String   // "120/80"
  pulseRate       Int
  respiratoryRate Int?
  spo2            Int
  weightNote      String?
  recordedAt      DateTime @default(now())
  recordedBy      String
  
  opdVisit OPDVisit @relation(fields: [opdVisitId], references: [id])

  @@map("opd_vitals")
}

model OPDPrescription {
  id           String            @id @default(cuid())
  opdVisitId   String
  drugName     String
  strength     String
  route        MedicineRoute
  frequency    String
  dose         String
  duration     String
  instructions String?
  notes        String?
  status       PrescriptionStatus @default(PENDING)
  createdAt    DateTime          @default(now())
  
  opdVisit OPDVisit @relation(fields: [opdVisitId], references: [id])

  @@map("opd_prescriptions")
}

model OPDBilling {
  id                        String        @id @default(cuid())
  opdVisitId                String        @unique
  consultationFee           Float
  investigationEstimate     Float?
  procedureCharges          Float?
  discountAmount            Float         @default(0)
  totalPayable              Float
  paymentMode               PaymentMode?
  paymentStatus             PaymentStatus @default(PENDING)
  insuranceCompany          String?
  insurancePolicyNumber     String?
  insurancePreAuthRequired  Boolean?
  paidAt                    DateTime?
  createdAt                 DateTime      @default(now())
  
  opdVisit OPDVisit @relation(fields: [opdVisitId], references: [id])

  @@map("opd_billing")
}

// Add new enums
enum VisitType {
  OPD
  EMERGENCY
  REVIEW
}

enum AppointmentMode {
  WALK_IN
  ONLINE
  PHONE
}

enum ReferralSource {
  SELF
  INTERNAL_DOCTOR
  EXTERNAL_DOCTOR
  HOSPITAL
  ORGANIZATION
  OTHER
}

enum VisitPriority {
  NORMAL
  URGENT
  EMERGENCY
}

enum VisitStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum MedicineRoute {
  ORAL
  IV
  IM
  SUBCUTANEOUS
  TOPICAL
  INHALATION
  OTHER
}

enum InvestigationUrgency {
  ROUTINE
  URGENT
  STAT
}
```

#### 1.2 IPD Models to Add
```prisma
model Ward {
  id            String   @id @default(cuid())
  name          String
  type          WardType
  totalBeds     Int
  occupiedBeds  Int      @default(0)
  chargesPerDay Float
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  beds Bed[]

  @@map("wards")
}

model Bed {
  id            String   @id @default(cuid())
  wardId        String
  bedNumber     String
  type          WardType
  isOccupied    Boolean  @default(false)
  chargesPerDay Float
  amenities     String?  // JSON array
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  ward       Ward        @relation(fields: [wardId], references: [id])
  admissions Admission[]

  @@map("beds")
}

model Admission {
  id                    String          @id @default(cuid())
  admissionId           String          @unique
  patientId             String
  wardId                String
  bedId                 String
  consultingDoctorId    String
  departmentId          String
  admissionDate         DateTime
  admissionTime         String
  reasonForAdmission    String
  tentativeDiagnosis    String
  finalDiagnosis        String?
  status                AdmissionStatus @default(STABLE)
  initialDeposit        Float?
  attendantName         String?
  attendantRelation     String?
  attendantPhone        String?
  attendantAddress      String?
  paymentMode           PaymentMode?
  insuranceName         String?
  policyNumber          String?
  specialInstructions   String?
  admissionType         AdmissionType   @default(PLANNED)
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt
  
  patient       Patient        @relation(fields: [patientId], references: [id])
  ward          Ward           @relation(fields: [wardId], references: [id])
  bed           Bed            @relation(fields: [bedId], references: [id])
  doctor        Doctor         @relation(fields: [consultingDoctorId], references: [id])
  department    Department     @relation(fields: [departmentId], references: [id])
  vitals        IPDVitals[]
  treatments    Treatment[]
  transfers     BedTransfer[]
  discharge     Discharge?

  @@map("admissions")
}

model IPDVitals {
  id                String   @id @default(cuid())
  admissionId       String
  recordedAt        DateTime @default(now())
  temperature       Float
  systolicBP        Int
  diastolicBP       Int
  heartRate         Int
  respiratoryRate   Int
  oxygenSaturation  Int
  bloodSugar        Float?
  weight            Float?
  height            Float?
  nursingNotes      String?
  recordedBy        String
  createdAt         DateTime @default(now())
  
  admission Admission @relation(fields: [admissionId], references: [id])

  @@map("ipd_vitals")
}

model Treatment {
  id            String          @id @default(cuid())
  admissionId   String
  type          TreatmentType
  description   String
  prescribedBy  String
  prescribedAt  DateTime        @default(now())
  dosage        String?
  frequency     String?
  duration      String?
  instructions  String?
  status        TreatmentStatus @default(ACTIVE)
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  
  admission Admission @relation(fields: [admissionId], references: [id])

  @@map("treatments")
}

model BedTransfer {
  id            String   @id @default(cuid())
  admissionId   String
  fromWardId    String
  fromBedId     String
  toWardId      String
  toBedId       String
  transferDate  DateTime
  transferTime  String
  reason        String
  transferredBy String
  approvedBy    String?
  createdAt     DateTime @default(now())
  
  admission Admission @relation(fields: [admissionId], references: [id])

  @@map("bed_transfers")
}

model Discharge {
  id                     String             @id @default(cuid())
  admissionId            String             @unique
  dischargeDate          DateTime
  dischargeTime          String
  finalDiagnosis         String
  treatmentSummary       String
  followUpInstructions   String
  followUpDate           DateTime?
  billingAmount          Float?
  dischargedBy           String
  approvedBy             String?
  attachedDocuments      String?            // JSON array
  createdAt              DateTime           @default(now())
  
  admission         Admission            @relation(fields: [admissionId], references: [id])
  medications       DischargeMedication[]

  @@map("discharges")
}

model DischargeMedication {
  id           String    @id @default(cuid())
  dischargeId  String
  name         String
  dosage       String
  frequency    String
  duration     String
  instructions String?
  
  discharge Discharge @relation(fields: [dischargeId], references: [id])

  @@map("discharge_medications")
}

// Add new enums
enum WardType {
  GENERAL
  PRIVATE
  SEMI_PRIVATE
  ICU
  EMERGENCY
}

enum AdmissionStatus {
  STABLE
  CRITICAL
  OBSERVATION
  DISCHARGED
}

enum AdmissionType {
  EMERGENCY
  PLANNED
  REFERRAL
}

enum TreatmentType {
  MEDICATION
  PROCEDURE
  LAB_ORDER
  INVESTIGATION
}

enum TreatmentStatus {
  ACTIVE
  COMPLETED
  DISCONTINUED
}
```

#### 1.3 Update Existing Models
```prisma
// Update Patient model to include OPD/IPD relations
model Patient {
  // ... existing fields ...
  
  // Relations
  appointments   Appointment[]
  medicalRecords MedicalRecord[]
  prescriptions  Prescription[]
  labOrders      LabOrder[]
  invoices       Invoice[]
  vitalSigns     VitalSigns[]
  
  // OPD Relations
  opdVisits      OPDVisit[]
  
  // IPD Relations  
  admissions     Admission[]

  @@map("patients")
}

// Update Doctor model
model Doctor {
  // ... existing fields ...
  
  // Relations
  appointments      Appointment[]
  medicalRecords    MedicalRecord[]
  prescriptions     Prescription[]
  departments       DoctorDepartment[]
  schedules         Schedule[]
  primaryDepartment Department?
  headOfDepartments Department[]
  
  // OPD Relations
  opdVisits         OPDVisit[]
  
  // IPD Relations
  admissions        Admission[]

  @@map("doctors")
}

// Update Department model
model Department {
  // ... existing fields ...
  
  // Relations
  headDoctor     Doctor?
  doctors        DoctorDepartment[]
  primaryDoctors Doctor[]
  
  // OPD Relations
  opdVisits      OPDVisit[]
  
  // IPD Relations
  admissions     Admission[]

  @@map("departments")
}

// Enhanced PaymentMethod enum
enum PaymentMethod {
  CASH
  CARD
  BANK_TRANSFER
  INSURANCE
  ONLINE
  TPA  // Third Party Administrator
}
```

### Phase 2: Backend Module Implementation

#### 2.1 Create OPD Module
```bash
# Generate OPD module structure
nest generate module opd
nest generate service opd
nest generate controller opd

# Create sub-modules
nest generate module opd/visits
nest generate service opd/visits
nest generate controller opd/visits

nest generate module opd/vitals
nest generate service opd/vitals
nest generate controller opd/vitals

nest generate module opd/prescriptions
nest generate service opd/prescriptions
nest generate controller opd/prescriptions

nest generate module opd/billing
nest generate service opd/billing
nest generate controller opd/billing
```

#### 2.2 Create IPD Module
```bash
# Generate IPD module structure
nest generate module ipd
nest generate service ipd
nest generate controller ipd

# Create sub-modules
nest generate module ipd/admissions
nest generate service ipd/admissions
nest generate controller ipd/admissions

nest generate module ipd/wards
nest generate service ipd/wards
nest generate controller ipd/wards

nest generate module ipd/vitals
nest generate service ipd/vitals
nest generate controller ipd/vitals

nest generate module ipd/treatments
nest generate service ipd/treatments
nest generate controller ipd/treatments

nest generate module ipd/transfers
nest generate service ipd/transfers
nest generate controller ipd/transfers

nest generate module ipd/discharge
nest generate service ipd/discharge
nest generate controller ipd/discharge
```

### Phase 3: API Endpoints Implementation

#### 3.1 OPD API Endpoints

##### OPD Visits Management
```typescript
// POST /api/opd/visits - Create OPD visit (with auto patient creation)
// GET /api/opd/visits - Get all OPD visits (with filters)
// GET /api/opd/visits/:id - Get specific OPD visit
// PUT /api/opd/visits/:id - Update OPD visit
// DELETE /api/opd/visits/:id - Cancel OPD visit
// GET /api/opd/visits/patient/:patientId - Get patient's OPD history
// GET /api/opd/visits/doctor/:doctorId - Get doctor's OPD visits
// GET /api/opd/visits/today - Get today's OPD visits
// GET /api/opd/visits/department/:deptId - Get department's OPD visits
```

##### OPD Vitals Management
```typescript
// POST /api/opd/visits/:visitId/vitals - Record vitals for visit
// GET /api/opd/visits/:visitId/vitals - Get vitals for visit
// PUT /api/opd/vitals/:id - Update vitals record
// DELETE /api/opd/vitals/:id - Delete vitals record
```

##### OPD Prescriptions Management
```typescript
// POST /api/opd/visits/:visitId/prescriptions - Add prescription to visit
// GET /api/opd/visits/:visitId/prescriptions - Get visit prescriptions
// PUT /api/opd/prescriptions/:id - Update prescription
// DELETE /api/opd/prescriptions/:id - Remove prescription
// GET /api/opd/prescriptions/patient/:patientId - Get patient prescription history
```

##### OPD Billing Management
```typescript
// POST /api/opd/visits/:visitId/billing - Create billing for visit
// GET /api/opd/visits/:visitId/billing - Get visit billing details
// PUT /api/opd/billing/:id - Update billing
// POST /api/opd/billing/:id/payment - Record payment
// GET /api/opd/billing/pending - Get pending payments
```

#### 3.2 IPD API Endpoints

##### Ward & Bed Management
```typescript
// GET /api/ipd/wards - Get all wards
// POST /api/ipd/wards - Create new ward
// PUT /api/ipd/wards/:id - Update ward
// DELETE /api/ipd/wards/:id - Delete ward
// GET /api/ipd/wards/:id/beds - Get beds in ward
// GET /api/ipd/beds/available - Get available beds
// PUT /api/ipd/beds/:id/occupy - Mark bed as occupied
// PUT /api/ipd/beds/:id/release - Release bed
```

##### Admission Management
```typescript
// POST /api/ipd/admissions - Create admission (with auto patient creation)
// GET /api/ipd/admissions - Get all admissions
// GET /api/ipd/admissions/:id - Get admission details
// PUT /api/ipd/admissions/:id - Update admission
// GET /api/ipd/admissions/patient/:patientId - Get patient admissions
// GET /api/ipd/admissions/active - Get active admissions
// GET /api/ipd/admissions/ward/:wardId - Get ward admissions
```

##### IPD Vitals Management
```typescript
// POST /api/ipd/admissions/:admissionId/vitals - Record vitals
// GET /api/ipd/admissions/:admissionId/vitals - Get admission vitals
// PUT /api/ipd/vitals/:id - Update vitals
// GET /api/ipd/vitals/trends/:admissionId - Get vitals trends
```

##### Treatment Management
```typescript
// POST /api/ipd/admissions/:admissionId/treatments - Add treatment
// GET /api/ipd/admissions/:admissionId/treatments - Get admission treatments
// PUT /api/ipd/treatments/:id - Update treatment
// DELETE /api/ipd/treatments/:id - Remove treatment
// PUT /api/ipd/treatments/:id/status - Update treatment status
```

##### Transfer Management
```typescript
// POST /api/ipd/transfers - Create bed transfer
// GET /api/ipd/transfers/admission/:admissionId - Get transfer history
// GET /api/ipd/transfers/pending - Get pending transfers
// PUT /api/ipd/transfers/:id/approve - Approve transfer
```

##### Discharge Management
```typescript
// POST /api/ipd/discharge - Create discharge record
// GET /api/ipd/discharge/:admissionId - Get discharge details
// PUT /api/ipd/discharge/:id - Update discharge
// POST /api/ipd/discharge/:id/pdf - Generate discharge summary
// GET /api/ipd/discharge/pending - Get pending discharges
```

### Phase 4: Auto Patient Creation Logic

#### 4.1 OPD Patient Auto-Creation
```typescript
// In OPD Visit Service
async createOPDVisit(createOPDVisitDto: CreateOPDVisitDto) {
  // Check if patient exists
  let patient = await this.prisma.patient.findUnique({
    where: { patientId: createOPDVisitDto.patientId }
  });

  // If patient doesn't exist, create new patient
  if (!patient) {
    patient = await this.prisma.patient.create({
      data: {
        patientId: createOPDVisitDto.patientId || this.generatePatientId(),
        firstName: createOPDVisitDto.firstName,
        lastName: createOPDVisitDto.lastName,
        dateOfBirth: createOPDVisitDto.dateOfBirth,
        gender: createOPDVisitDto.gender,
        phone: createOPDVisitDto.phone,
        email: createOPDVisitDto.email,
        address: createOPDVisitDto.address,
        bloodGroup: createOPDVisitDto.bloodGroup,
        allergies: createOPDVisitDto.allergies,
        emergencyContactName: createOPDVisitDto.emergencyContactName,
        emergencyContactPhone: createOPDVisitDto.emergencyContactPhone,
        emergencyContactRelationship: createOPDVisitDto.emergencyContactRelationship,
      }
    });
  }

  // Create OPD Visit
  const opdVisit = await this.prisma.oPDVisit.create({
    data: {
      visitId: this.generateVisitId(),
      patientId: patient.id,
      doctorId: createOPDVisitDto.doctorId,
      departmentId: createOPDVisitDto.departmentId,
      // ... other visit data
    },
    include: {
      patient: true,
      doctor: true,
      department: true,
    }
  });

  return opdVisit;
}
```

#### 4.2 IPD Patient Auto-Creation
```typescript
// In IPD Admission Service
async createAdmission(createAdmissionDto: CreateAdmissionDto) {
  // Check if patient exists
  let patient = await this.prisma.patient.findUnique({
    where: { patientId: createAdmissionDto.patientId }
  });

  // If patient doesn't exist, create new patient
  if (!patient) {
    patient = await this.prisma.patient.create({
      data: {
        patientId: createAdmissionDto.patientId || this.generatePatientId(),
        firstName: createAdmissionDto.firstName,
        lastName: createAdmissionDto.lastName,
        dateOfBirth: createAdmissionDto.dateOfBirth,
        gender: createAdmissionDto.gender,
        phone: createAdmissionDto.phone,
        email: createAdmissionDto.email,
        address: createAdmissionDto.address,
        bloodGroup: createAdmissionDto.bloodGroup,
        allergies: createAdmissionDto.allergies,
        emergencyContactName: createAdmissionDto.attendantName,
        emergencyContactPhone: createAdmissionDto.attendantPhone,
        emergencyContactRelationship: createAdmissionDto.attendantRelation,
      }
    });
  }

  // Check bed availability
  const bed = await this.checkBedAvailability(createAdmissionDto.bedId);
  if (!bed || bed.isOccupied) {
    throw new BadRequestException('Bed is not available');
  }

  // Create Admission
  const admission = await this.prisma.admission.create({
    data: {
      admissionId: this.generateAdmissionId(),
      patientId: patient.id,
      wardId: createAdmissionDto.wardId,
      bedId: createAdmissionDto.bedId,
      consultingDoctorId: createAdmissionDto.consultingDoctorId,
      departmentId: createAdmissionDto.departmentId,
      // ... other admission data
    },
    include: {
      patient: true,
      doctor: true,
      department: true,
      ward: true,
      bed: true,
    }
  });

  // Mark bed as occupied
  await this.prisma.bed.update({
    where: { id: createAdmissionDto.bedId },
    data: { isOccupied: true }
  });

  return admission;
}
```

### Phase 5: DTO Definitions

#### 5.1 OPD DTOs
```typescript
// create-opd-visit.dto.ts
export class CreateOPDVisitDto {
  // Patient Info (for auto-creation if needed)
  patientId?: string;
  firstName: string;
  lastName?: string;
  dateOfBirth: string;
  age: number;
  gender: Gender;
  phone: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  allergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;

  // Visit Info
  doctorId: string;
  departmentId: string;
  visitType: VisitType;
  appointmentMode: AppointmentMode;
  visitPriority: VisitPriority;
  referralSource?: ReferralSource;
  
  // Clinical Info
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory?: string;
  
  // Vitals
  vitals: CreateOPDVitalsDto;
  
  // Prescriptions
  prescriptions: CreateOPDPrescriptionDto[];
  
  // Billing
  billing: CreateOPDBillingDto;
}
```

#### 5.2 IPD DTOs
```typescript
// create-admission.dto.ts
export class CreateAdmissionDto {
  // Patient Info (for auto-creation if needed)
  patientId?: string;
  firstName: string;
  lastName?: string;
  dateOfBirth: string;
  gender: Gender;
  phone: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  allergies?: string;

  // Admission Info
  wardId: string;
  bedId: string;
  consultingDoctorId: string;
  departmentId: string;
  admissionDate: string;
  admissionTime: string;
  reasonForAdmission: string;
  tentativeDiagnosis: string;
  admissionType: AdmissionType;
  
  // Attendant Info
  attendantName?: string;
  attendantRelation?: string;
  attendantPhone?: string;
  attendantAddress?: string;
  
  // Payment Info
  paymentMode?: PaymentMode;
  insuranceName?: string;
  policyNumber?: string;
  initialDeposit?: number;
}
```

### Phase 6: Database Migration Commands

```bash
# Generate and apply migrations
npx prisma migrate dev --name "add-opd-models"
npx prisma migrate dev --name "add-ipd-models"
npx prisma migrate dev --name "update-patient-relations"

# Generate Prisma client
npx prisma generate

# Seed database with initial data
npx prisma db seed
```

### Phase 7: Module Registration

#### Update app.module.ts
```typescript
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
    
    // Add new modules
    OPDModule,
    IPDModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### Phase 9: Frontend Integration Requirements

Based on the frontend component analysis, the following additional APIs are required:

#### 9.1 Ward & Bed Management APIs (New Controller Needed)
```typescript
// src/wards/wards.controller.ts
@Controller('wards')
export class WardsController {
  @Get()
  async getAllWards(): Promise<WardResponseDto[]> {
    // Get all wards with bed counts
  }

  @Get(':id/beds')
  async getWardBeds(@Param('id') wardId: string): Promise<BedResponseDto[]> {
    // Get all beds in a ward
  }

  @Get('available-beds')
  async getAvailableBeds(
    @Query('wardType') wardType?: string,
  ): Promise<BedResponseDto[]> {
    // Get available beds, optionally filtered by ward type
  }

  @Put('beds/:id/occupy')
  async occupyBed(
    @Param('id') bedId: string,
    @Body() occupyData: OccupyBedDto,
  ): Promise<{ success: boolean }> {
    // Mark bed as occupied
  }

  @Put('beds/:id/release')
  async releaseBed(@Param('id') bedId: string): Promise<{ success: boolean }> {
    // Release bed
  }
}
```

#### 9.2 Prescription Management APIs (New Controller Needed)
```typescript
// src/prescriptions/prescriptions.controller.ts
@Controller('prescriptions')
export class PrescriptionsController {
  @Get('patient/:patientId')
  async getPatientPrescriptions(@Param('patientId') patientId: string): Promise<any[]> {
    // Get all prescriptions for a patient (both OPD and IPD)
  }

  @Get('doctor/:doctorId')
  async getDoctorPrescriptions(@Param('doctorId') doctorId: string): Promise<any[]> {
    // Get prescriptions written by a doctor
  }

  @Get('medications/search')
  async searchMedications(@Query('query') query: string): Promise<any[]> {
    // Search medications for prescription builder
  }

  @Post('opd/:opdVisitId')
  async addOPDPrescription(
    @Param('opdVisitId') opdVisitId: string,
    @Body() prescriptionData: CreateOPDPrescriptionDto,
  ): Promise<any> {
    // Add prescription to OPD visit
  }
}
```

#### 9.3 Vitals Management APIs (New Controller Needed)
```typescript
// src/vitals/vitals.controller.ts
@Controller('vitals')
export class VitalsController {
  @Post('opd/:opdVisitId')
  async recordOPDVitals(
    @Param('opdVisitId') opdVisitId: string,
    @Body() vitalsData: CreateOPDVitalsDto,
  ): Promise<any> {
    // Record vitals for OPD visit
  }

  @Post('ipd/:admissionId')
  async recordIPDVitals(
    @Param('admissionId') admissionId: string,
    @Body() vitalsData: CreateIPDVitalsDto,
  ): Promise<any> {
    // Record vitals for IPD admission
  }

  @Get('ipd/:admissionId/trends')
  async getVitalsTrends(@Param('admissionId') admissionId: string): Promise<any> {
    // Get vitals trends for charts/graphs
  }

  @Get('patient/:patientId/latest')
  async getLatestVitals(@Param('patientId') patientId: string): Promise<any> {
    // Get patient's latest vitals (OPD or IPD)
  }
}
```

#### 9.4 Lab Integration APIs (Enhancement to existing)
```typescript
// ADDITIONAL ENDPOINTS IN src/lab/lab.controller.ts (if exists) or new controller

@Get('tests/search')
async searchLabTests(@Query('query') query: string): Promise<any[]> {
  // Search lab tests for OPD investigation recommendations
}

@Get('tests/categories')
async getLabTestCategories(): Promise<string[]> {
  // Get lab test categories for filtering
}

@Post('orders/opd')
async createOPDLabOrder(
  @Body() orderData: CreateOPDLabOrderDto,
): Promise<any> {
  // Create lab order from OPD visit
}

@Post('orders/ipd')
async createIPDLabOrder(
  @Body() orderData: CreateIPDLabOrderDto,
): Promise<any> {
  // Create lab order from IPD admission
}
```

#### 9.5 Billing Integration APIs (New Controller Needed)
```typescript
// src/billing/billing.controller.ts
@Controller('billing')
export class BillingController {
  @Get('opd/:opdVisitId')
  async getOPDBilling(@Param('opdVisitId') opdVisitId: string): Promise<any> {
    // Get OPD visit billing details
  }

  @Post('opd/:opdVisitId/payment')
  async recordOPDPayment(
    @Param('opdVisitId') opdVisitId: string,
    @Body() paymentData: RecordPaymentDto,
  ): Promise<any> {
    // Record payment for OPD visit
  }

  @Get('ipd/:admissionId/estimate')
  async getIPDBillingEstimate(@Param('admissionId') admissionId: string): Promise<any> {
    // Get estimated charges for IPD admission
  }

  @Get('ipd/:admissionId/final')
  async getFinalIPDBill(@Param('admissionId') admissionId: string): Promise<any> {
    // Get final bill for discharge
  }

  @Get('pending-payments')
  async getPendingPayments(
    @Query('type') type?: 'opd' | 'ipd',
  ): Promise<any[]> {
    // Get pending payments
  }
}
```

#### 9.6 Reports & Analytics APIs (New Controller Needed)
```typescript
// src/reports/reports.controller.ts
@Controller('reports')
export class ReportsController {
  @Get('opd/daily')
  async getDailyOPDReport(@Query('date') date: string): Promise<any> {
    // Daily OPD report
  }

  @Get('ipd/occupancy')
  async getIPDOccupancyReport(): Promise<any> {
    // Ward/bed occupancy report
  }

  @Get('doctor/:doctorId/performance')
  async getDoctorPerformance(@Param('doctorId') doctorId: string): Promise<any> {
    // Doctor performance metrics
  }

  @Get('department/:deptId/analytics')
  async getDepartmentAnalytics(@Param('deptId') deptId: string): Promise<any> {
    // Department analytics
  }
}
```

#### 9.7 File Management APIs (New Controller Needed)
```typescript
// src/files/files.controller.ts
@Controller('files')
export class FilesController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<any> {
    // Upload medical documents, reports, etc.
  }

  @Get('patient/:patientId/documents')
  async getPatientDocuments(@Param('patientId') patientId: string): Promise<any[]> {
    // Get patient's uploaded documents
  }

  @Post('discharge/:dischargeId/pdf')
  async generateDischargesPDF(@Param('dischargeId') dischargeId: string): Promise<any> {
    // Generate discharge summary PDF
  }

  @Get('download/:fileId')
  async downloadFile(@Param('fileId') fileId: string): Promise<StreamableFile> {
    // Download file
  }
}
```

### Phase 10: Enhanced Search & Filter APIs

#### 10.1 Universal Search API
```typescript
// src/search/search.controller.ts
@Controller('search')
export class SearchController {
  @Get('global')
  async globalSearch(
    @Query('query') query: string,
    @Query('type') type?: 'patient' | 'doctor' | 'appointment' | 'all',
  ): Promise<any> {
    // Global search across patients, doctors, appointments
  }

  @Get('patients/advanced')
  async advancedPatientSearch(
    @Query() filters: AdvancedPatientSearchDto,
  ): Promise<any[]> {
    // Advanced patient search with multiple filters
  }

  @Get('appointments/availability')
  async searchAvailableAppointments(
    @Query() criteria: AppointmentSearchDto,
  ): Promise<any[]> {
    // Search available appointment slots
  }
}
```

### Phase 8: Existing Controller Enhancements

Based on the frontend implementation analysis, the following existing controllers need enhancements:

#### 8.1 Patients Controller Enhancements
```typescript
// ADDITIONAL ENDPOINTS NEEDED IN src/patients/patients.controller.ts

@Get('search')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
@ApiOperation({ summary: 'Search patients by name, phone, email, or UHID' })
@ApiQuery({ name: 'query', description: 'Search query', required: true })
@ApiQuery({ name: 'limit', description: 'Number of results to return', required: false })
async searchPatients(
  @Query('query') query: string,
  @Query('limit') limit: number = 10,
): Promise<PatientResponseDto[]> {
  return this.patientsService.searchPatients(query, limit);
}

@Get(':id/opd-history')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
@ApiOperation({ summary: 'Get patient OPD visit history' })
async getOPDHistory(@Param('id') id: string): Promise<any[]> {
  return this.patientsService.getOPDHistory(id);
}

@Get(':id/ipd-history')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
@ApiOperation({ summary: 'Get patient IPD admission history' })
async getIPDHistory(@Param('id') id: string): Promise<any[]> {
  return this.patientsService.getIPDHistory(id);
}

@Get(':id/medical-summary')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
@ApiOperation({ summary: 'Get comprehensive patient medical summary' })
async getMedicalSummary(@Param('id') id: string): Promise<any> {
  return this.patientsService.getMedicalSummary(id);
}

@Post('find-or-create')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
@ApiOperation({ summary: 'Find existing patient or create new one for OPD/IPD' })
async findOrCreatePatient(
  @Body() patientData: FindOrCreatePatientDto,
): Promise<PatientResponseDto> {
  return this.patientsService.findOrCreatePatient(patientData);
}
```

#### 8.2 Patients Service Enhancements
```typescript
// ADDITIONAL METHODS NEEDED IN src/patients/patients.service.ts

async searchPatients(query: string, limit: number = 10): Promise<PatientResponseDto[]> {
  const patients = await this.prisma.patient.findMany({
    where: {
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { patientId: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
      isActive: true,
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
  return patients.map(patient => this.mapToResponseDto(patient));
}

async getOPDHistory(patientId: string): Promise<any[]> {
  const patient = await this.findPatientByIdOrPatientId(patientId);
  return this.prisma.oPDVisit.findMany({
    where: { patientId: patient.id },
    include: {
      doctor: { select: { firstName: true, lastName: true, specialization: true } },
      department: { select: { name: true } },
      vitals: true,
      prescriptions: true,
      billing: true,
    },
    orderBy: { visitDate: 'desc' },
  });
}

async getIPDHistory(patientId: string): Promise<any[]> {
  const patient = await this.findPatientByIdOrPatientId(patientId);
  return this.prisma.admission.findMany({
    where: { patientId: patient.id },
    include: {
      doctor: { select: { firstName: true, lastName: true, specialization: true } },
      department: { select: { name: true } },
      ward: { select: { name: true, type: true } },
      bed: { select: { bedNumber: true } },
      vitals: true,
      treatments: true,
      discharge: true,
    },
    orderBy: { admissionDate: 'desc' },
  });
}

async getMedicalSummary(patientId: string): Promise<any> {
  const patient = await this.findPatientByIdOrPatientId(patientId);
  const [opdHistory, ipdHistory, appointments, labOrders] = await Promise.all([
    this.getOPDHistory(patientId),
    this.getIPDHistory(patientId),
    this.prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: { doctor: true, },
      orderBy: { date: 'desc' },
      take: 10,
    }),
    this.prisma.labOrder.findMany({
      where: { patientId: patient.id },
      include: { results: true },
      orderBy: { orderedAt: 'desc' },
      take: 10,
    }),
  ]);

  return {
    patient: this.mapToResponseDto(patient),
    opdHistory,
    ipdHistory,
    recentAppointments: appointments,
    recentLabOrders: labOrders,
    summary: {
      totalOPDVisits: opdHistory.length,
      totalAdmissions: ipdHistory.length,
      lastVisit: opdHistory[0]?.visitDate || ipdHistory[0]?.admissionDate,
    },
  };
}

async findOrCreatePatient(patientData: FindOrCreatePatientDto): Promise<PatientResponseDto> {
  // First try to find existing patient
  let patient = null;
  
  if (patientData.patientId) {
    patient = await this.prisma.patient.findFirst({
      where: { patientId: patientData.patientId },
    });
  }
  
  if (!patient && patientData.phone) {
    patient = await this.prisma.patient.findFirst({
      where: { phone: patientData.phone },
    });
  }
  
  if (!patient && patientData.email) {
    patient = await this.prisma.patient.findFirst({
      where: { email: patientData.email },
    });
  }

  // If patient exists, return it
  if (patient) {
    return this.mapToResponseDto(patient);
  }

  // Create new patient
  return this.create({
    firstName: patientData.firstName,
    lastName: patientData.lastName || '',
    email: patientData.email,
    phone: patientData.phone,
    dateOfBirth: patientData.dateOfBirth,
    gender: patientData.gender,
    address: patientData.address || '',
    city: patientData.city || '',
    state: patientData.state || '',
    zipCode: patientData.zipCode || '',
    bloodGroup: patientData.bloodGroup,
    allergies: patientData.allergies,
    emergencyContactName: patientData.emergencyContactName || '',
    emergencyContactPhone: patientData.emergencyContactPhone || '',
    emergencyContactRelationship: patientData.emergencyContactRelationship || '',
  });
}

private async findPatientByIdOrPatientId(id: string) {
  const patient = await this.prisma.patient.findFirst({
    where: { OR: [{ id }, { patientId: id }] },
  });
  if (!patient) {
    throw new NotFoundException(`Patient with ID ${id} not found`);
  }
  return patient;
}
```

#### 8.3 Doctors Controller Enhancements
```typescript
// ADDITIONAL ENDPOINTS NEEDED IN src/doctors/doctors.controller.ts

@Get('by-department/:departmentId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
@ApiOperation({ summary: 'Get doctors by department' })
@ApiParam({ name: 'departmentId', description: 'Department ID' })
async getDoctorsByDepartment(
  @Param('departmentId') departmentId: string,
): Promise<DoctorResponseDto[]> {
  return this.doctorsService.getDoctorsByDepartment(departmentId);
}

@Get(':id/available-slots')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
@ApiOperation({ summary: 'Get doctor available time slots for a date' })
@ApiParam({ name: 'id', description: 'Doctor ID' })
@ApiQuery({ name: 'date', description: 'Date in YYYY-MM-DD format', required: true })
async getAvailableSlots(
  @Param('id') id: string,
  @Query('date') date: string,
): Promise<any[]> {
  return this.doctorsService.getAvailableSlots(id, date);
}

@Get(':id/opd-visits')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DOCTOR)
@ApiOperation({ summary: 'Get doctor OPD visits' })
@ApiQuery({ name: 'date', description: 'Date filter (optional)', required: false })
@ApiQuery({ name: 'status', description: 'Status filter (optional)', required: false })
async getDoctorOPDVisits(
  @Param('id') id: string,
  @Query('date') date?: string,
  @Query('status') status?: string,
): Promise<any[]> {
  return this.doctorsService.getOPDVisits(id, date, status);
}

@Get(':id/ipd-patients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DOCTOR)
@ApiOperation({ summary: 'Get doctor IPD patients' })
async getDoctorIPDPatients(@Param('id') id: string): Promise<any[]> {
  return this.doctorsService.getIPDPatients(id);
}

@Post(':id/book-slot')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST)
@ApiOperation({ summary: 'Book doctor time slot' })
async bookTimeSlot(
  @Param('id') id: string,
  @Body() bookingData: BookSlotDto,
): Promise<{ success: boolean; message: string }> {
  return this.doctorsService.bookTimeSlot(id, bookingData);
}
```

#### 8.4 Doctors Service Enhancements
```typescript
// ADDITIONAL METHODS NEEDED IN src/doctors/doctors.service.ts

async getDoctorsByDepartment(departmentId: string): Promise<DoctorResponseDto[]> {
  const doctors = await this.prisma.doctor.findMany({
    where: {
      OR: [
        { departmentId: departmentId },
        { departments: { some: { departmentId: departmentId } } },
      ],
      isActive: true,
      isAvailable: true,
    },
    include: {
      primaryDepartment: true,
      schedules: true,
    },
    orderBy: { firstName: 'asc' },
  });

  return doctors.map(doctor => this.mapToResponseDto(doctor));
}

async getAvailableSlots(doctorId: string, date: string): Promise<any[]> {
  const doctor = await this.findDoctorByIdOrDoctorId(doctorId);
  const targetDate = new Date(date);
  const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  // Get doctor's schedule for the day
  const schedule = await this.prisma.schedule.findUnique({
    where: {
      doctorId_dayOfWeek: {
        doctorId: doctor.id,
        dayOfWeek: dayOfWeek,
      },
    },
  });

  if (!schedule) {
    return [];
  }

  // Get existing appointments for the date
  const existingAppointments = await this.prisma.appointment.findMany({
    where: {
      doctorId: doctor.id,
      date: targetDate,
      status: { not: 'CANCELLED' },
    },
  });

  // Get OPD visits for the date
  const opdVisits = await this.prisma.oPDVisit.findMany({
    where: {
      doctorId: doctor.id,
      visitDate: targetDate,
      visitStatus: { not: 'CANCELLED' },
    },
  });

  // Generate available slots based on schedule
  const slots = this.generateTimeSlots(
    schedule.startTime,
    schedule.endTime,
    schedule.breakStartTime,
    schedule.breakEndTime,
    existingAppointments,
    opdVisits,
  );

  return slots;
}

async getOPDVisits(doctorId: string, date?: string, status?: string): Promise<any[]> {
  const doctor = await this.findDoctorByIdOrDoctorId(doctorId);
  const where: any = { doctorId: doctor.id };

  if (date) {
    where.visitDate = new Date(date);
  }

  if (status) {
    where.visitStatus = status;
  }

  return this.prisma.oPDVisit.findMany({
    where,
    include: {
      patient: { select: { firstName: true, lastName: true, patientId: true, phone: true } },
      department: { select: { name: true } },
      vitals: true,
      prescriptions: true,
    },
    orderBy: { visitDate: 'desc' },
  });
}

async getIPDPatients(doctorId: string): Promise<any[]> {
  const doctor = await this.findDoctorByIdOrDoctorId(doctorId);
  
  return this.prisma.admission.findMany({
    where: {
      consultingDoctorId: doctor.id,
      status: { not: 'DISCHARGED' },
    },
    include: {
      patient: { select: { firstName: true, lastName: true, patientId: true, phone: true } },
      ward: { select: { name: true, type: true } },
      bed: { select: { bedNumber: true } },
      department: { select: { name: true } },
    },
    orderBy: { admissionDate: 'desc' },
  });
}

async bookTimeSlot(doctorId: string, bookingData: BookSlotDto): Promise<{ success: boolean; message: string }> {
  const doctor = await this.findDoctorByIdOrDoctorId(doctorId);
  
  // Check if slot is available
  const existingBooking = await this.prisma.appointment.findFirst({
    where: {
      doctorId: doctor.id,
      date: new Date(bookingData.date),
      startTime: bookingData.timeSlot,
      status: { not: 'CANCELLED' },
    },
  });

  if (existingBooking) {
    return { success: false, message: 'Time slot is already booked' };
  }

  // Implementation would continue with actual booking logic
  return { success: true, message: 'Slot booked successfully' };
}

private generateTimeSlots(
  startTime: string,
  endTime: string,
  breakStart?: string,
  breakEnd?: string,
  appointments: any[] = [],
  opdVisits: any[] = [],
): any[] {
  // Implementation to generate time slots based on schedule and existing bookings
  const slots = [];
  // Complex slot generation logic would go here
  return slots;
}

private async findDoctorByIdOrDoctorId(id: string) {
  const doctor = await this.prisma.doctor.findFirst({
    where: { OR: [{ id }, { doctorId: id }] },
  });
  if (!doctor) {
    throw new NotFoundException(`Doctor with ID ${id} not found`);
  }
  return doctor;
}
```

#### 8.5 Appointments Controller Enhancements
```typescript
// ADDITIONAL ENDPOINTS NEEDED IN src/appointments/appointments.controller.ts

@Get('today')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
@ApiOperation({ summary: 'Get today\'s appointments' })
@ApiQuery({ name: 'doctorId', description: 'Filter by doctor ID', required: false })
@ApiQuery({ name: 'status', description: 'Filter by status', required: false })
async getTodaysAppointments(
  @Query('doctorId') doctorId?: string,
  @Query('status') status?: AppointmentStatus,
): Promise<AppointmentResponseDto[]> {
  return this.appointmentsService.getTodaysAppointments(doctorId, status);
}

@Get('slots/:doctorId/:date')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
@ApiOperation({ summary: 'Get available appointment slots for doctor on specific date' })
@ApiParam({ name: 'doctorId', description: 'Doctor ID' })
@ApiParam({ name: 'date', description: 'Date in YYYY-MM-DD format' })
async getAvailableSlots(
  @Param('doctorId') doctorId: string,
  @Param('date') date: string,
): Promise<any[]> {
  return this.appointmentsService.getAvailableSlots(doctorId, date);
}

@Post('quick-book')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
@ApiOperation({ summary: 'Quick book appointment for walk-in patients' })
async quickBookAppointment(
  @Body() quickBookDto: QuickBookAppointmentDto,
  @Request() req: any,
): Promise<AppointmentResponseDto> {
  return this.appointmentsService.quickBookAppointment(quickBookDto, req.user.id);
}
```

#### 8.6 Schedules Controller Enhancements
```typescript
// ADDITIONAL ENDPOINTS NEEDED IN src/schedules/schedules.controller.ts

@Get('doctor/:doctorId/available-slots')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
@ApiOperation({ summary: 'Get available time slots for doctor on specific date' })
@ApiParam({ name: 'doctorId', description: 'Doctor ID' })
@ApiQuery({ name: 'date', description: 'Date in YYYY-MM-DD format', required: true })
@ApiQuery({ name: 'consultationType', description: 'OPD, IPD, EMERGENCY', required: false })
async getDoctorAvailableSlots(
  @Param('doctorId') doctorId: string,
  @Query('date') date: string,
  @Query('consultationType') consultationType?: string,
): Promise<any[]> {
  return this.schedulesService.getDoctorAvailableSlots(doctorId, date, consultationType);
}

@Get('doctor/:doctorId/weekly')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
@ApiOperation({ summary: 'Get doctor weekly schedule' })
@ApiParam({ name: 'doctorId', description: 'Doctor ID' })
async getDoctorWeeklySchedule(@Param('doctorId') doctorId: string): Promise<any[]> {
  return this.schedulesService.getDoctorWeeklySchedule(doctorId);
}

@Post('doctor/:doctorId/block-slot')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DOCTOR)
@ApiOperation({ summary: 'Block specific time slot for doctor' })
@ApiParam({ name: 'doctorId', description: 'Doctor ID' })
async blockTimeSlot(
  @Param('doctorId') doctorId: string,
  @Body() blockSlotData: BlockSlotDto,
): Promise<{ success: boolean; message: string }> {
  return this.schedulesService.blockTimeSlot(doctorId, blockSlotData);
}

@Delete('doctor/:doctorId/unblock-slot')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DOCTOR)
@ApiOperation({ summary: 'Unblock specific time slot for doctor' })
@ApiParam({ name: 'doctorId', description: 'Doctor ID' })
async unblockTimeSlot(
  @Param('doctorId') doctorId: string,
  @Body() unblockSlotData: UnblockSlotDto,
): Promise<{ success: boolean; message: string }> {
  return this.schedulesService.unblockTimeSlot(doctorId, unblockSlotData);
}

@Get('department/:departmentId/availability')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
@ApiOperation({ summary: 'Get department doctor availability for date' })
@ApiParam({ name: 'departmentId', description: 'Department ID' })
@ApiQuery({ name: 'date', description: 'Date in YYYY-MM-DD format', required: true })
async getDepartmentAvailability(
  @Param('departmentId') departmentId: string,
  @Query('date') date: string,
): Promise<any[]> {
  return this.schedulesService.getDepartmentAvailability(departmentId, date);
}

@Get('slots/bulk-availability')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
@ApiOperation({ summary: 'Get bulk slot availability for multiple doctors and dates' })
@ApiQuery({ name: 'doctorIds', description: 'Comma-separated doctor IDs', required: true })
@ApiQuery({ name: 'startDate', description: 'Start date', required: true })
@ApiQuery({ name: 'endDate', description: 'End date', required: true })
async getBulkSlotAvailability(
  @Query('doctorIds') doctorIds: string,
  @Query('startDate') startDate: string,
  @Query('endDate') endDate: string,
): Promise<any> {
  const doctorIdArray = doctorIds.split(',');
  return this.schedulesService.getBulkSlotAvailability(doctorIdArray, startDate, endDate);
}

@Put(':id/consultation-type')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DOCTOR)
@ApiOperation({ summary: 'Update schedule consultation type' })
@ApiParam({ name: 'id', description: 'Schedule ID' })
async updateConsultationType(
  @Param('id') id: string,
  @Body() updateData: UpdateConsultationTypeDto,
): Promise<ScheduleResponseDto> {
  return this.schedulesService.updateConsultationType(id, updateData);
}

@Get('doctor/:doctorId/conflicts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DOCTOR)
@ApiOperation({ summary: 'Get schedule conflicts for doctor' })
@ApiParam({ name: 'doctorId', description: 'Doctor ID' })
@ApiQuery({ name: 'date', description: 'Specific date to check', required: false })
async getScheduleConflicts(
  @Param('doctorId') doctorId: string,
  @Query('date') date?: string,
): Promise<any[]> {
  return this.schedulesService.getScheduleConflicts(doctorId, date);
}
```

#### 8.7 Schedules Service Enhancements
```typescript
// ADDITIONAL METHODS NEEDED IN src/schedules/schedules.service.ts

async getDoctorAvailableSlots(
  doctorId: string, 
  date: string, 
  consultationType?: string
): Promise<any[]> {
  const doctor = await this.findDoctorById(doctorId);
  const targetDate = new Date(date);
  const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  // Get doctor's schedule for the day
  const schedules = await this.prisma.schedule.findMany({
    where: {
      doctorId: doctor.id,
      dayOfWeek: dayOfWeek,
      status: 'ACTIVE',
      consultationType: consultationType || undefined,
    },
  });

  if (schedules.length === 0) {
    return [];
  }

  // Get existing appointments and OPD visits for the date
  const [appointments, opdVisits] = await Promise.all([
    this.prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        date: targetDate,
        status: { not: 'CANCELLED' },
      },
    }),
    // This would need OPD model to exist
    // this.prisma.oPDVisit.findMany({
    //   where: {
    //     doctorId: doctor.id,
    //     visitDate: targetDate,
    //     visitStatus: { not: 'CANCELLED' },
    //   },
    // }),
  ]);

  // Generate available slots for each schedule
  const allSlots = [];
  for (const schedule of schedules) {
    const slots = this.generateTimeSlots(
      schedule.startTime,
      schedule.endTime,
      schedule.breakStartTime,
      schedule.breakEndTime,
      schedule.maxPatients,
      appointments,
      [], // opdVisits when available
    );
    allSlots.push(...slots.map(slot => ({
      ...slot,
      scheduleId: schedule.id,
      consultationType: schedule.consultationType,
    })));
  }

  return allSlots;
}

async getDoctorWeeklySchedule(doctorId: string): Promise<any[]> {
  const doctor = await this.findDoctorById(doctorId);
  
  return this.prisma.schedule.findMany({
    where: {
      doctorId: doctor.id,
      status: 'ACTIVE',
    },
    orderBy: [
      { dayOfWeek: 'asc' },
      { startTime: 'asc' },
    ],
  });
}

async blockTimeSlot(doctorId: string, blockSlotData: BlockSlotDto): Promise<{ success: boolean; message: string }> {
  const doctor = await this.findDoctorById(doctorId);
  
  // Check if there are existing appointments in this slot
  const existingAppointment = await this.prisma.appointment.findFirst({
    where: {
      doctorId: doctor.id,
      date: new Date(blockSlotData.date),
      startTime: blockSlotData.timeSlot,
      status: { not: 'CANCELLED' },
    },
  });

  if (existingAppointment) {
    return { 
      success: false, 
      message: 'Cannot block slot - existing appointment found' 
    };
  }

  // Create a blocked appointment entry or use a separate blocked slots table
  await this.prisma.appointment.create({
    data: {
      patientId: 'SYSTEM_BLOCK', // Special ID for blocked slots
      doctorId: doctor.id,
      date: new Date(blockSlotData.date),
      startTime: blockSlotData.timeSlot,
      endTime: blockSlotData.endTime || blockSlotData.timeSlot,
      type: 'CONSULTATION',
      status: 'CANCELLED', // Use CANCELLED status to indicate blocked
      reason: blockSlotData.reason || 'Slot blocked by system',
      notes: `Blocked by ${blockSlotData.blockedBy || 'admin'}`,
      createdById: blockSlotData.createdBy,
    },
  });

  return { success: true, message: 'Time slot blocked successfully' };
}

async unblockTimeSlot(doctorId: string, unblockSlotData: UnblockSlotDto): Promise<{ success: boolean; message: string }> {
  const doctor = await this.findDoctorById(doctorId);
  
  // Find and delete the blocked slot
  const blockedSlot = await this.prisma.appointment.findFirst({
    where: {
      doctorId: doctor.id,
      date: new Date(unblockSlotData.date),
      startTime: unblockSlotData.timeSlot,
      patientId: 'SYSTEM_BLOCK',
      status: 'CANCELLED',
    },
  });

  if (!blockedSlot) {
    return { success: false, message: 'Blocked slot not found' };
  }

  await this.prisma.appointment.delete({
    where: { id: blockedSlot.id },
  });

  return { success: true, message: 'Time slot unblocked successfully' };
}

async getDepartmentAvailability(departmentId: string, date: string): Promise<any[]> {
  const targetDate = new Date(date);
  const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  // Get all doctors in the department
  const doctors = await this.prisma.doctor.findMany({
    where: {
      OR: [
        { departmentId: departmentId },
        { departments: { some: { departmentId: departmentId } } },
      ],
      isActive: true,
      isAvailable: true,
    },
    include: {
      schedules: {
        where: {
          dayOfWeek: dayOfWeek,
          status: 'ACTIVE',
        },
      },
    },
  });

  // Get availability for each doctor
  const availability = [];
  for (const doctor of doctors) {
    const slots = await this.getDoctorAvailableSlots(doctor.id, date);
    availability.push({
      doctorId: doctor.id,
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      specialization: doctor.specialization,
      availableSlots: slots.length,
      totalSlots: doctor.schedules.reduce((total, schedule) => {
        return total + this.calculateTotalSlots(schedule.startTime, schedule.endTime, schedule.maxPatients);
      }, 0),
      slots: slots,
    });
  }

  return availability;
}

async getBulkSlotAvailability(doctorIds: string[], startDate: string, endDate: string): Promise<any> {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates = this.getDateRange(start, end);
  
  const availability = {};
  
  for (const doctorId of doctorIds) {
    availability[doctorId] = {};
    
    for (const date of dates) {
      const dateStr = date.toISOString().split('T')[0];
      const slots = await this.getDoctorAvailableSlots(doctorId, dateStr);
      availability[doctorId][dateStr] = {
        availableSlots: slots.length,
        slots: slots,
      };
    }
  }

  return availability;
}

async updateConsultationType(id: string, updateData: UpdateConsultationTypeDto): Promise<ScheduleResponseDto> {
  const schedule = await this.prisma.schedule.findUnique({
    where: { id },
  });

  if (!schedule) {
    throw new NotFoundException('Schedule not found');
  }

  const updatedSchedule = await this.prisma.schedule.update({
    where: { id },
    data: {
      consultationType: updateData.consultationType,
      notes: updateData.notes,
    },
    include: {
      doctor: true,
    },
  });

  return this.mapToResponseDto(updatedSchedule);
}

async getScheduleConflicts(doctorId: string, date?: string): Promise<any[]> {
  const doctor = await this.findDoctorById(doctorId);
  const conflicts = [];

  // Get doctor's schedules
  const schedules = await this.prisma.schedule.findMany({
    where: {
      doctorId: doctor.id,
      status: 'ACTIVE',
    },
  });

  // Check for overlapping schedules on same day
  const schedulesByDay = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.dayOfWeek]) {
      acc[schedule.dayOfWeek] = [];
    }
    acc[schedule.dayOfWeek].push(schedule);
    return acc;
  }, {});

  for (const [day, daySchedules] of Object.entries(schedulesByDay)) {
    if (daySchedules.length > 1) {
      // Check for time overlaps
      for (let i = 0; i < daySchedules.length; i++) {
        for (let j = i + 1; j < daySchedules.length; j++) {
          if (this.hasTimeOverlap(daySchedules[i], daySchedules[j])) {
            conflicts.push({
              type: 'SCHEDULE_OVERLAP',
              day: day,
              schedule1: daySchedules[i],
              schedule2: daySchedules[j],
              message: `Overlapping schedules on ${day}`,
            });
          }
        }
      }
    }
  }

  // If specific date provided, check for over-booking
  if (date) {
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const daySchedule = schedules.find(s => s.dayOfWeek === dayOfWeek);
    if (daySchedule) {
      const appointments = await this.prisma.appointment.findMany({
        where: {
          doctorId: doctor.id,
          date: targetDate,
          status: { not: 'CANCELLED' },
        },
      });

      if (appointments.length > daySchedule.maxPatients) {
        conflicts.push({
          type: 'OVER_BOOKING',
          date: date,
          scheduled: appointments.length,
          maxAllowed: daySchedule.maxPatients,
          message: `Over-booked on ${date}: ${appointments.length}/${daySchedule.maxPatients}`,
        });
      }
    }
  }

  return conflicts;
}

private generateTimeSlots(
  startTime: string,
  endTime: string,
  breakStart?: string,
  breakEnd?: string,
  maxPatients: number = 1,
  appointments: any[] = [],
  opdVisits: any[] = [],
): any[] {
  const slots = [];
  const slotDuration = 30; // 30 minutes per slot
  
  // Convert time strings to minutes
  const start = this.timeToMinutes(startTime);
  const end = this.timeToMinutes(endTime);
  const breakStartMin = breakStart ? this.timeToMinutes(breakStart) : null;
  const breakEndMin = breakEnd ? this.timeToMinutes(breakEnd) : null;

  for (let time = start; time < end; time += slotDuration) {
    // Skip break time
    if (breakStartMin && breakEndMin && time >= breakStartMin && time < breakEndMin) {
      continue;
    }

    const timeStr = this.minutesToTime(time);
    const endTimeStr = this.minutesToTime(time + slotDuration);
    
    // Count existing bookings for this slot
    const bookingsCount = appointments.filter(apt => apt.startTime === timeStr).length +
                         opdVisits.filter(visit => visit.appointmentSlot === timeStr).length;

    slots.push({
      time: timeStr,
      endTime: endTimeStr,
      status: bookingsCount >= maxPatients ? 'booked' : 'available',
      bookedCount: bookingsCount,
      maxPatients: maxPatients,
      availableSlots: Math.max(0, maxPatients - bookingsCount),
    });
  }

  return slots;
}

private timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

private minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

private hasTimeOverlap(schedule1: any, schedule2: any): boolean {
  const start1 = this.timeToMinutes(schedule1.startTime);
  const end1 = this.timeToMinutes(schedule1.endTime);
  const start2 = this.timeToMinutes(schedule2.startTime);
  const end2 = this.timeToMinutes(schedule2.endTime);

  return start1 < end2 && start2 < end1;
}

private calculateTotalSlots(startTime: string, endTime: string, maxPatients: number): number {
  const start = this.timeToMinutes(startTime);
  const end = this.timeToMinutes(endTime);
  const slotDuration = 30;
  const totalSlots = Math.floor((end - start) / slotDuration);
  return totalSlots * maxPatients;
}

private getDateRange(startDate: Date, endDate: Date): Date[] {
  const dates = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

private async findDoctorById(id: string) {
  const doctor = await this.prisma.doctor.findFirst({
    where: { OR: [{ id }, { doctorId: id }] },
  });
  if (!doctor) {
    throw new NotFoundException(`Doctor with ID ${id} not found`);
  }
  return doctor;
}
```

#### 8.8 Departments Controller Enhancements
```typescript
// ADDITIONAL ENDPOINTS NEEDED IN src/departments/departments.controller.ts

@Get(':id/doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
@ApiOperation({ summary: 'Get all doctors in a department' })
@ApiParam({ name: 'id', description: 'Department ID' })
@ApiQuery({ name: 'available', description: 'Filter by availability', required: false })
async getDepartmentDoctors(
  @Param('id') id: string,
  @Query('available') available?: boolean,
): Promise<any[]> {
  return this.departmentsService.getDepartmentDoctors(id, available);
}

@Get(':id/opd-stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DOCTOR)
@ApiOperation({ summary: 'Get department OPD statistics' })
async getDepartmentOPDStats(@Param('id') id: string): Promise<any> {
  return this.departmentsService.getOPDStats(id);
}

@Get(':id/ipd-stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DOCTOR)
@ApiOperation({ summary: 'Get department IPD statistics' })
async getDepartmentIPDStats(@Param('id') id: string): Promise<any> {
  return this.departmentsService.getIPDStats(id);
}
```

#### 8.9 New DTOs Required
```typescript
// src/patients/dto/find-or-create-patient.dto.ts
export class FindOrCreatePatientDto {
  patientId?: string;
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  dateOfBirth: string;
  gender: Gender;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  bloodGroup?: string;
  allergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
}

// src/doctors/dto/book-slot.dto.ts
export class BookSlotDto {
  date: string;
  timeSlot: string;
  patientId?: string;
  appointmentType: 'OPD' | 'APPOINTMENT';
  notes?: string;
}

// src/appointments/dto/quick-book-appointment.dto.ts
export class QuickBookAppointmentDto {
  patientId?: string;
  doctorId: string;
  date: string;
  timeSlot: string;
  type: AppointmentType;
  reason: string;
  notes?: string;
  // Patient details if new patient
  patientDetails?: {
    firstName: string;
    lastName?: string;
    phone: string;
    email?: string;
    dateOfBirth: string;
    gender: Gender;
  };
}

// src/schedules/dto/block-slot.dto.ts
export class BlockSlotDto {
  date: string;
  timeSlot: string;
  endTime?: string;
  reason?: string;
  blockedBy?: string;
  createdBy: string;
}

// src/schedules/dto/unblock-slot.dto.ts
export class UnblockSlotDto {
  date: string;
  timeSlot: string;
}

// src/schedules/dto/update-consultation-type.dto.ts
export class UpdateConsultationTypeDto {
  consultationType: 'OPD' | 'IPD' | 'EMERGENCY' | 'ALL';
  notes?: string;
}

// src/schedules/dto/schedule-response.dto.ts
export class ScheduleResponseDto {
  id: string;
  doctorId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  maxPatients: number;
  consultationType: string;
  status: string;
  notes?: string;
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
    specialization: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## 🚀 Implementation Steps

### Step 1: Database Schema
1. Add all OPD/IPD models to `schema.prisma`
2. Add all new enums
3. Update existing models with new relations
4. Run migrations

### Step 2: Enhance Existing Controllers
1. Add patient search and medical summary endpoints
2. Add doctor slot management and department filtering
3. Add appointment quick booking and slot availability
4. Add department statistics and doctor listings
5. Create all required DTOs

### Step 3: Generate New Modules
1. Use NestJS CLI to generate all required modules
2. Create service and controller files
3. Create DTO files for all endpoints

### Step 4: Implement Services
1. Implement auto patient creation logic
2. Add business logic for OPD workflows
3. Add business logic for IPD workflows
4. Add validation and error handling

### Step 5: Implement Controllers
1. Add all API endpoints
2. Add proper authentication/authorization
3. Add API documentation with Swagger
4. Add input validation

### Step 6: Testing
1. Unit tests for services
2. Integration tests for controllers
3. E2E tests for complete workflows

## 📊 Key Features

### OPD Features
- ✅ Auto patient creation during visit
- ✅ Complete visit workflow in single session
- ✅ Real-time vitals recording
- ✅ Prescription management
- ✅ Immediate billing and payment
- ✅ Follow-up scheduling
- ✅ Investigation ordering

### IPD Features
- ✅ Auto patient creation during admission
- ✅ Ward and bed management
- ✅ Continuous vitals monitoring
- ✅ Treatment plan management
- ✅ Bed transfer functionality
- ✅ Discharge process with summary
- ✅ Multi-day billing

### Common Features
- ✅ Unified patient records
- ✅ Doctor scheduling integration
- ✅ Department management
- ✅ Role-based access control
- ✅ Audit logging
- ✅ Real-time notifications

## 🔒 Security Considerations

- All endpoints require JWT authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- Audit logging for all operations
- Patient data privacy compliance

## 📈 Performance Optimizations

- Database indexing on frequently queried fields
- Pagination for large datasets
- Caching for frequently accessed data
- Optimized database queries with proper relations

## 🧪 Testing Strategy

- Unit tests for all services (>80% coverage)
- Integration tests for all controllers
- E2E tests for critical workflows
- Performance testing for high-load scenarios

## 🎨 Frontend Integration Guide

### Phase 11: Frontend Hooks & API Integration

Based on the existing frontend components analysis, the following custom hooks need to be created for seamless API integration:

#### 11.1 Core OPD Hooks

##### useOPDVisit Hook
```typescript
// hooks/opd/useOPDVisit.tsx
"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

export interface OPDVisitData {
  // Patient Registration (auto-creation)
  patientId?: string
  firstName: string
  lastName?: string
  age: number
  gender: "MALE" | "FEMALE" | "OTHER"
  phone: string
  email?: string
  address?: string
  bloodGroup?: string
  allergies?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  
  // Visit Information
  doctorId: string
  departmentId: string
  visitType: "OPD" | "EMERGENCY" | "REVIEW"
  appointmentMode: "WALK_IN" | "ONLINE" | "PHONE"
  visitPriority: "NORMAL" | "URGENT" | "EMERGENCY"
  appointmentSlot?: string
  referralSource?: string
  
  // Clinical Information
  chiefComplaint: string
  historyOfPresentIllness: string
  pastMedicalHistory?: string
  familyHistory?: string
  personalHistory?: string
  generalExamination?: string
  systemicExamination?: string
  
  // Diagnosis & Treatment
  provisionalDiagnosis?: string
  finalDiagnosis?: string
  treatmentNotes?: string
  recommendedLabTests?: string[]
  radiologyTests?: string[]
  
  // Follow-up
  followUpDate?: string
  followUpInstructions?: string
  referToIPD?: boolean
  referralNote?: string
}

export interface OPDVisit extends OPDVisitData {
  id: string
  visitId: string
  visitDate: string
  visitStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  createdAt: string
  updatedAt: string
  patient?: any
  doctor?: any
  department?: any
  vitals?: any[]
  prescriptions?: any[]
  billing?: any
}

interface UseOPDVisitReturn {
  visits: OPDVisit[]
  loading: boolean
  error: string | null
  createVisit: (data: OPDVisitData) => Promise<OPDVisit | null>
  updateVisit: (id: string, data: Partial<OPDVisitData>) => Promise<OPDVisit | null>
  fetchVisits: (filters?: any) => Promise<void>
  fetchVisitById: (id: string) => Promise<OPDVisit | null>
  fetchPatientVisits: (patientId: string) => Promise<OPDVisit[]>
  fetchDoctorVisits: (doctorId: string, date?: string) => Promise<OPDVisit[]>
  cancelVisit: (id: string) => Promise<boolean>
}

export const useOPDVisit = (): UseOPDVisitReturn => {
  const [visits, setVisits] = useState<OPDVisit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken")
    }
    return null
  }

  const createVisit = useCallback(async (data: OPDVisitData): Promise<OPDVisit | null> => {
    setLoading(true)
    setError(null)

    try {
      const token = getAuthToken()
      const response = await fetch(`${API_BASE_URL}/opd/visits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create OPD visit")
      }

      const newVisit = await response.json()
      setVisits(prev => [...prev, newVisit])

      toast({
        title: "Success",
        description: "OPD visit created successfully",
      })

      return newVisit
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create OPD visit"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [API_BASE_URL, toast])

  // ... other methods

  return {
    visits,
    loading,
    error,
    createVisit,
    updateVisit,
    fetchVisits,
    fetchVisitById,
    fetchPatientVisits,
    fetchDoctorVisits,
    cancelVisit,
  }
}
```

##### useOPDVitals Hook
```typescript
// hooks/opd/useOPDVitals.tsx
export interface OPDVitalsData {
  opdVisitId: string
  heightCm?: number
  weightKg?: number
  bmi?: number
  temperature: number
  bloodPressure: string // "120/80"
  pulseRate: number
  respiratoryRate?: number
  spo2: number
  weightNote?: string
  recordedBy: string
}

export const useOPDVitals = () => {
  // Similar structure to useOPDVisit
  // API endpoints: /opd/visits/:visitId/vitals
}
```

##### useOPDPrescription Hook
```typescript
// hooks/opd/useOPDPrescription.tsx
export interface OPDPrescriptionData {
  opdVisitId: string
  drugName: string
  strength: string
  route: "ORAL" | "IV" | "IM" | "SUBCUTANEOUS" | "TOPICAL" | "INHALATION" | "OTHER"
  frequency: string
  dose: string
  duration: string
  instructions?: string
  notes?: string
}

export const useOPDPrescription = () => {
  // API endpoints: /opd/visits/:visitId/prescriptions
  // /prescriptions/patient/:patientId
  // /prescriptions/medications/search
}
```

#### 11.2 Core IPD Hooks

##### useIPDAdmission Hook
```typescript
// hooks/ipd/useIPDAdmission.tsx
export interface IPDAdmissionData {
  // Patient Registration (auto-creation)
  patientId?: string
  firstName: string
  lastName?: string
  gender: "MALE" | "FEMALE" | "OTHER"
  phone: string
  email?: string
  dateOfBirth: string
  address?: string
  bloodGroup?: string
  allergies?: string
  
  // Admission Details
  wardId: string
  bedId: string
  consultingDoctorId: string
  departmentId: string
  admissionDate: string
  admissionTime: string
  reasonForAdmission: string
  tentativeDiagnosis: string
  admissionType: "EMERGENCY" | "PLANNED" | "REFERRAL"
  
  // Attendant Information
  attendantName?: string
  attendantRelation?: string
  attendantPhone?: string
  attendantAddress?: string
  
  // Payment Information
  paymentMode?: "CASH" | "CARD" | "BANK_TRANSFER" | "INSURANCE" | "ONLINE"
  insuranceName?: string
  policyNumber?: string
  initialDeposit?: number
  specialInstructions?: string
}

export const useIPDAdmission = () => {
  // API endpoints: /ipd/admissions
  // /ipd/admissions/patient/:patientId
  // /ipd/admissions/active
  // /ipd/admissions/ward/:wardId
}
```

##### useWard Hook
```typescript
// hooks/ipd/useWard.tsx
export interface WardData {
  name: string
  type: "GENERAL" | "PRIVATE" | "SEMI_PRIVATE" | "ICU" | "EMERGENCY"
  totalBeds: number
  chargesPerDay: number
}

export const useWard = () => {
  // API endpoints: /wards
  // /wards/:id/beds
  // /wards/available-beds
}
```

##### useBed Hook
```typescript
// hooks/ipd/useBed.tsx
export const useBed = () => {
  // API endpoints: /wards/beds/:id/occupy
  // /wards/beds/:id/release
  // /ipd/beds/available
}
```

##### useIPDVitals Hook
```typescript
// hooks/ipd/useIPDVitals.tsx
export interface IPDVitalsData {
  admissionId: string
  temperature: number
  systolicBP: number
  diastolicBP: number
  heartRate: number
  respiratoryRate: number
  oxygenSaturation: number
  bloodSugar?: number
  weight?: number
  height?: number
  nursingNotes?: string
  recordedBy: string
}

export const useIPDVitals = () => {
  // API endpoints: /ipd/admissions/:admissionId/vitals
  // /vitals/ipd/:admissionId/trends
}
```

##### useTreatment Hook
```typescript
// hooks/ipd/useTreatment.tsx
export interface TreatmentData {
  admissionId: string
  type: "MEDICATION" | "PROCEDURE" | "LAB_ORDER" | "INVESTIGATION"
  description: string
  prescribedBy: string
  dosage?: string
  frequency?: string
  duration?: string
  instructions?: string
}

export const useTreatment = () => {
  // API endpoints: /ipd/admissions/:admissionId/treatments
  // /ipd/treatments/:id/status
}
```

##### useBedTransfer Hook
```typescript
// hooks/ipd/useBedTransfer.tsx
export interface BedTransferData {
  admissionId: string
  fromWardId: string
  fromBedId: string
  toWardId: string
  toBedId: string
  transferDate: string
  transferTime: string
  reason: string
  transferredBy: string
  approvedBy?: string
}

export const useBedTransfer = () => {
  // API endpoints: /ipd/transfers
  // /ipd/transfers/admission/:admissionId
  // /ipd/transfers/pending
}
```

##### useDischarge Hook
```typescript
// hooks/ipd/useDischarge.tsx
export interface DischargeData {
  admissionId: string
  dischargeDate: string
  dischargeTime: string
  finalDiagnosis: string
  treatmentSummary: string
  followUpInstructions: string
  followUpDate?: string
  billingAmount?: number
  dischargedBy: string
  approvedBy?: string
  attachedDocuments?: string[]
  medications: DischargeMedicationData[]
}

export const useDischarge = () => {
  // API endpoints: /ipd/discharge
  // /ipd/discharge/:admissionId
  // /ipd/discharge/:id/pdf
}
```

#### 11.3 Enhanced Existing Hooks

##### Enhanced usePatient Hook
```typescript
// hooks/usePatient.tsx (Enhancement)
export const usePatient = () => {
  // NEW METHODS TO ADD:
  const searchPatients = async (query: string, limit?: number) => {
    // API: GET /patients/search?query=:query&limit=:limit
  }

  const getOPDHistory = async (patientId: string) => {
    // API: GET /patients/:id/opd-history
  }

  const getIPDHistory = async (patientId: string) => {
    // API: GET /patients/:id/ipd-history
  }

  const getMedicalSummary = async (patientId: string) => {
    // API: GET /patients/:id/medical-summary
  }

  const findOrCreatePatient = async (patientData: any) => {
    // API: POST /patients/find-or-create
  }
}
```

##### Enhanced useDoctor Hook
```typescript
// hooks/doctor/use-doctor.tsx (Enhancement)
export const useDoctor = () => {
  // NEW METHODS TO ADD:
  const getDoctorsByDepartment = async (departmentId: string) => {
    // API: GET /doctors/by-department/:departmentId
  }

  const getAvailableSlots = async (doctorId: string, date: string) => {
    // API: GET /doctors/:id/available-slots?date=:date
  }

  const getDoctorOPDVisits = async (doctorId: string, date?: string, status?: string) => {
    // API: GET /doctors/:id/opd-visits?date=:date&status=:status
  }

  const getDoctorIPDPatients = async (doctorId: string) => {
    // API: GET /doctors/:id/ipd-patients
  }

  const bookTimeSlot = async (doctorId: string, bookingData: any) => {
    // API: POST /doctors/:id/book-slot
  }
}
```

#### 11.4 New Utility Hooks

##### useSchedule Hook
```typescript
// hooks/useSchedule.tsx
export const useSchedule = () => {
  const getDoctorAvailableSlots = async (doctorId: string, date: string, consultationType?: string) => {
    // API: GET /schedules/doctor/:doctorId/available-slots?date=:date&consultationType=:type
  }

  const getDoctorWeeklySchedule = async (doctorId: string) => {
    // API: GET /schedules/doctor/:doctorId/weekly
  }

  const blockTimeSlot = async (doctorId: string, blockData: any) => {
    // API: POST /schedules/doctor/:doctorId/block-slot
  }

  const getDepartmentAvailability = async (departmentId: string, date: string) => {
    // API: GET /schedules/department/:departmentId/availability?date=:date
  }

  const getBulkSlotAvailability = async (doctorIds: string[], startDate: string, endDate: string) => {
    // API: GET /schedules/slots/bulk-availability
  }
}
```

##### useBilling Hook
```typescript
// hooks/useBilling.tsx
export const useBilling = () => {
  const getOPDBilling = async (opdVisitId: string) => {
    // API: GET /billing/opd/:opdVisitId
  }

  const recordOPDPayment = async (opdVisitId: string, paymentData: any) => {
    // API: POST /billing/opd/:opdVisitId/payment
  }

  const getIPDBillingEstimate = async (admissionId: string) => {
    // API: GET /billing/ipd/:admissionId/estimate
  }

  const getFinalIPDBill = async (admissionId: string) => {
    // API: GET /billing/ipd/:admissionId/final
  }

  const getPendingPayments = async (type?: 'opd' | 'ipd') => {
    // API: GET /billing/pending-payments?type=:type
  }
}
```

##### useSearch Hook
```typescript
// hooks/useSearch.tsx
export const useSearch = () => {
  const globalSearch = async (query: string, type?: string) => {
    // API: GET /search/global?query=:query&type=:type
  }

  const advancedPatientSearch = async (filters: any) => {
    // API: GET /search/patients/advanced
  }

  const searchAvailableAppointments = async (criteria: any) => {
    // API: GET /search/appointments/availability
  }
}
```

##### useReports Hook
```typescript
// hooks/useReports.tsx
export const useReports = () => {
  const getDailyOPDReport = async (date: string) => {
    // API: GET /reports/opd/daily?date=:date
  }

  const getIPDOccupancyReport = async () => {
    // API: GET /reports/ipd/occupancy
  }

  const getDoctorPerformance = async (doctorId: string) => {
    // API: GET /reports/doctor/:doctorId/performance
  }

  const getDepartmentAnalytics = async (deptId: string) => {
    // API: GET /reports/department/:deptId/analytics
  }
}
```

### Phase 12: Frontend Component Integration Points

#### 12.1 OPD Components Integration

##### OPD Visit Form Component
```typescript
// components/opd/opd-visit-form.tsx
import { useOPDVisit } from "@/hooks/opd/useOPDVisit"
import { useOPDVitals } from "@/hooks/opd/useOPDVitals"
import { useOPDPrescription } from "@/hooks/opd/useOPDPrescription"
import { usePatient } from "@/hooks/usePatient"
import { useDoctor } from "@/hooks/doctor/use-doctor"

export const OPDVisitForm = () => {
  const { createVisit, loading } = useOPDVisit()
  const { searchPatients, findOrCreatePatient } = usePatient()
  const { getDoctorsByDepartment } = useDoctor()
  
  // Integration Points:
  // 1. Auto patient creation via findOrCreatePatient
  // 2. Doctor selection via getDoctorsByDepartment
  // 3. Visit creation via createVisit
  // 4. Real-time vitals via useOPDVitals
  // 5. Prescription management via useOPDPrescription
}
```

##### Patient Search Select Component
```typescript
// components/opd/patient-search-select.tsx
import { usePatient } from "@/hooks/usePatient"

export const PatientSearchSelect = () => {
  const { searchPatients, getMedicalSummary } = usePatient()
  
  // Integration Points:
  // 1. Real-time patient search via searchPatients
  // 2. Patient history display via getMedicalSummary
  // 3. Auto-complete with debounced search
}
```

##### Doctor Time Slot Picker Component
```typescript
// components/opd/doctor-time-slot-picker.tsx
import { useDoctor } from "@/hooks/doctor/use-doctor"
import { useSchedule } from "@/hooks/useSchedule"

export const DoctorTimeSlotPicker = () => {
  const { getDoctorsByDepartment } = useDoctor()
  const { getDoctorAvailableSlots, blockTimeSlot } = useSchedule()
  
  // Integration Points:
  // 1. Department-wise doctor filtering
  // 2. Real-time slot availability
  // 3. Slot booking and blocking
  // 4. Conflict detection
}
```

##### Prescription Builder Component
```typescript
// components/opd/prescription-builder.tsx
import { useOPDPrescription } from "@/hooks/opd/useOPDPrescription"

export const PrescriptionBuilder = () => {
  const { addPrescription, searchMedications } = useOPDPrescription()
  
  // Integration Points:
  // 1. Medicine search and autocomplete
  // 2. Dosage calculations
  // 3. Drug interaction checks
  // 4. Prescription history
}
```

##### Vitals Calculator Component
```typescript
// components/opd/vitals-calculator.tsx
import { useOPDVitals } from "@/hooks/opd/useOPDVitals"

export const VitalsCalculator = () => {
  const { recordVitals, getLatestVitals } = useOPDVitals()
  
  // Integration Points:
  // 1. BMI auto-calculation
  // 2. Vitals validation
  // 3. Historical comparison
  // 4. Abnormal value alerts
}
```

#### 12.2 IPD Components Integration

##### Comprehensive Admission Form Component
```typescript
// components/ipd/comprehensive-admission-form.tsx
import { useIPDAdmission } from "@/hooks/ipd/useIPDAdmission"
import { useWard } from "@/hooks/ipd/useWard"
import { useBed } from "@/hooks/ipd/useBed"
import { usePatient } from "@/hooks/usePatient"

export const ComprehensiveAdmissionForm = () => {
  const { createAdmission } = useIPDAdmission()
  const { fetchWards } = useWard()
  const { getAvailableBeds, occupyBed } = useBed()
  const { findOrCreatePatient } = usePatient()
  
  // Integration Points:
  // 1. Auto patient creation
  // 2. Real-time bed availability
  // 3. Ward filtering by type
  // 4. Admission with bed assignment
  // 5. Insurance validation
}
```

##### Patient Search Component (IPD)
```typescript
// components/ipd/patient-search.tsx
import { usePatient } from "@/hooks/usePatient"

export const PatientSearch = () => {
  const { searchPatients, getIPDHistory, getOPDHistory } = usePatient()
  
  // Integration Points:
  // 1. Advanced patient search
  // 2. Medical history display
  // 3. Previous admissions
  // 4. Current OPD visits
}
```

##### Bed Transfer Form Component
```typescript
// components/ipd/bed-transfer-form.tsx
import { useBedTransfer } from "@/hooks/ipd/useBedTransfer"
import { useBed } from "@/hooks/ipd/useBed"

export const BedTransferForm = () => {
  const { createTransfer, getPendingTransfers } = useBedTransfer()
  const { getAvailableBeds } = useBed()
  
  // Integration Points:
  // 1. Available bed lookup
  // 2. Transfer approval workflow
  // 3. Bed status updates
  // 4. Transfer history
}
```

##### Vitals Form Component (IPD)
```typescript
// components/ipd/vitals-form.tsx
import { useIPDVitals } from "@/hooks/ipd/useIPDVitals"

export const VitalsForm = () => {
  const { recordVitals, getVitalsTrends } = useIPDVitals()
  
  // Integration Points:
  // 1. Continuous vitals monitoring
  // 2. Trend analysis
  // 3. Critical value alerts
  // 4. Nursing notes integration
}
```

##### Treatment Form Component
```typescript
// components/ipd/treatment-form.tsx
import { useTreatment } from "@/hooks/ipd/useTreatment"

export const TreatmentForm = () => {
  const { addTreatment, updateTreatmentStatus } = useTreatment()
  
  // Integration Points:
  // 1. Treatment plan management
  // 2. Medication scheduling
  // 3. Procedure tracking
  // 4. Progress monitoring
}
```

##### Discharge Form Component
```typescript
// components/ipd/discharge-form.tsx
import { useDischarge } from "@/hooks/ipd/useDischarge"
import { useBilling } from "@/hooks/useBilling"

export const DischargeForm = () => {
  const { createDischarge, generateDischargePDF } = useDischarge()
  const { getFinalIPDBill } = useBilling()
  
  // Integration Points:
  // 1. Final billing calculation
  // 2. Discharge summary generation
  // 3. Follow-up scheduling
  // 4. Document management
}
```

### Phase 13: API Client Configuration

#### 13.1 Enhanced API Client
```typescript
// lib/api-client.ts
class ApiClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    this.defaultHeaders = {
      "Content-Type": "application/json",
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers = {
      ...this.defaultHeaders,
      ...this.getAuthHeaders(),
      ...options.headers,
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
      throw new Error(errorData.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // HTTP methods
  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }

  // File upload
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<T> {
    const formData = new FormData()
    formData.append("file", file)
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    return this.request<T>(endpoint, {
      method: "POST",
      body: formData,
      headers: this.getAuthHeaders(), // Don't set Content-Type for FormData
    })
  }
}

export const apiClient = new ApiClient()
```

### Phase 14: Integration Testing & Error Handling

#### 14.1 Error Boundary Components
```typescript
// components/error-boundary.tsx
export const OPDErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  // Handle OPD-specific errors
}

export const IPDErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  // Handle IPD-specific errors
}
```

#### 14.2 Loading States & Skeletons
```typescript
// components/ui/loading-skeletons.tsx
export const OPDFormSkeleton = () => {
  // Loading skeleton for OPD forms
}

export const IPDFormSkeleton = () => {
  // Loading skeleton for IPD forms
}

export const PatientSearchSkeleton = () => {
  // Loading skeleton for patient search
}
```



This comprehensive frontend integration guide provides a complete roadmap for connecting the existing frontend components with the new backend APIs, ensuring seamless OPD and IPD management workflows.

This implementation will provide a comprehensive OPD and IPD management system with automatic patient creation, proper workflow separation, and integrated patient records.