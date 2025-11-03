/*
  Warnings:

  - You are about to drop the column `medicineName` on the `opd_prescriptions` table. All the data in the column will be lost.
  - Added the required column `drugName` to the `opd_prescriptions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "opd_investigations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "opdVisitId" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "testType" TEXT NOT NULL DEFAULT 'LAB',
    "urgency" TEXT NOT NULL DEFAULT 'ROUTINE',
    "instructions" TEXT,
    "orderedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ORDERED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "opd_investigations_opdVisitId_fkey" FOREIGN KEY ("opdVisitId") REFERENCES "opd_visits" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_opd_prescriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "opdVisitId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "drugName" TEXT NOT NULL,
    "strength" TEXT,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "quantity" INTEGER,
    "route" TEXT NOT NULL DEFAULT 'ORAL',
    "instructions" TEXT,
    "notes" TEXT,
    "isGeneric" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "opd_prescriptions_opdVisitId_fkey" FOREIGN KEY ("opdVisitId") REFERENCES "opd_visits" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "opd_prescriptions_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_opd_prescriptions" ("createdAt", "doctorId", "dosage", "duration", "frequency", "id", "instructions", "isGeneric", "opdVisitId", "quantity", "route", "updatedAt") SELECT "createdAt", "doctorId", "dosage", "duration", "frequency", "id", "instructions", "isGeneric", "opdVisitId", "quantity", "route", "updatedAt" FROM "opd_prescriptions";
DROP TABLE "opd_prescriptions";
ALTER TABLE "new_opd_prescriptions" RENAME TO "opd_prescriptions";
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
    "guardianName" TEXT,
    "guardianRelation" TEXT,
    "occupation" TEXT,
    "idProofType" TEXT,
    "idProofNumber" TEXT,
    "patientType" TEXT NOT NULL DEFAULT 'NEW',
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
