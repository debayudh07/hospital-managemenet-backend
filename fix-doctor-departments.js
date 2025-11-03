const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDoctorDepartments() {
  console.log('🔧 Starting to fix doctor-department relationships...');

  try {
    // Get all doctors that have a departmentId but no junction table entries
    const doctors = await prisma.doctor.findMany({
      where: {
        departmentId: {
          not: null,
        },
      },
      include: {
        departments: true,
        primaryDepartment: true,
      },
    });

    console.log(`📊 Found ${doctors.length} doctors with department assignments`);

    let fixedCount = 0;

    for (const doctor of doctors) {
      // Check if junction table entry already exists
      const existingRelation = await prisma.doctorDepartment.findFirst({
        where: {
          doctorId: doctor.id,
          departmentId: doctor.departmentId,
        },
      });

      if (!existingRelation) {
        console.log(`🔗 Creating department relationship for Dr. ${doctor.firstName} ${doctor.lastName} -> ${doctor.primaryDepartment?.name || 'Unknown Department'}`);
        
        await prisma.doctorDepartment.create({
          data: {
            doctorId: doctor.id,
            departmentId: doctor.departmentId,
          },
        });
        
        fixedCount++;
      } else {
        console.log(`✅ Dr. ${doctor.firstName} ${doctor.lastName} already has junction table entry`);
      }
    }

    console.log(`🎉 Fixed ${fixedCount} doctor-department relationships`);

    // Verify the fix by checking one doctor
    if (doctors.length > 0) {
      const sampleDoctor = doctors[0];
      const verifyRelations = await prisma.doctor.findUnique({
        where: { id: sampleDoctor.id },
        include: {
          departments: {
            include: {
              department: true,
            },
          },
        },
      });

      console.log(`🔍 Verification - Dr. ${sampleDoctor.firstName} now has ${verifyRelations.departments.length} department relations`);
    }

  } catch (error) {
    console.error('❌ Error fixing doctor departments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDoctorDepartments();