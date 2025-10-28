/*
  Warnings:

  - You are about to drop the column `department` on the `doctors` table. All the data in the column will be lost.

*/
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
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "emergencyContactRelationship" TEXT,
    "bloodGroup" TEXT,
    "joiningDate" DATETIME,
    "departmentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT,
    CONSTRAINT "doctors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "doctors_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_doctors" ("address", "avatar", "bloodGroup", "city", "consultationFee", "createdAt", "dateOfBirth", "doctorId", "email", "emergencyContactName", "emergencyContactPhone", "emergencyContactRelationship", "experience", "firstName", "gender", "id", "isActive", "isAvailable", "joiningDate", "lastName", "licenseNumber", "notes", "phone", "qualification", "specialization", "state", "updatedAt", "userId", "workingHours", "zipCode") SELECT "address", "avatar", "bloodGroup", "city", "consultationFee", "createdAt", "dateOfBirth", "doctorId", "email", "emergencyContactName", "emergencyContactPhone", "emergencyContactRelationship", "experience", "firstName", "gender", "id", "isActive", "isAvailable", "joiningDate", "lastName", "licenseNumber", "notes", "phone", "qualification", "specialization", "state", "updatedAt", "userId", "workingHours", "zipCode" FROM "doctors";
DROP TABLE "doctors";
ALTER TABLE "new_doctors" RENAME TO "doctors";
CREATE UNIQUE INDEX "doctors_doctorId_key" ON "doctors"("doctorId");
CREATE UNIQUE INDEX "doctors_email_key" ON "doctors"("email");
CREATE UNIQUE INDEX "doctors_licenseNumber_key" ON "doctors"("licenseNumber");
CREATE UNIQUE INDEX "doctors_userId_key" ON "doctors"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
