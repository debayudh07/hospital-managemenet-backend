/*
  Warnings:

  - You are about to drop the column `allergiesDetailed` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `appointmentSlot` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `bloodPressure` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `bmi` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `consultationFee` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `consultingDoctorId` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `discountAmount` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `doctorSpecialization` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `durationOfSymptoms` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `followUpSuggestedDays` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `heightCm` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `icd10Codes` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `insuranceCompany` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `insurancePolicyNumber` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `insurancePreAuthRequired` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `investigationEstimate` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `investigationUrgency` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `modifiedBy` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMode` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `personalHistory` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `prescriptionList` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `procedureCharges` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `proceduresDone` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `pulseRate` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `radiologyTests` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `recommendedLabTests` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `referToIPD` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `referralNote` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `respiratoryRate` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `spo2` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `temperature` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `tokenNumber` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `totalPayable` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `treatmentNotes` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `visitPriority` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `visitStatus` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `weightKg` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `weightNote` on the `opd_visits` table. All the data in the column will be lost.
  - You are about to drop the column `familyHistory` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `guardianName` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `guardianRelation` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `idProofNumber` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `idProofType` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `medicalHistory` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `occupation` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `patientType` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `personalHistory` on the `patients` table. All the data in the column will be lost.
  - Added the required column `departmentId` to the `opd_visits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doctorId` to the `opd_visits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `visitTime` to the `opd_visits` table without a default value. This is not possible if the table is not empty.
  - Made the column `address` on table `patients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `patients` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "opd_vitals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "opdVisitId" TEXT NOT NULL,
    "bloodPressure" TEXT,
    "heartRate" INTEGER,
    "temperature" REAL,
    "respiratoryRate" INTEGER,
    "oxygenSaturation" INTEGER,
    "weight" REAL,
    "height" REAL,
    "bmi" REAL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "opd_vitals_opdVisitId_fkey" FOREIGN KEY ("opdVisitId") REFERENCES "opd_visits" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "opd_prescriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "opdVisitId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "medicineName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "quantity" INTEGER,
    "route" TEXT NOT NULL DEFAULT 'ORAL',
    "instructions" TEXT,
    "isGeneric" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "opd_prescriptions_opdVisitId_fkey" FOREIGN KEY ("opdVisitId") REFERENCES "opd_visits" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "opd_prescriptions_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "opd_billing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "opdVisitId" TEXT NOT NULL,
    "consultationFee" REAL NOT NULL,
    "additionalCharges" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    "tax" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "paidAmount" REAL NOT NULL DEFAULT 0,
    "balanceAmount" REAL NOT NULL DEFAULT 0,
    "transactionId" TEXT,
    "paymentDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "opd_billing_opdVisitId_fkey" FOREIGN KEY ("opdVisitId") REFERENCES "opd_visits" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wardNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "totalBeds" INTEGER NOT NULL,
    "availableBeds" INTEGER NOT NULL,
    "floor" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "wards_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "beds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bedNumber" TEXT NOT NULL,
    "wardId" TEXT NOT NULL,
    "isOccupied" BOOLEAN NOT NULL DEFAULT false,
    "bedType" TEXT,
    "dailyRate" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "beds_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "wards" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "admissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "admissionId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "bedId" TEXT NOT NULL,
    "admissionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "admissionTime" TEXT NOT NULL,
    "admissionType" TEXT NOT NULL,
    "category" TEXT,
    "referralSource" TEXT,
    "referredBy" TEXT,
    "chiefComplaint" TEXT NOT NULL,
    "presentIllness" TEXT,
    "pastHistory" TEXT,
    "familyHistory" TEXT,
    "personalHistory" TEXT,
    "generalCondition" TEXT,
    "consciousness" TEXT,
    "provisionalDiagnosis" TEXT NOT NULL,
    "finalDiagnosis" TEXT,
    "treatmentPlan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'STABLE',
    "expectedDischargeDate" DATETIME,
    "actualDischargeDate" DATETIME,
    "dischargeType" TEXT,
    "estimatedCost" REAL,
    "depositAmount" REAL,
    "notes" TEXT,
    "emergencyContact" TEXT,
    "insuranceDetails" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "admissions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "admissions_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "admissions_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "beds" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ipd_vitals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "admissionId" TEXT NOT NULL,
    "bloodPressure" TEXT,
    "heartRate" INTEGER,
    "temperature" REAL,
    "respiratoryRate" INTEGER,
    "oxygenSaturation" INTEGER,
    "weight" REAL,
    "height" REAL,
    "bmi" REAL,
    "urinOutput" REAL,
    "fluidIntake" REAL,
    "painScale" INTEGER,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT NOT NULL,
    "shift" TEXT,
    "notes" TEXT,
    CONSTRAINT "ipd_vitals_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "admissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "treatments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "admissionId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "medication" TEXT,
    "dosage" TEXT,
    "frequency" TEXT,
    "route" TEXT,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "treatments_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "admissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "treatments_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bed_transfers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "admissionId" TEXT NOT NULL,
    "fromBedId" TEXT NOT NULL,
    "toBedId" TEXT NOT NULL,
    "transferDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transferTime" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "approvedBy" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bed_transfers_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "admissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bed_transfers_fromBedId_fkey" FOREIGN KEY ("fromBedId") REFERENCES "beds" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bed_transfers_toBedId_fkey" FOREIGN KEY ("toBedId") REFERENCES "beds" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "discharges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "admissionId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "dischargeDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dischargeTime" TEXT NOT NULL,
    "dischargeType" TEXT NOT NULL,
    "finalDiagnosis" TEXT NOT NULL,
    "treatmentSummary" TEXT,
    "conditionAtDischarge" TEXT,
    "followUpInstructions" TEXT,
    "followUpDate" DATETIME,
    "restrictions" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "discharges_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "admissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "discharges_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "discharge_medications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dischargeId" TEXT NOT NULL,
    "medicineName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "instructions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "discharge_medications_dischargeId_fkey" FOREIGN KEY ("dischargeId") REFERENCES "discharges" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_opd_visits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "visitDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitTime" TEXT NOT NULL,
    "visitType" TEXT NOT NULL DEFAULT 'OPD',
    "appointmentMode" TEXT NOT NULL DEFAULT 'WALK_IN',
    "referralSource" TEXT NOT NULL DEFAULT 'SELF',
    "referredBy" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "chiefComplaint" TEXT NOT NULL,
    "historyOfPresentIllness" TEXT,
    "pastMedicalHistory" TEXT,
    "familyHistory" TEXT,
    "socialHistory" TEXT,
    "generalExamination" TEXT,
    "systemicExamination" TEXT,
    "provisionalDiagnosis" TEXT,
    "finalDiagnosis" TEXT,
    "treatmentPlan" TEXT,
    "followUpDate" DATETIME,
    "followUpInstructions" TEXT,
    "investigationRecommendations" TEXT,
    "symptoms" TEXT,
    "notes" TEXT,
    "isFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "parentVisitId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "opd_visits_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "opd_visits_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "opd_visits_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "opd_visits_parentVisitId_fkey" FOREIGN KEY ("parentVisitId") REFERENCES "opd_visits" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_opd_visits" ("appointmentMode", "chiefComplaint", "createdAt", "familyHistory", "finalDiagnosis", "followUpDate", "followUpInstructions", "generalExamination", "historyOfPresentIllness", "id", "pastMedicalHistory", "patientId", "provisionalDiagnosis", "referralSource", "systemicExamination", "updatedAt", "visitDate", "visitId", "visitType") SELECT "appointmentMode", "chiefComplaint", "createdAt", "familyHistory", "finalDiagnosis", "followUpDate", "followUpInstructions", "generalExamination", "historyOfPresentIllness", "id", "pastMedicalHistory", "patientId", "provisionalDiagnosis", coalesce("referralSource", 'SELF') AS "referralSource", "systemicExamination", "updatedAt", "visitDate", "visitId", "visitType" FROM "opd_visits";
DROP TABLE "opd_visits";
ALTER TABLE "new_opd_visits" RENAME TO "opd_visits";
CREATE UNIQUE INDEX "opd_visits_visitId_key" ON "opd_visits"("visitId");
CREATE TABLE "new_patients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "gender" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT '',
    "state" TEXT NOT NULL DEFAULT '',
    "zipCode" TEXT NOT NULL DEFAULT '',
    "emergencyContactName" TEXT NOT NULL DEFAULT '',
    "emergencyContactPhone" TEXT NOT NULL DEFAULT '',
    "emergencyContactRelationship" TEXT NOT NULL DEFAULT '',
    "bloodGroup" TEXT,
    "allergies" TEXT,
    "chronicConditions" TEXT,
    "currentMedications" TEXT,
    "insuranceProvider" TEXT,
    "insurancePolicyNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "avatar" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT,
    CONSTRAINT "patients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_patients" ("address", "allergies", "avatar", "bloodGroup", "chronicConditions", "city", "createdAt", "currentMedications", "dateOfBirth", "email", "emergencyContactName", "emergencyContactPhone", "emergencyContactRelationship", "firstName", "gender", "id", "insurancePolicyNumber", "insuranceProvider", "isActive", "lastName", "notes", "patientId", "phone", "state", "updatedAt", "userId", "zipCode") SELECT "address", "allergies", "avatar", "bloodGroup", "chronicConditions", "city", "createdAt", "currentMedications", "dateOfBirth", "email", "emergencyContactName", "emergencyContactPhone", "emergencyContactRelationship", "firstName", "gender", "id", "insurancePolicyNumber", "insuranceProvider", "isActive", "lastName", "notes", "patientId", "phone", "state", "updatedAt", "userId", "zipCode" FROM "patients";
DROP TABLE "patients";
ALTER TABLE "new_patients" RENAME TO "patients";
CREATE UNIQUE INDEX "patients_patientId_key" ON "patients"("patientId");
CREATE UNIQUE INDEX "patients_userId_key" ON "patients"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "opd_billing_opdVisitId_key" ON "opd_billing"("opdVisitId");

-- CreateIndex
CREATE UNIQUE INDEX "wards_wardNumber_key" ON "wards"("wardNumber");

-- CreateIndex
CREATE UNIQUE INDEX "beds_bedNumber_key" ON "beds"("bedNumber");

-- CreateIndex
CREATE UNIQUE INDEX "admissions_admissionId_key" ON "admissions"("admissionId");

-- CreateIndex
CREATE UNIQUE INDEX "discharges_admissionId_key" ON "discharges"("admissionId");
