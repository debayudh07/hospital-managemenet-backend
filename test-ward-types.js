const axios = require('axios');

async function testWardTypeFiltering() {
  try {
    console.log('🏥 Testing Ward Type Filtering');
    console.log('='.repeat(50));

    // Login
    const loginResponse = await axios.post('http://localhost:5000/auth/login', {
      email: 'debayudh@gmail.com',
      password: 'Debayudh@04'
    });
    
    const token = loginResponse.data.accessToken || loginResponse.data.token;
    console.log('✅ Authenticated successfully');

    // Test different ward types
    const wardTypes = ['GENERAL', 'ICU', 'NICU'];
    
    for (const wardType of wardTypes) {
      console.log(`\n📋 Testing ${wardType} wards...`);
      
      try {
        const wardsResponse = await axios.get('http://localhost:5000/ipd/wards', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            type: wardType,
            isActive: true,
            hasAvailableBeds: true
          }
        });

        console.log(`  Found ${wardsResponse.data.length} ${wardType} wards`);
        
        if (wardsResponse.data.length > 0) {
          let totalBeds = 0;
          
          for (const ward of wardsResponse.data) {
            const bedsResponse = await axios.get(`http://localhost:5000/ipd/wards/${ward.id}/beds`, {
              headers: { Authorization: `Bearer ${token}` },
              params: { isOccupied: false }
            });
            
            const bedCount = bedsResponse.data.length;
            totalBeds += bedCount;
            console.log(`    Ward: ${ward.name} → ${bedCount} beds`);
          }
          
          const roomCount = Math.ceil(totalBeds / 4);
          console.log(`  📊 Total: ${totalBeds} beds → ${roomCount} rooms`);
          
          for (let i = 1; i <= roomCount; i++) {
            console.log(`    Room ${i}: beds ${((i-1)*4)+1}-${Math.min(i*4, totalBeds)}`);
          }
        } else {
          console.log(`  ❌ No ${wardType} wards available`);
        }
        
      } catch (error) {
        console.error(`  ❌ Error testing ${wardType}:`, error.response?.data || error.message);
      }
    }

    // Test ward type mapping
    console.log('\n🔄 Testing Ward Type Mapping...');
    const frontendTypes = ['General', 'Semi-Private', 'Private', 'ICU', 'PICU', 'NICU'];
    const wardTypeMapping = {
      'General': 'GENERAL',
      'Semi-Private': 'GENERAL', 
      'Private': 'GENERAL',
      'ICU': 'ICU',
      'PICU': 'ICU',
      'NICU': 'NICU',
    };
    
    for (const frontendType of frontendTypes) {
      const backendType = wardTypeMapping[frontendType];
      console.log(`  ${frontendType} → ${backendType}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testWardTypeFiltering();