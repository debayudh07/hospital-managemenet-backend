const { PrismaClient } = require('@prisma/client');

async function checkDoctors() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Checking doctors...');
    
    const doctors = await prisma.doctor.findMany({
      select: {
        id: true,
        doctorId: true,
        firstName: true,
        lastName: true,
        specialization: true,
        isActive: true
      }
    });
    
    console.log(`📊 Found ${doctors.length} doctors:`);
    
    if (doctors.length === 0) {
      console.log('❌ No doctors found in database');
      console.log('💡 You may need to create doctors first');
    } else {
      doctors.forEach(doctor => {
        console.log(`  - Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.doctorId})`);
        console.log(`    ID: ${doctor.id} | Specialization: ${doctor.specialization} | Active: ${doctor.isActive}`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDoctors();