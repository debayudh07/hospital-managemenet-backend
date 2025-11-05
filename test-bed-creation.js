const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBedCreation() {
  try {
    console.log('🔍 Testing bed creation and fetching...');
    
    // Get all wards with their beds
    const wards = await prisma.ward.findMany({
      include: {
        department: true,
        beds: {
          select: {
            id: true,
            bedNumber: true,
            isOccupied: true,
            bedType: true,
            dailyRate: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('\n📊 Wards and their beds:');
    console.log('Total wards found:', wards.length);
    
    wards.forEach((ward, index) => {
      console.log(`\n${index + 1}. Ward: ${ward.name} (${ward.wardNumber})`);
      console.log(`   Type: ${ward.type}`);
      console.log(`   Department: ${ward.department.name}`);
      console.log(`   Total Beds (field): ${ward.totalBeds}`);
      console.log(`   Actual Bed Records: ${ward.beds.length}`);
      
      if (ward.beds.length > 0) {
        console.log('   Bed Details:');
        ward.beds.forEach((bed, bedIndex) => {
          console.log(`     ${bedIndex + 1}. ${bed.bedNumber} - ${bed.bedType} - ₹${bed.dailyRate}/day - ${bed.isOccupied ? 'Occupied' : 'Available'}`);
        });
      } else {
        console.log('   ❌ No bed records found for this ward!');
      }
    });

    // Show statistics
    const totalBedsInRecords = wards.reduce((sum, ward) => sum + ward.beds.length, 0);
    const totalBedsInFields = wards.reduce((sum, ward) => sum + ward.totalBeds, 0);
    
    console.log('\n📈 Statistics:');
    console.log(`Total beds from ward.totalBeds fields: ${totalBedsInFields}`);
    console.log(`Total actual bed records in database: ${totalBedsInRecords}`);
    console.log(`Difference: ${totalBedsInFields - totalBedsInRecords}`);
    
    if (totalBedsInRecords === 0 && totalBedsInFields > 0) {
      console.log('\n❌ Issue Found: Wards exist but no bed records created!');
      console.log('Solution: The createWard function needs to create bed records.');
    } else if (totalBedsInRecords === totalBedsInFields) {
      console.log('\n✅ Perfect: All wards have corresponding bed records!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBedCreation();