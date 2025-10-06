/*
  Warnings:

  - You are about to drop the column `bloodType` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyContact` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `insurance` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `medicalHistory` on the `patients` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT NOT NULL,
    "userId" TEXT,
    CONSTRAINT "patients_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "patients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_patients" ("address", "allergies", "createdAt", "createdById", "dateOfBirth", "email", "firstName", "gender", "id", "isActive", "lastName", "patientId", "phone", "updatedAt", "userId") SELECT "address", "allergies", "createdAt", "createdById", "dateOfBirth", "email", "firstName", "gender", "id", "isActive", "lastName", "patientId", "phone", "updatedAt", "userId" FROM "patients";
DROP TABLE "patients";
ALTER TABLE "new_patients" RENAME TO "patients";
CREATE UNIQUE INDEX "patients_patientId_key" ON "patients"("patientId");
CREATE UNIQUE INDEX "patients_userId_key" ON "patients"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
