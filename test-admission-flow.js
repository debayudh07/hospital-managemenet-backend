const axios = require('axios');

async function testAdmissionFormFlow() {
  try {
    console.log('🏥 Testing Admission Form Data Flow');
    console.log('='.repeat(50));

    // Login
    const loginResponse = await axios.post('http://localhost:5000/auth/login', {
      email: 'debayudh@gmail.com',
      password: 'Debayudh@04'
    });
    
    const token = loginResponse.data.accessToken || loginResponse.data.token;
    console.log('✅ Authenticated successfully');

    // Step 1: Get wards by type (like the form does)
    console.log('\n📋 Step 1: Getting GENERAL wards...');
    const wardsResponse = await axios.get('http://localhost:5000/ipd/wards', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        type: 'GENERAL',
        isActive: true,
        hasAvailableBeds: true
      }
    });

    console.log(`Found ${wardsResponse.data.length} GENERAL wards`);
    
    if (wardsResponse.data.length === 0) {
      console.log('❌ No general wards found');
      return;
    }

    // Step 2: Get beds from each ward
    console.log('\n🛏️ Step 2: Getting beds from each ward...');
    let allBeds = [];
    
    for (const ward of wardsResponse.data) {
      console.log(`\n--- Ward: ${ward.name} (${ward.wardNumber}) ---`);
      
      try {
        const bedsResponse = await axios.get(`http://localhost:5000/ipd/wards/${ward.id}/beds`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { isOccupied: false }
        });

        const wardBeds = bedsResponse.data.map(bed => ({
          ...bed,
          wardName: ward.name,
          wardNumber: ward.wardNumber
        }));

        console.log(`  Available beds: ${wardBeds.length}`);
        wardBeds.forEach((bed, index) => {
          console.log(`    Bed ${index + 1}: ${bed.bedNumber} - ₹${bed.dailyRate}/day`);
        });

        allBeds = [...allBeds, ...wardBeds];

      } catch (error) {
        console.error(`  ❌ Error getting beds for ward ${ward.id}:`, error.response?.data || error.message);
      }
    }

    // Step 3: Generate rooms and show final result
    console.log(`\n📊 Step 3: Final Results`);
    console.log(`Total available beds: ${allBeds.length}`);
    
    if (allBeds.length > 0) {
      console.log('\n--- Sample Bed Selection Options ---');
      allBeds.slice(0, 5).forEach((bed, index) => {
        const displayText = `${bed.wardName} - ${bed.bedNumber} - ${bed.bedType || 'Standard'} - ₹${bed.dailyRate || 1500}/day`;
        console.log(`${index + 1}. ${displayText}`);
      });

      if (allBeds.length > 5) {
        console.log(`... and ${allBeds.length - 5} more beds`);
      }

      // Generate rooms
      const roomCount = Math.ceil(allBeds.length / 4);
      console.log(`\n--- Generated Rooms ---`);
      for (let i = 1; i <= roomCount; i++) {
        const roomStart = (i - 1) * 4;
        const roomEnd = Math.min(roomStart + 4, allBeds.length);
        const bedsInRoom = allBeds.slice(roomStart, roomEnd);
        console.log(`Room ${i}: ${bedsInRoom.length} beds (${bedsInRoom.map(b => b.bedNumber).join(', ')})`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAdmissionFormFlow();