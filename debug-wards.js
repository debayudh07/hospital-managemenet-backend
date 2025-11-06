const axios = require('axios');

async function debugWardsBeds() {
  try {
    console.log('🔍 Debugging Wards & Beds Issue');
    console.log('='.repeat(50));

    // Login first
    const loginResponse = await axios.post('http://localhost:5000/auth/login', {
      email: 'debayudh@gmail.com',
      password: 'Debayudh@04'
    });
    
    const token = loginResponse.data.accessToken || loginResponse.data.token;
    console.log('✅ Authenticated successfully');

    // Test 1: Get wards with filters (like the frontend does)
    console.log('\n📋 Test 1: GET /ipd/wards with filters...');
    const wardsResponse = await axios.get('http://localhost:5000/ipd/wards', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        type: 'GENERAL',
        isActive: true,
        hasAvailableBeds: true
      }
    });

    console.log(`Found ${wardsResponse.data.length} wards`);
    
    if (wardsResponse.data.length > 0) {
      const ward = wardsResponse.data[0];
      console.log('\n--- First Ward Details ---');
      console.log(`Ward ID: ${ward.id}`);
      console.log(`Ward Number: ${ward.wardNumber}`);
      console.log(`Ward Name: ${ward.name}`);
      console.log(`Ward Type: ${ward.type}`);
      console.log(`Total Beds: ${ward.totalBeds}`);
      console.log(`Available Beds: ${ward.availableBeds}`);
      console.log(`Department: ${ward.department?.name}`);
      console.log(`Beds Array Length: ${ward.beds?.length || 0}`);
      
      if (ward.beds && ward.beds.length > 0) {
        console.log('\n--- First Bed Details ---');
        const bed = ward.beds[0];
        console.log('Raw bed object:', JSON.stringify(bed, null, 2));
        console.log(`Bed ID: ${bed.id}`);
        console.log(`Bed Number: ${bed.bedNumber}`);
        console.log(`Ward ID: ${bed.wardId}`);
        console.log(`Is Occupied: ${bed.isOccupied}`);
        console.log(`Bed Type: ${bed.bedType}`);
        console.log(`Daily Rate: ${bed.dailyRate} (Type: ${typeof bed.dailyRate})`);
        console.log(`Is Active: ${bed.isActive}`);
      }
    }

    // Test 2: Get specific ward details
    if (wardsResponse.data.length > 0) {
      const wardId = wardsResponse.data[0].id;
      console.log(`\n🏥 Test 2: GET /ipd/wards/${wardId}...`);
      
      const wardDetailsResponse = await axios.get(`http://localhost:5000/ipd/wards/${wardId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const wardDetails = wardDetailsResponse.data;
      console.log('\n--- Ward Details Response ---');
      console.log(`Beds in detailed response: ${wardDetails.beds?.length || 0}`);
      
      if (wardDetails.beds && wardDetails.beds.length > 0) {
        const bed = wardDetails.beds[0];
        console.log('\n--- First Bed from Detailed Response ---');
        console.log(`Bed ID: ${bed.id}`);
        console.log(`Bed Number: ${bed.bedNumber}`);
        console.log(`Ward ID: ${bed.wardId}`);
        console.log(`Daily Rate: ${bed.dailyRate} (Type: ${typeof bed.dailyRate})`);
        console.log(`Is Active: ${bed.isActive}`);
      }
    }

    // Test 3: Get beds by department
    console.log('\n🏥 Test 3: GET /ipd/wards by department...');
    const wardsByDeptResponse = await axios.get('http://localhost:5000/ipd/wards', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        departmentId: 'cmhajbayt0000etb4iwlxupcp', // Orthopedics department
        isActive: true
      }
    });

    console.log(`Found ${wardsByDeptResponse.data.length} wards in department`);
    
    if (wardsByDeptResponse.data.length > 0) {
      const ward = wardsByDeptResponse.data[0];
      console.log('\n--- Department Ward Details ---');
      console.log(`Ward: ${ward.name}`);
      console.log(`Department: ${ward.department?.name}`);
      console.log(`Beds: ${ward.beds?.length || 0}`);
      
      if (ward.beds && ward.beds.length > 0) {
        console.log('\n--- Sample Beds ---');
        ward.beds.slice(0, 2).forEach((bed, index) => {
          console.log(`Bed ${index + 1}:`);
          console.log(`  ID: ${bed.id}`);
          console.log(`  Number: ${bed.bedNumber}`);
          console.log(`  Type: ${bed.bedType}`);
          console.log(`  Rate: ₹${bed.dailyRate}/day`);
          console.log(`  Available: ${!bed.isOccupied}`);
        });
      }
    }

    // Test 4: Available beds endpoint
    console.log('\n🛏️ Test 4: GET /ipd/wards/available-beds/all...');
    const availableBedsResponse = await axios.get('http://localhost:5000/ipd/wards/available-beds/all', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const availableBeds = availableBedsResponse.data;
    console.log(`Total Available Beds: ${availableBeds.totalAvailableBeds}`);
    console.log(`Wards with Beds: ${availableBeds.bedsByWard?.length || 0}`);
    
    if (availableBeds.allBeds && availableBeds.allBeds.length > 0) {
      console.log('\n--- Sample Available Beds ---');
      availableBeds.allBeds.slice(0, 2).forEach((bed, index) => {
        console.log(`Available Bed ${index + 1}:`);
        console.log(`  ID: ${bed.id}`);
        console.log(`  Number: ${bed.bedNumber}`);
        console.log(`  Ward: ${bed.ward?.name}`);
        console.log(`  Rate: ₹${bed.dailyRate}/day`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

debugWardsBeds();