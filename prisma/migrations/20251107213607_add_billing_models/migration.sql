/*
  Warnings:

  - You are about to drop the column `paymentDate` on the `opd_billing` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `opd_billing` table. All the data in the column will be lost.
  - Added the required column `billId` to the `opd_billing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doctorId` to the `opd_billing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientAmount` to the `opd_billing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientId` to the `opd_billing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `opd_billing` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "opd_billing_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "opdBillingId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" REAL NOT NULL,
    "discount" REAL NOT NULL DEFAULT 0,
    "totalPrice" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "opd_billing_items_opdBillingId_fkey" FOREIGN KEY ("opdBillingId") REFERENCES "opd_billing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ipd_billing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "billId" TEXT NOT NULL,
    "admissionId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "totalBedCharges" REAL NOT NULL DEFAULT 0,
    "totalRoomCharges" REAL NOT NULL DEFAULT 0,
    "totalNursingCharges" REAL NOT NULL DEFAULT 0,
    "consultationFees" REAL NOT NULL DEFAULT 0,
    "procedureCharges" REAL NOT NULL DEFAULT 0,
    "otCharges" REAL NOT NULL DEFAULT 0,
    "labCharges" REAL NOT NULL DEFAULT 0,
    "pharmacyCharges" REAL NOT NULL DEFAULT 0,
    "equipmentCharges" REAL NOT NULL DEFAULT 0,
    "otherCharges" REAL NOT NULL DEFAULT 0,
    "subtotal" REAL NOT NULL,
    "discount" REAL NOT NULL DEFAULT 0,
    "tax" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "insuranceClaimId" TEXT,
    "insuranceAmount" REAL NOT NULL DEFAULT 0,
    "patientAmount" REAL NOT NULL,
    "paidAmount" REAL NOT NULL DEFAULT 0,
    "balanceAmount" REAL NOT NULL DEFAULT 0,
    "billDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME,
    "finalizedAt" DATETIME,
    "lastChargeDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isInterim" BOOLEAN NOT NULL DEFAULT true,
    "isFinalized" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ipd_billing_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "admissions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ipd_billing_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ipd_billing_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ipd_billing_insuranceClaimId_fkey" FOREIGN KEY ("insuranceClaimId") REFERENCES "insurance_claims" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ipd_billing_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ipdBillingId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" REAL NOT NULL,
    "discount" REAL NOT NULL DEFAULT 0,
    "totalPrice" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ipd_billing_items_ipdBillingId_fkey" FOREIGN KEY ("ipdBillingId") REFERENCES "ipd_billing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ipd_daily_charges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ipdBillingId" TEXT NOT NULL,
    "chargeDate" DATETIME NOT NULL,
    "bedCharge" REAL NOT NULL DEFAULT 0,
    "roomCharge" REAL NOT NULL DEFAULT 0,
    "nursingCharge" REAL NOT NULL DEFAULT 0,
    "totalCharge" REAL NOT NULL,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedBy" TEXT NOT NULL DEFAULT 'SYSTEM',
    "notes" TEXT,
    CONSTRAINT "ipd_daily_charges_ipdBillingId_fkey" FOREIGN KEY ("ipdBillingId") REFERENCES "ipd_billing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "insurance_claims" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "claimId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "insuranceProvider" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "tpaName" TEXT,
    "claimedAmount" REAL NOT NULL,
    "approvedAmount" REAL,
    "rejectedAmount" REAL,
    "deductible" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    "settledAt" DATETIME,
    "rejectionReason" TEXT,
    "notes" TEXT,
    "documents" TEXT,
    "autoApply" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "insurance_claims_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "advance_payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "receiptId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "appliedAmount" REAL NOT NULL DEFAULT 0,
    "balanceAmount" REAL NOT NULL,
    "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedAt" DATETIME,
    "notes" TEXT,
    CONSTRAINT "advance_payments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "advance_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "advancePaymentId" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "billType" TEXT NOT NULL,
    "appliedAmount" REAL NOT NULL,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "advance_applications_advancePaymentId_fkey" FOREIGN KEY ("advancePaymentId") REFERENCES "advance_payments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "billing_payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paymentId" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "billType" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "transactionId" TEXT,
    "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    CONSTRAINT "billing_payments_billId_fkey" FOREIGN KEY ("billId") REFERENCES "opd_billing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "billing_payments_billId_fkey" FOREIGN KEY ("billId") REFERENCES "ipd_billing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_opd_billing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "billId" TEXT NOT NULL,
    "opdVisitId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "consultationFee" REAL NOT NULL,
    "additionalCharges" REAL NOT NULL DEFAULT 0,
    "labCharges" REAL NOT NULL DEFAULT 0,
    "pharmacyCharges" REAL NOT NULL DEFAULT 0,
    "otherCharges" REAL NOT NULL DEFAULT 0,
    "subtotal" REAL NOT NULL,
    "discount" REAL NOT NULL DEFAULT 0,
    "tax" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "paidAmount" REAL NOT NULL DEFAULT 0,
    "balanceAmount" REAL NOT NULL DEFAULT 0,
    "insuranceClaimId" TEXT,
    "insuranceAmount" REAL NOT NULL DEFAULT 0,
    "patientAmount" REAL NOT NULL,
    "billDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME,
    "paidAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "opd_billing_opdVisitId_fkey" FOREIGN KEY ("opdVisitId") REFERENCES "opd_visits" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "opd_billing_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "opd_billing_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "opd_billing_insuranceClaimId_fkey" FOREIGN KEY ("insuranceClaimId") REFERENCES "insurance_claims" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_opd_billing" ("additionalCharges", "balanceAmount", "consultationFee", "createdAt", "discount", "id", "notes", "opdVisitId", "paidAmount", "paymentMethod", "paymentStatus", "tax", "totalAmount", "updatedAt") SELECT "additionalCharges", "balanceAmount", "consultationFee", "createdAt", "discount", "id", "notes", "opdVisitId", "paidAmount", "paymentMethod", "paymentStatus", "tax", "totalAmount", "updatedAt" FROM "opd_billing";
DROP TABLE "opd_billing";
ALTER TABLE "new_opd_billing" RENAME TO "opd_billing";
CREATE UNIQUE INDEX "opd_billing_billId_key" ON "opd_billing"("billId");
CREATE UNIQUE INDEX "opd_billing_opdVisitId_key" ON "opd_billing"("opdVisitId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ipd_billing_billId_key" ON "ipd_billing"("billId");

-- CreateIndex
CREATE UNIQUE INDEX "ipd_billing_admissionId_key" ON "ipd_billing"("admissionId");

-- CreateIndex
CREATE UNIQUE INDEX "ipd_daily_charges_ipdBillingId_chargeDate_key" ON "ipd_daily_charges"("ipdBillingId", "chargeDate");

-- CreateIndex
CREATE UNIQUE INDEX "insurance_claims_claimId_key" ON "insurance_claims"("claimId");

-- CreateIndex
CREATE UNIQUE INDEX "advance_payments_receiptId_key" ON "advance_payments"("receiptId");

-- CreateIndex
CREATE UNIQUE INDEX "billing_payments_paymentId_key" ON "billing_payments"("paymentId");
