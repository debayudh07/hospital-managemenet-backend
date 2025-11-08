/**
 * IPD Billing Test Data Creation Script
 * Creates complete test data for IPD billing system including:
 * - Test patients
 * - Active admissions
 * - Bed assignments
 * - IPD billing records
 * - Insurance claims
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🏥 Creating IPD Billing Test Data...\n');

  try {
    // Step 1: Create test patients
    console.log('👤 Creating test patients...');
    
    const timestamp = Date.now();
    
    const patient1 = await prisma.patient.create({
      data: {
        patientId: `PAT${timestamp}01`,
        firstName: 'Rajesh',
        lastName: 'Kumar',
        dateOfBirth: new Date('1980-05-15'),
        gender: 'MALE',
        phone: '9876543210',
        email: 'rajesh.kumar@example.com',
        address: '123 MG Road',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
        emergencyContactName: 'Sunita Kumar',
        emergencyContactPhone: '9876543211',
        emergencyContactRelationship: 'Spouse',
        bloodGroup: 'O+',
      }
    });

    const patient2 = await prisma.patient.create({
      data: {
        patientId: `PAT${timestamp}02`,
        firstName: 'Priya',
        lastName: 'Sharma',
        dateOfBirth: new Date('1992-08-20'),
        gender: 'FEMALE',
        phone: '9876543212',
        email: 'priya.sharma@example.com',
        address: '456 Park Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        emergencyContactName: 'Rohit Sharma',
        emergencyContactPhone: '9876543213',
        emergencyContactRelationship: 'Husband',
        bloodGroup: 'A+',
        insuranceProvider: 'Star Health Insurance',
        insurancePolicyNumber: 'STAR123456789',
      }
    });

    const patient3 = await prisma.patient.create({
      data: {
        patientId: `PAT${timestamp}03`,
        firstName: 'Amit',
        lastName: 'Patel',
        dateOfBirth: new Date('1975-12-10'),
        gender: 'MALE',
        phone: '9876543214',
        email: 'amit.patel@example.com',
        address: '789 CBD Belapur',
        city: 'Navi Mumbai',
        state: 'Maharashtra',
        zipCode: '400614',
        emergencyContactName: 'Neeta Patel',
        emergencyContactPhone: '9876543215',
        emergencyContactRelationship: 'Wife',
        bloodGroup: 'B+',
        chronicConditions: 'Type 2 Diabetes',
        insuranceProvider: 'HDFC ERGO Health',
        insurancePolicyNumber: 'HDFC987654321',
      }
    });

    console.log(`✅ Created 3 test patients`);

    // Step 2: Get or create departments
    console.log('\n🏢 Setting up departments...');
    
    let generalMedicine = await prisma.department.findFirst({
      where: { name: 'General Medicine' }
    });

    if (!generalMedicine) {
      generalMedicine = await prisma.department.create({
        data: {
          name: 'General Medicine',
          description: 'General medical care and treatment',
          isActive: true
        }
      });
    }

    let cardiology = await prisma.department.findFirst({
      where: { name: 'Cardiology' }
    });

    if (!cardiology) {
      cardiology = await prisma.department.create({
        data: {
          name: 'Cardiology',
          description: 'Heart and cardiovascular care',
          isActive: true
        }
      });
    }

    console.log(`✅ Departments ready`);

    // Step 3: Get or create doctors
    console.log('\n👨‍⚕️ Setting up doctors...');
    
    let doctor1 = await prisma.doctor.findFirst({
      where: { email: 'dr.suresh@hospital.com' }
    });

    if (!doctor1) {
      doctor1 = await prisma.doctor.create({
        data: {
          doctorId: `DOC${timestamp}01`,
          firstName: 'Suresh',
          lastName: 'Reddy',
          specialization: 'General Medicine',
          email: 'dr.suresh@hospital.com',
          phone: '9876540001',
          licenseNumber: `MED${timestamp}123`,
          experience: 15,
          qualification: 'MBBS, MD',
          consultationFee: 500,
          workingHours: JSON.stringify({ monday: '9-5', tuesday: '9-5' }),
          departmentId: generalMedicine.id,
        }
      });
    }

    let doctor2 = await prisma.doctor.findFirst({
      where: { email: 'dr.kavita@hospital.com' }
    });

    if (!doctor2) {
      doctor2 = await prisma.doctor.create({
        data: {
          doctorId: `DOC${timestamp}02`,
          firstName: 'Kavita',
          lastName: 'Mehta',
          specialization: 'Cardiology',
          email: 'dr.kavita@hospital.com',
          phone: '9876540002',
          licenseNumber: `CARD${timestamp}789`,
          experience: 20,
          qualification: 'MBBS, MD, DM Cardiology',
          consultationFee: 1000,
          workingHours: JSON.stringify({ monday: '10-6', tuesday: '10-6' }),
          departmentId: cardiology.id,
        }
      });
    }

    console.log(`✅ Doctors ready`);

    // Step 4: Create wards and beds
    console.log('\n🛏️ Setting up wards and beds...');
    
    let generalWard = await prisma.ward.findFirst({
      where: { name: 'General Ward A' }
    });

    if (!generalWard) {
      generalWard = await prisma.ward.create({
        data: {
          wardNumber: `GW${timestamp}A`,
          name: 'General Ward A',
          type: 'GENERAL',
          departmentId: generalMedicine.id,
          totalBeds: 10,
          availableBeds: 10,
        }
      });

      // Create beds for general ward
      for (let i = 1; i <= 5; i++) {
        await prisma.bed.create({
          data: {
            bedNumber: `GA${i}`,
            wardId: generalWard.id,
            bedType: 'GENERAL',
            isOccupied: false,
            dailyRate: 500,
          }
        });
      }
    }

    let icuWard = await prisma.ward.findFirst({
      where: { name: 'ICU Ward' }
    });

    if (!icuWard) {
      icuWard = await prisma.ward.create({
        data: {
          wardNumber: `ICU${timestamp}`,
          name: 'ICU Ward',
          type: 'ICU',
          departmentId: cardiology.id,
          totalBeds: 5,
          availableBeds: 5,
        }
      });

      // Create ICU beds
      for (let i = 1; i <= 3; i++) {
        await prisma.bed.create({
          data: {
            bedNumber: `ICU${i}`,
            wardId: icuWard.id,
            bedType: 'ICU',
            isOccupied: false,
            dailyRate: 2500,
          }
        });
      }
    }

    console.log(`✅ Wards and beds created`);

    // Step 5: Get available beds
    let generalBed = await prisma.bed.findFirst({
      where: { 
        wardId: generalWard.id,
        isOccupied: false
      }
    });

    // If no available bed, create one
    if (!generalBed) {
      generalBed = await prisma.bed.create({
        data: {
          bedNumber: `GA${timestamp}`,
          wardId: generalWard.id,
          bedType: 'GENERAL',
          isOccupied: false,
          dailyRate: 500,
        }
      });
    }

    let icuBed = await prisma.bed.findFirst({
      where: { 
        wardId: icuWard.id,
        isOccupied: false
      }
    });

    // If no available ICU bed, create one
    if (!icuBed) {
      icuBed = await prisma.bed.create({
        data: {
          bedNumber: `ICU${timestamp}`,
          wardId: icuWard.id,
          bedType: 'ICU',
          isOccupied: false,
          dailyRate: 2500,
        }
      });
    }

    // Step 6: Create admissions
    console.log('\n🏥 Creating admissions...');
    
    const admission1 = await prisma.admission.create({
      data: {
        admissionId: `ADM${Date.now()}01`,
        patientId: patient1.id,
        doctorId: doctor1.id,
        bedId: generalBed.id,
        admissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        admissionTime: '10:30 AM',
        admissionType: 'EMERGENCY',
        status: 'STABLE',
        chiefComplaint: 'Fever and body ache for 3 days',
        provisionalDiagnosis: 'Viral fever',
      }
    });

    // Update bed status
    await prisma.bed.update({
      where: { id: generalBed.id },
      data: { 
        isOccupied: true
      }
    });

    const admission2 = await prisma.admission.create({
      data: {
        admissionId: `ADM${Date.now()}02`,
        patientId: patient2.id,
        doctorId: doctor2.id,
        bedId: icuBed.id,
        admissionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        admissionTime: '02:15 PM',
        admissionType: 'EMERGENCY',
        status: 'CRITICAL',
        chiefComplaint: 'Chest pain and breathing difficulty',
        provisionalDiagnosis: 'Acute coronary syndrome',
      }
    });

    await prisma.bed.update({
      where: { id: icuBed.id },
      data: { 
        isOccupied: true
      }
    });

    // Create a discharged admission for patient3
    // First get a bed for this patient (will be freed after discharge)
    let tempBed = await prisma.bed.findFirst({
      where: {
        wardId: generalWard.id,
        isOccupied: false
      }
    });

    // If no available bed, create one
    if (!tempBed) {
      tempBed = await prisma.bed.create({
        data: {
          bedNumber: `GA${timestamp}D`,
          wardId: generalWard.id,
          bedType: 'GENERAL',
          isOccupied: false,
          dailyRate: 500,
        }
      });
    }

    const admission3 = await prisma.admission.create({
      data: {
        admissionId: `ADM${Date.now()}03`,
        patientId: patient3.id,
        doctorId: doctor1.id,
        bedId: tempBed.id,
        admissionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        admissionTime: '09:00 AM',
        actualDischargeDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        admissionType: 'ELECTIVE',
        status: 'DISCHARGED',
        chiefComplaint: 'Routine check-up and treatment',
        provisionalDiagnosis: 'Diabetes management',
        finalDiagnosis: 'Type 2 Diabetes - Controlled',
      }
    });

    console.log(`✅ Created 3 admissions (2 active, 1 discharged)`);

    // Step 7: Create IPD billing records
    console.log('\n💰 Creating IPD billing records...');
    
    // Bill for admission 1 (pending)
    const bill1 = await prisma.iPDBilling.create({
      data: {
        admissionId: admission1.id,
        billNumber: `BILL${Date.now()}01`,
        bedCharges: 2500.00, // 5 days * 500
        roomCharges: 1000.00,
        nursingCharges: 1500.00,
        doctorFees: 3000.00,
        medicineCharges: 1200.00,
        labCharges: 1500.00,
        radiologyCharges: 1000.00,
        subtotal: 11700.00,
        totalAmount: 11700.00,
        paidAmount: 0.00,
        balanceAmount: 11700.00,
        paymentStatus: 'PENDING',
        notes: 'General ward admission - 5 days treatment',
      }
    });

    // Bill for admission 2 (partially paid)
    const bill2 = await prisma.iPDBilling.create({
      data: {
        admissionId: admission2.id,
        billNumber: `BILL${Date.now()}02`,
        bedCharges: 7500.00, // 3 days * 2500 (ICU)
        roomCharges: 3000.00,
        icuCharges: 5000.00,
        nursingCharges: 4000.00,
        doctorFees: 8000.00,
        medicineCharges: 3500.00,
        labCharges: 4000.00,
        radiologyCharges: 2500.00,
        procedureFees: 15000.00,
        subtotal: 52500.00,
        totalAmount: 52500.00,
        paidAmount: 25000.00,
        balanceAmount: 27500.00,
        paymentStatus: 'PENDING', // Still pending full payment
        paymentMethod: 'CARD',
        paymentDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        transactionId: `TXN${Date.now()}001`,
        notes: 'ICU admission - Cardiac care - Partial advance payment received (₹25,000)',
      }
    });

    // Bill for admission 3 (completed - fully paid)
    const bill3 = await prisma.iPDBilling.create({
      data: {
        admissionId: admission3.id,
        billNumber: `BILL${Date.now()}03`,
        bedCharges: 4000.00,
        roomCharges: 2000.00,
        nursingCharges: 2500.00,
        doctorFees: 5000.00,
        medicineCharges: 3000.00,
        labCharges: 2500.00,
        radiologyCharges: 1500.00,
        subtotal: 20500.00,
        totalAmount: 20500.00,
        paidAmount: 20500.00,
        balanceAmount: 0.00,
        paymentStatus: 'COMPLETED',
        paymentMethod: 'CASH',
        paymentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        transactionId: `TXN${Date.now()}002`,
        notes: 'Discharged patient - Fully settled on discharge',
      }
    });

    console.log(`✅ Created 3 IPD bills (1 pending, 1 partial, 1 completed)`);

    // Step 8: Create insurance claims
    console.log('\n🏥 Creating insurance claims...');
    
    const claim1 = await prisma.insuranceClaim.create({
      data: {
        claimNumber: `CLM${Date.now()}01`,
        admissionId: admission2.id,
        billingId: bill2.id,
        policyNumber: 'STAR123456789',
        insuranceProvider: 'Star Health Insurance',
        claimType: 'CASHLESS',
        claimedAmount: 30000.00,
        status: 'PENDING',
        attachments: JSON.stringify(['policy_copy.pdf', 'medical_reports.pdf']),
        remarks: 'Cardiac emergency claim - ICU charges',
      }
    });

    const claim2 = await prisma.insuranceClaim.create({
      data: {
        claimNumber: `CLM${Date.now()}02`,
        admissionId: admission3.id,
        billingId: bill3.id,
        policyNumber: 'HDFC987654321',
        insuranceProvider: 'HDFC ERGO Health',
        claimType: 'REIMBURSEMENT',
        claimedAmount: 15000.00,
        approvedAmount: 12000.00,
        status: 'APPROVED',
        reviewedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        reviewedBy: 'TPA Manager',
        attachments: JSON.stringify(['policy_copy.pdf', 'discharge_summary.pdf']),
        remarks: 'Diabetes management - Approved with copay',
      }
    });

    console.log(`✅ Created 2 insurance claims (1 pending, 1 approved)`);

    // Summary
    console.log('\n📊 Test Data Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Patients Created: 3`);
    console.log(`   - ${patient1.firstName} ${patient1.lastName} (${patient1.patientId})`);
    console.log(`   - ${patient2.firstName} ${patient2.lastName} (${patient2.patientId})`);
    console.log(`   - ${patient3.firstName} ${patient3.lastName} (${patient3.patientId})`);
    console.log('\n✅ Admissions Created: 3');
    console.log(`   - Admission ${admission1.id}: ${patient1.firstName} - ADMITTED (General Ward)`);
    console.log(`   - Admission ${admission2.id}: ${patient2.firstName} - ADMITTED (ICU)`);
    console.log(`   - Admission ${admission3.id}: ${patient3.firstName} - DISCHARGED`);
    console.log('\n✅ IPD Bills Created: 3');
    console.log(`   - Bill ${bill1.id}: ₹${bill1.totalAmount} (PENDING)`);
    console.log(`   - Bill ${bill2.id}: ₹${bill2.totalAmount} (PARTIAL - ₹${bill2.paidAmount} paid, ₹${bill2.balanceAmount} balance)`);
    console.log(`   - Bill ${bill3.id}: ₹${bill3.totalAmount} (COMPLETED)`);
    console.log('\n✅ Insurance Claims Created: 2');
    console.log(`   - Claim ${claim1.id}: ₹${claim1.claimAmount} (PENDING)`);
    console.log(`   - Claim ${claim2.id}: ₹${claim2.claimAmount} (APPROVED - ₹${claim2.approvedAmount})`);
    console.log('='.repeat(60));
    console.log('\n🎉 Test data creation completed successfully!');
    console.log('\n📝 You can now:');
    console.log('   1. View IPD bills in the Billing page');
    console.log('   2. Record payments for pending/partial bills');
    console.log('   3. Process insurance claims');
    console.log('   4. Create new IPD bills for active admissions');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
