-- Manual migration to handle existing OPD billing data

-- First, backup existing data
CREATE TABLE opd_billing_backup AS SELECT * FROM opd_billing;

-- Drop existing OPD billing table
DROP TABLE opd_billing;

-- Now apply the new schema migration
-- Run: npx prisma migrate deploy

-- After migration, restore data with new fields
INSERT INTO opd_billing (
  id, opdVisitId, consultationFee, additionalCharges, discount, tax, totalAmount,
  paymentStatus, paymentMethod, paidAmount, balanceAmount, notes, createdAt, updatedAt,
  billId, patientId, doctorId, subtotal, patientAmount, labCharges, pharmacyCharges, otherCharges
)
SELECT 
  id, opdVisitId, consultationFee, additionalCharges, discount, tax, totalAmount,
  paymentStatus, paymentMethod, paidAmount, balanceAmount, notes, createdAt, updatedAt,
  'OPD' || substr('000000' || ROW_NUMBER() OVER (ORDER BY createdAt), -6) as billId,
  (SELECT patientId FROM opd_visits WHERE opd_visits.id = opd_billing_backup.opdVisitId) as patientId,
  (SELECT doctorId FROM opd_visits WHERE opd_visits.id = opd_billing_backup.opdVisitId) as doctorId,
  consultationFee + additionalCharges as subtotal,
  totalAmount as patientAmount,
  0 as labCharges,
  0 as pharmacyCharges,
  0 as otherCharges
FROM opd_billing_backup;