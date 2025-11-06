// Sample script to populate wards and beds data for testing
import { PrismaClient, WardType } from '@prisma/client';

const prisma = new PrismaClient();

async function createSampleWardsAndBeds() {
  try {
    // Check if departments exist first
    const departments = await prisma.department.findMany();
    
    if (departments.length === 0) {
      console.log('Creating sample departments...');
      await prisma.department.createMany({
        data: [
          { name: 'General Medicine', description: 'Internal medicine and general care' },
          { name: 'Surgery', description: 'Surgical procedures and post-operative care' },
          { name: 'Cardiology', description: 'Heart and cardiovascular care' },
          { name: 'Emergency', description: 'Emergency medical services' },
        ],
      });
    }

    const dept = await prisma.department.findFirst({ where: { name: 'General Medicine' } });
    const surgeryDept = await prisma.department.findFirst({ where: { name: 'Surgery' } });
    const cardioDept = await prisma.department.findFirst({ where: { name: 'Cardiology' } });

    // Create sample wards
    const wards = [
      {
        wardNumber: 'W001',
        name: 'General Ward A',
        type: WardType.GENERAL,
        departmentId: dept?.id || departments[0]?.id,
        totalBeds: 20,
        floor: 'Ground Floor',
        description: 'General medical ward for routine patients',
      },
      {
        wardNumber: 'W002', 
        name: 'ICU Ward',
        type: WardType.ICU,
        departmentId: cardioDept?.id || departments[0]?.id,
        totalBeds: 10,
        floor: 'First Floor',
        description: 'Intensive care unit for critical patients',
      },
      {
        wardNumber: 'W003',
        name: 'NICU',
        type: WardType.NICU,
        departmentId: dept?.id || departments[0]?.id, 
        totalBeds: 8,
        floor: 'Second Floor',
        description: 'Neonatal intensive care unit',
      },
    ];

    for (const wardData of wards) {
      // Check if ward already exists
      const existingWard = await prisma.ward.findUnique({
        where: { wardNumber: wardData.wardNumber },
      });

      if (!existingWard) {
        console.log(`Creating ward: ${wardData.name}`);
        
        const ward = await prisma.ward.create({
          data: {
            ...wardData,
            availableBeds: wardData.totalBeds,
            isActive: true,
          },
        });

        // Create beds for this ward
        for (let i = 1; i <= wardData.totalBeds; i++) {
          const bedNumber = `${wardData.wardNumber}-B${String(i).padStart(3, '0')}`;
          
          await prisma.bed.create({
            data: {
              bedNumber,
              wardId: ward.id,
              isOccupied: false,
              bedType: wardData.type === 'ICU' ? 'ICU' : 'General',
              dailyRate: wardData.type === 'ICU' ? 2000 : wardData.type === 'NICU' ? 1500 : 800,
              isActive: true,
            },
          });
        }

        console.log(`Created ${wardData.totalBeds} beds for ward ${wardData.name}`);
      } else {
        console.log(`Ward ${wardData.name} already exists, skipping...`);
      }
    }

    console.log('Sample wards and beds created successfully!');
  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function if called directly
if (require.main === module) {
  createSampleWardsAndBeds();
}

export { createSampleWardsAndBeds };