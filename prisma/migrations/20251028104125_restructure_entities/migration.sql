/*
  Warnings:

  - You are about to drop the column `createdById` on the `patients` table. All the data in the column will be lost.
  - Added the required column `doctorId` to the `doctors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `doctors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `doctors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `doctors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `doctors` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "staffId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "department" TEXT,
    "qualification" TEXT,
    "dateOfBirth" DATETIME,
    "gender" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "avatar" TEXT,
    "joiningDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "salary" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT,
    CONSTRAINT "staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_doctors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "doctorId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "experience" INTEGER NOT NULL,
    "qualification" TEXT NOT NULL,
    "consultationFee" REAL NOT NULL,
    "dateOfBirth" DATETIME,
    "gender" TEXT,
    "address" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "avatar" TEXT,
    "workingHours" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT,
    CONSTRAINT "doctors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_doctors" ("consultationFee", "createdAt", "experience", "id", "isAvailable", "licenseNumber", "qualification", "specialization", "updatedAt", "userId", "workingHours") SELECT "consultationFee", "createdAt", "experience", "id", "isAvailable", "licenseNumber", "qualification", "specialization", "updatedAt", "userId", "workingHours" FROM "doctors";
DROP TABLE "doctors";
ALTER TABLE "new_doctors" RENAME TO "doctors";
CREATE UNIQUE INDEX "doctors_doctorId_key" ON "doctors"("doctorId");
CREATE UNIQUE INDEX "doctors_email_key" ON "doctors"("email");
CREATE UNIQUE INDEX "doctors_licenseNumber_key" ON "doctors"("licenseNumber");
CREATE UNIQUE INDEX "doctors_userId_key" ON "doctors"("userId");
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
INSERT INTO "new_patients" ("address", "allergies", "bloodGroup", "chronicConditions", "city", "createdAt", "currentMedications", "dateOfBirth", "email", "emergencyContactName", "emergencyContactPhone", "emergencyContactRelationship", "firstName", "gender", "id", "insurancePolicyNumber", "insuranceProvider", "isActive", "lastName", "patientId", "phone", "state", "updatedAt", "userId", "zipCode") SELECT "address", "allergies", "bloodGroup", "chronicConditions", "city", "createdAt", "currentMedications", "dateOfBirth", "email", "emergencyContactName", "emergencyContactPhone", "emergencyContactRelationship", "firstName", "gender", "id", "insurancePolicyNumber", "insuranceProvider", "isActive", "lastName", "patientId", "phone", "state", "updatedAt", "userId", "zipCode" FROM "patients";
DROP TABLE "patients";
ALTER TABLE "new_patients" RENAME TO "patients";
CREATE UNIQUE INDEX "patients_patientId_key" ON "patients"("patientId");
CREATE UNIQUE INDEX "patients_userId_key" ON "patients"("userId");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "avatar" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "dateOfBirth" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("address", "avatar", "createdAt", "dateOfBirth", "email", "firstName", "id", "isActive", "lastName", "password", "phone", "role", "updatedAt") SELECT "address", "avatar", "createdAt", "dateOfBirth", "email", "firstName", "id", "isActive", "lastName", "password", "phone", "role", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "staff_staffId_key" ON "staff"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "staff_email_key" ON "staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "staff_userId_key" ON "staff"("userId");
