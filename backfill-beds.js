const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function backfillBeds() {
  try {
    console.log('🔄 Backfilling bed records for existing wards...');
    
    // Get wards without bed records
    const wards = await prisma.ward.findMany({
      include: {
        beds: true,
      },
    });

    console.log(`Found ${wards.length} wards to process`);

    for (const ward of wards) {
      const existingBeds = ward.beds.length;
      const expectedBeds = ward.totalBeds;

      console.log(`\n📝 Ward: ${ward.name} (${ward.wardNumber})`);
      console.log(`   Expected beds: ${expectedBeds}, Existing beds: ${existingBeds}`);

      if (existingBeds < expectedBeds) {
        const bedsToCreate = expectedBeds - existingBeds;
        console.log(`   Creating ${bedsToCreate} bed records...`);

        for (let i = existingBeds + 1; i <= expectedBeds; i++) {
          const bedNumber = `${ward.wardNumber}-B${String(i).padStart(3, '0')}`;
          
          // Check if bed already exists
          const existingBed = await prisma.bed.findUnique({
            where: { bedNumber },
          });

          if (!existingBed) {
            const bed = await prisma.bed.create({
              data: {
                bedNumber,
                wardId: ward.id,
                isOccupied: false,
                bedType: ward.type === 'ICU' ? 'ICU' : 'General',
                dailyRate: ward.type === 'ICU' ? 5000 : 2000,
                isActive: true,
              },
            });
            console.log(`     ✅ Created bed: ${bed.bedNumber}`);
          } else {
            console.log(`     ⚠️  Bed already exists: ${bedNumber}`);
          }
        }
      } else {
        console.log(`   ✅ Ward already has correct number of beds`);
      }
    }

    console.log('\n🎉 Backfill completed!');
    
    // Verify the results
    console.log('\n📊 Verification - Checking all wards again:');
    const updatedWards = await prisma.ward.findMany({
      include: {
        department: true,
        beds: {
          select: {
            id: true,
            bedNumber: true,
            isOccupied: true,
            bedType: true,
            dailyRate: true,
          },
        },
      },
    });

    updatedWards.forEach((ward, index) => {
      console.log(`${index + 1}. ${ward.name}: ${ward.beds.length}/${ward.totalBeds} beds`);
      ward.beds.forEach(bed => {
        console.log(`   - ${bed.bedNumber} (${bed.bedType}, ₹${bed.dailyRate}/day)`);
      });
    });

  } catch (error) {
    console.error('❌ Error during backfill:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backfillBeds();