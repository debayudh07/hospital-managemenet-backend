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
    "clinicalNotes" TEXT,
    "requestedBy" TEXT,
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
    CONSTRAINT "lab_orders_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lab_orders_collectedBy_fkey" FOREIGN KEY ("collectedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "lab_orders_processedBy_fkey" FOREIGN KEY ("processedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "lab_orders_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_lab_orders" ("clinicalNotes", "collectedAt", "collectedBy", "completedAt", "createdAt", "doctorId", "id", "notes", "orderId", "orderedAt", "patientId", "priority", "processedBy", "processingAt", "reportContent", "reportGenerated", "requestedBy", "reviewedBy", "sampleCondition", "status", "testIds", "totalCost", "updatedAt") SELECT "clinicalNotes", "collectedAt", "collectedBy", "completedAt", "createdAt", "doctorId", "id", "notes", "orderId", "orderedAt", "patientId", "priority", "processedBy", "processingAt", "reportContent", "reportGenerated", "requestedBy", "reviewedBy", "sampleCondition", "status", "testIds", "totalCost", "updatedAt" FROM "lab_orders";
DROP TABLE "lab_orders";
ALTER TABLE "new_lab_orders" RENAME TO "lab_orders";
CREATE UNIQUE INDEX "lab_orders_orderId_key" ON "lab_orders"("orderId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
