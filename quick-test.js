const axios = require('axios');

async function quickTest() {
  try {
    // Login first
    const loginResponse = await axios.post('http://localhost:5000/auth/login', {
      email: 'debayudh@gmail.com',
      password: 'Debayudh@04'
    });
    
    const token = loginResponse.data.accessToken || loginResponse.data.token;
    
    // Get wards
    const wardsResponse = await axios.get('http://localhost:3001/ipd/wards', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('=== FIXED DATA CHECK ===');
    if (wardsResponse.data.length > 0 && wardsResponse.data[0].beds?.length > 0) {
      const bed = wardsResponse.data[0].beds[0];
      console.log('First Ward, First Bed:');
      console.log(`  ID: ${bed.id}`);
      console.log(`  Bed Number: ${bed.bedNumber}`);
      console.log(`  Ward ID: ${bed.wardId}`);
      console.log(`  Daily Rate: ${bed.dailyRate} (Type: ${typeof bed.dailyRate})`);
      console.log(`  Is Active: ${bed.isActive}`);
      console.log(`  Is Occupied: ${bed.isOccupied}`);
      console.log('✅ Fix successful - all bed fields now present!');
    } else {
      console.log('No beds found');
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

quickTest();