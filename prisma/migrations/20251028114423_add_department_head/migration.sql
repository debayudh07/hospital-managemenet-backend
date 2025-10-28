/*
  Warnings:

  - You are about to drop the column `head` on the `departments` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_departments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "headDoctorId" TEXT,
    "location" TEXT,
    "established" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "departments_headDoctorId_fkey" FOREIGN KEY ("headDoctorId") REFERENCES "doctors" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_departments" ("createdAt", "description", "id", "isActive", "name", "updatedAt") SELECT "createdAt", "description", "id", "isActive", "name", "updatedAt" FROM "departments";
DROP TABLE "departments";
ALTER TABLE "new_departments" RENAME TO "departments";
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
