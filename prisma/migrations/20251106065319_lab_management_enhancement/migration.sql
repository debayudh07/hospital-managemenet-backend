/*
  Warnings:

  - You are about to drop the column `reviewedBy` on the `lab_results` table. All the data in the column will be lost.
  - Added the required column `technician` to the `lab_results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `department` to the `lab_tests` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "lab_departments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "headTechnician" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "lab_departments_headTechnician_fkey" FOREIGN KEY ("headTechnician") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lab_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "testIds" TEXT NOT NULL,
    "totalCost" REAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "lab_workflows" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    CONSTRAINT "lab_workflows_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "lab_orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lab_workflows_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_LabTemplateToLabTest" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_LabTemplateToLabTest_A_fkey" FOREIGN KEY ("A") REFERENCES "lab_templates" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_LabTemplateToLabTest_B_fkey" FOREIGN KEY ("B") REFERENCES "lab_tests" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_lab_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "testIds" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "notes" TEXT,
    "orderedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "collectedAt" DATETIME,
    "processingAt" DATETIME,
    "completedAt" DATETIME,
    "totalCost" REAL,
    "collectedBy" TEXT,
    "processedBy" TEXT,
    "reviewedBy" TEXT,
    "sampleCondition" TEXT,
    "reportGenerated" BOOLEAN NOT NULL DEFAULT false,
    "reportContent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "lab_orders_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lab_orders_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lab_orders_collectedBy_fkey" FOREIGN KEY ("collectedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "lab_orders_processedBy_fkey" FOREIGN KEY ("processedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "lab_orders_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_lab_orders" ("completedAt", "createdAt", "doctorId", "id", "notes", "orderId", "orderedAt", "patientId", "priority", "status", "testIds", "updatedAt") SELECT "completedAt", "createdAt", "doctorId", "id", "notes", "orderId", "orderedAt", "patientId", "priority", "status", "testIds", "updatedAt" FROM "lab_orders";
DROP TABLE "lab_orders";
ALTER TABLE "new_lab_orders" RENAME TO "lab_orders";
CREATE UNIQUE INDEX "lab_orders_orderId_key" ON "lab_orders"("orderId");
CREATE TABLE "new_lab_results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT,
    "normalRange" TEXT,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "technician" TEXT NOT NULL,
    "verifiedBy" TEXT,
    "verifiedAt" DATETIME,
    "interpretation" TEXT,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "method" TEXT,
    "instrument" TEXT,
    "testedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "lab_results_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "lab_orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lab_results_testId_fkey" FOREIGN KEY ("testId") REFERENCES "lab_tests" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lab_results_technician_fkey" FOREIGN KEY ("technician") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lab_results_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_lab_results" ("createdAt", "id", "normalRange", "notes", "orderId", "status", "testId", "testedAt", "unit", "updatedAt", "value") SELECT "createdAt", "id", "normalRange", "notes", "orderId", "status", "testId", "testedAt", "unit", "updatedAt", "value" FROM "lab_results";
DROP TABLE "lab_results";
ALTER TABLE "new_lab_results" RENAME TO "lab_results";
CREATE TABLE "new_lab_tests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "normalRange" TEXT,
    "unit" TEXT,
    "description" TEXT,
    "duration" TEXT,
    "methodology" TEXT,
    "sampleType" TEXT,
    "sampleVolume" TEXT,
    "fasting" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "lab_tests_department_fkey" FOREIGN KEY ("department") REFERENCES "lab_departments" ("code") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_lab_tests" ("category", "code", "createdAt", "description", "id", "isActive", "name", "normalRange", "price", "unit", "updatedAt") SELECT "category", "code", "createdAt", "description", "id", "isActive", "name", "normalRange", "price", "unit", "updatedAt" FROM "lab_tests";
DROP TABLE "lab_tests";
ALTER TABLE "new_lab_tests" RENAME TO "lab_tests";
CREATE UNIQUE INDEX "lab_tests_code_key" ON "lab_tests"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "lab_departments_name_key" ON "lab_departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "lab_departments_code_key" ON "lab_departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "_LabTemplateToLabTest_AB_unique" ON "_LabTemplateToLabTest"("A", "B");

-- CreateIndex
CREATE INDEX "_LabTemplateToLabTest_B_index" ON "_LabTemplateToLabTest"("B");
