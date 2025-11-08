const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDischarges() {
  try {
    console.log('🔍 Checking discharge records...\n');

    // Count total discharges
    const dischargeCount = await prisma.discharge.count();
    console.log(`📊 Total discharge records: ${dischargeCount}\n`);

    if (dischargeCount === 0) {
      console.log('❌ No discharge records found. Let\'s check admissions...\n');
      
      // Check for admitted patients
      const admissions = await prisma.admission.findMany({
        where: {
          status: {
            in: ['ADMITTED', 'STABLE', 'CRITICAL']
          }
        },
        include: {
          patient: true,
          doctor: true,
          bed: {
            include: {
              ward: true
            }
          }
        },
        take: 5
      });

      console.log(`📋 Active admissions: ${admissions.length}`);
      
      if (admissions.length > 0) {
        console.log('\n✅ Creating sample discharge record for testing...\n');
        
        const admission = admissions[0];
        
        // Create a discharge record
        const discharge = await prisma.discharge.create({
          data: {
            admissionId: admission.id,
            doctorId: admission.doctorId,
            dischargeDate: new Date(),
            dischargeTime: new Date().toTimeString().slice(0, 5),
            dischargeType: 'Normal',
            finalDiagnosis: 'Patient recovered successfully',
            treatmentSummary: 'Patient was treated for initial diagnosis. All vitals are normal. Patient is stable and ready for discharge.',
            conditionAtDischarge: 'Stable, no complications',
            followUpInstructions: 'Follow up after 1 week. Continue prescribed medications. Rest adequately.',
            followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
            restrictions: 'Avoid strenuous activities for 2 weeks',
            notes: 'Patient and family counseled about post-discharge care'
          },
          include: {
            admission: {
              include: {
                patient: true,
                doctor: true,
                bed: {
                  include: {
                    ward: true
                  }
                }
              }
            },
            doctor: true
          }
        });

        // Update admission status
        await prisma.admission.update({
          where: { id: admission.id },
          data: {
            status: 'DISCHARGED',
            actualDischargeDate: new Date()
          }
        });

        // Free up the bed
        await prisma.bed.update({
          where: { id: admission.bedId },
          data: { isOccupied: false }
        });

        // Update ward available beds
        await prisma.ward.update({
          where: { id: admission.bed.wardId },
          data: { availableBeds: { increment: 1 } }
        });

        console.log('✅ Sample discharge created successfully!');
        console.log(`\nDischarge ID: ${discharge.id}`);
        console.log(`Patient: ${discharge.admission.patient.firstName} ${discharge.admission.patient.lastName}`);
        console.log(`Ward: ${discharge.admission.bed.ward.name}`);
        console.log(`Admission ID: ${discharge.admission.admissionId}`);
      } else {
        console.log('\n❌ No active admissions found. Cannot create discharge record.');
        console.log('💡 Please create some test admissions first using create-ipd-test-data.js');
      }
    } else {
      // Fetch and display existing discharges
      const discharges = await prisma.discharge.findMany({
        include: {
          admission: {
            include: {
              patient: true,
              doctor: true,
              bed: {
                include: {
                  ward: true
                }
              }
            }
          },
          doctor: true,
          medications: true
        },
        orderBy: {
          dischargeDate: 'desc'
        },
        take: 10
      });

      console.log('📋 Recent Discharge Records:\n');
      discharges.forEach((discharge, index) => {
        console.log(`${index + 1}. ${discharge.admission.patient.firstName} ${discharge.admission.patient.lastName}`);
        console.log(`   Discharge ID: ${discharge.id}`);
        console.log(`   Admission ID: ${discharge.admission.admissionId}`);
        console.log(`   Ward: ${discharge.admission.bed.ward.name}`);
        console.log(`   Discharge Date: ${discharge.dischargeDate.toISOString()}`);
        console.log(`   Final Diagnosis: ${discharge.finalDiagnosis}`);
        console.log(`   Medications: ${discharge.medications?.length || 0}`);
        console.log('');
      });
    }

    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testDischarges();
