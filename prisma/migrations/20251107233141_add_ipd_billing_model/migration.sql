/*
  Warnings:

  - You are about to drop the `advance_applications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `advance_payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `billing_payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `insurance_claims` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ipd_billing_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ipd_daily_charges` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `opd_billing_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `billDate` on the `ipd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `billId` on the `ipd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `doctorId` on the `ipd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `ipd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `finalizedAt` on the `ipd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `insuranceAmount` on the `ipd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `insuranceClaimId` on the `ipd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `isFinalized` on the `ipd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `isInterim` on the `ipd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `otCharges` on the `ipd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `otherCharges` on the `ipd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `patientAmount` on the `ipd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `ipd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `pharmacyCharges` on the `ipd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `procedureCharges` on the `ipd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `totalBedCharges` on the `ipd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `totalNursingCharges` on the `ipd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `totalRoomCharges` on the `ipd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `billDate` on the `opd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `billId` on the `opd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `doctorId` on the `opd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `opd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `insuranceAmount` on the `opd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `insuranceClaimId` on the `opd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `labCharges` on the `opd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `otherCharges` on the `opd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `paidAt` on the `opd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `patientAmount` on the `opd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `opd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `pharmacyCharges` on the `opd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal` on the `opd_billing` table. All the data in the column will be lost.
  - Added the required column `billNumber` to the `ipd_billing` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "advance_payments_receiptId_key";

-- DropIndex
DROP INDEX "billing_payments_paymentId_key";

-- DropIndex
DROP INDEX "insurance_claims_claimId_key";

-- DropIndex
DROP INDEX "ipd_daily_charges_ipdBillingId_chargeDate_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "advance_applications";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "advance_payments";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "billing_payments";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "insurance_claims";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ipd_billing_items";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ipd_daily_charges";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "opd_billing_items";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ipd_billing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "admissionId" TEXT NOT NULL,
    "billNumber" TEXT NOT NULL,
    "bedCharges" REAL NOT NULL DEFAULT 0,
    "roomCharges" REAL NOT NULL DEFAULT 0,
    "icuCharges" REAL NOT NULL DEFAULT 0,
    "nursingCharges" REAL NOT NULL DEFAULT 0,
    "doctorFees" REAL NOT NULL DEFAULT 0,
    "consultationFees" REAL NOT NULL DEFAULT 0,
    "procedureFees" REAL NOT NULL DEFAULT 0,
    "surgeryFees" REAL NOT NULL DEFAULT 0,
    "labCharges" REAL NOT NULL DEFAULT 0,
    "radiologyCharges" REAL NOT NULL DEFAULT 0,
    "pathologyCharges" REAL NOT NULL DEFAULT 0,
    "medicineCharges" REAL NOT NULL DEFAULT 0,
    "injectionCharges" REAL NOT NULL DEFAULT 0,
    "equipmentCharges" REAL NOT NULL DEFAULT 0,
    "miscellaneousCharges" REAL NOT NULL DEFAULT 0,
    "ambulanceCharges" REAL NOT NULL DEFAULT 0,
    "subtotal" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    "tax" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "paidAmount" REAL NOT NULL DEFAULT 0,
    "balanceAmount" REAL NOT NULL DEFAULT 0,
    "insuranceClaimed" REAL NOT NULL DEFAULT 0,
    "insuranceApproved" REAL NOT NULL DEFAULT 0,
    "insurancePending" REAL NOT NULL DEFAULT 0,
    "depositAmount" REAL NOT NULL DEFAULT 0,
    "refundAmount" REAL NOT NULL DEFAULT 0,
    "transactionId" TEXT,
    "paymentDate" DATETIME,
    "notes" TEXT,
    "lastChargeDate" DATETIME,
    "dayCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ipd_billing_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "admissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ipd_billing" ("admissionId", "balanceAmount", "consultationFees", "createdAt", "discount", "equipmentCharges", "id", "labCharges", "lastChargeDate", "notes", "paidAmount", "paymentStatus", "subtotal", "tax", "totalAmount", "updatedAt") SELECT "admissionId", "balanceAmount", "consultationFees", "createdAt", "discount", "equipmentCharges", "id", "labCharges", "lastChargeDate", "notes", "paidAmount", "paymentStatus", "subtotal", "tax", "totalAmount", "updatedAt" FROM "ipd_billing";
DROP TABLE "ipd_billing";
ALTER TABLE "new_ipd_billing" RENAME TO "ipd_billing";
CREATE UNIQUE INDEX "ipd_billing_admissionId_key" ON "ipd_billing"("admissionId");
CREATE UNIQUE INDEX "ipd_billing_billNumber_key" ON "ipd_billing"("billNumber");
CREATE TABLE "new_opd_billing" (
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
INSERT INTO "new_opd_billing" ("additionalCharges", "balanceAmount", "consultationFee", "createdAt", "discount", "id", "notes", "opdVisitId", "paidAmount", "paymentMethod", "paymentStatus", "tax", "totalAmount", "updatedAt") SELECT "additionalCharges", "balanceAmount", "consultationFee", "createdAt", "discount", "id", "notes", "opdVisitId", "paidAmount", "paymentMethod", "paymentStatus", "tax", "totalAmount", "updatedAt" FROM "opd_billing";
DROP TABLE "opd_billing";
ALTER TABLE "new_opd_billing" RENAME TO "opd_billing";
CREATE UNIQUE INDEX "opd_billing_opdVisitId_key" ON "opd_billing"("opdVisitId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
