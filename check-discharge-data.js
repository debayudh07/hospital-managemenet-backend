const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    const admissionId = 'cmhn0nsuo0002etjscr7jg96t';
    const doctorId = 'cmhajbazr0002etb46ou9e4r7';
    
    console.log('Checking admission...');
    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
      include: { 
        discharge: true,
        patient: { select: { firstName: true, lastName: true } },
        doctor: { select: { firstName: true, lastName: true } }
      }
    });
    
    console.log('Admission:', admission ? 'Found' : 'Not found');
    if (admission) {
      console.log('Patient:', admission.patient.firstName, admission.patient.lastName);
      console.log('Already discharged:', !!admission.discharge);
      if (admission.discharge) {
        console.log('Discharge ID:', admission.discharge.id);
      }
    }
    
    console.log('\nChecking doctor...');
    const doctor = await prisma.doctor.findFirst({
      where: {
        OR: [
          { id: doctorId },
          { doctorId: doctorId }
        ]
      }
    });
    
    console.log('Doctor:', doctor ? 'Found' : 'Not found');
    if (doctor) {
      console.log('Doctor name:', doctor.firstName, doctor.lastName);
    }
    
    // Also check all doctors
    console.log('\nAll doctors:');
    const allDoctors = await prisma.doctor.findMany({
      select: { id: true, doctorId: true, firstName: true, lastName: true }
    });
    console.log('Total doctors:', allDoctors.length);
    allDoctors.forEach(d => {
      console.log(`- ${d.firstName} ${d.lastName} (ID: ${d.id}, DoctorID: ${d.doctorId})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();