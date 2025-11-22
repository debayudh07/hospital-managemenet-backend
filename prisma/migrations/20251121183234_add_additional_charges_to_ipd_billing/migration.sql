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
    "additionalCharges" REAL NOT NULL DEFAULT 0,
    "additionalChargesList" TEXT,
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
INSERT INTO "new_ipd_billing" ("admissionId", "ambulanceCharges", "balanceAmount", "bedCharges", "billNumber", "consultationFees", "createdAt", "dayCount", "depositAmount", "discount", "doctorFees", "equipmentCharges", "icuCharges", "id", "injectionCharges", "insuranceApproved", "insuranceClaimed", "insurancePending", "labCharges", "lastChargeDate", "medicineCharges", "miscellaneousCharges", "notes", "nursingCharges", "paidAmount", "pathologyCharges", "paymentDate", "paymentMethod", "paymentStatus", "procedureFees", "radiologyCharges", "refundAmount", "roomCharges", "subtotal", "surgeryFees", "tax", "totalAmount", "transactionId", "updatedAt") SELECT "admissionId", "ambulanceCharges", "balanceAmount", "bedCharges", "billNumber", "consultationFees", "createdAt", "dayCount", "depositAmount", "discount", "doctorFees", "equipmentCharges", "icuCharges", "id", "injectionCharges", "insuranceApproved", "insuranceClaimed", "insurancePending", "labCharges", "lastChargeDate", "medicineCharges", "miscellaneousCharges", "notes", "nursingCharges", "paidAmount", "pathologyCharges", "paymentDate", "paymentMethod", "paymentStatus", "procedureFees", "radiologyCharges", "refundAmount", "roomCharges", "subtotal", "surgeryFees", "tax", "totalAmount", "transactionId", "updatedAt" FROM "ipd_billing";
DROP TABLE "ipd_billing";
ALTER TABLE "new_ipd_billing" RENAME TO "ipd_billing";
CREATE UNIQUE INDEX "ipd_billing_admissionId_key" ON "ipd_billing"("admissionId");
CREATE UNIQUE INDEX "ipd_billing_billNumber_key" ON "ipd_billing"("billNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
