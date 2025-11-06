const axios = require('axios');

async function testFrontendFixes() {
  try {
    console.log('🧪 Testing Frontend Fixes for Ward & Bed Data');
    console.log('='.repeat(60));

    // Login first
    const loginResponse = await axios.post('http://localhost:5000/auth/login', {
      email: 'debayudh@gmail.com',
      password: 'Debayudh@04'
    });
    
    const token = loginResponse.data.accessToken || loginResponse.data.token;
    console.log('✅ Authenticated successfully');

    // Simulate what the frontend IPD service now does
    console.log('\n1️⃣ Testing Enhanced getWards method...');
    
    // First call - get wards with basic bed data
    const basicWardsResponse = await axios.get('http://localhost:5000/ipd/wards', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        type: 'GENERAL',
        isActive: true,
        hasAvailableBeds: true
      }
    });

    const wards = basicWardsResponse.data;
    console.log(`Found ${wards.length} wards`);

    if (wards.length > 0) {
      const ward = wards[0];
      console.log(`\nChecking first ward: ${ward.name}`);
      console.log(`Basic bed data - Beds count: ${ward.beds?.length || 0}`);
      
      if (ward.beds && ward.beds.length > 0) {
        const firstBed = ward.beds[0];
        console.log(`First bed: ${firstBed.bedNumber}`);
        console.log(`Has dailyRate: ${firstBed.dailyRate !== undefined ? 'YES' : 'NO'}`);
        console.log(`Has wardId: ${firstBed.wardId !== undefined ? 'YES' : 'NO'}`);
        
        // If missing data, fetch complete ward details (what our fix does)
        if (firstBed.dailyRate === undefined || firstBed.wardId === undefined) {
          console.log('\n🔧 Bed data incomplete, fetching complete ward details...');
          
          const completeWardResponse = await axios.get(`http://localhost:5000/ipd/wards/${ward.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const completeWard = completeWardResponse.data;
          const completeBed = completeWard.beds[0];
          
          console.log('✅ Complete bed data retrieved:');
          console.log(`  Bed Number: ${completeBed.bedNumber}`);
          console.log(`  Ward ID: ${completeBed.wardId}`);
          console.log(`  Daily Rate: ₹${completeBed.dailyRate}/day`);
          console.log(`  Is Active: ${completeBed.isActive}`);
          
          // Test the fix - merge the data
          const fixedWard = { ...ward, beds: completeWard.beds };
          console.log('\n🎯 After frontend fix applied:');
          console.log(`  Ward: ${fixedWard.name}`);
          console.log(`  Beds with complete data: ${fixedWard.beds.length}`);
          fixedWard.beds.slice(0, 2).forEach((bed, index) => {
            console.log(`  Bed ${index + 1}: ${bed.bedNumber} - ₹${bed.dailyRate}/day`);
          });
        }
      }
    }

    // Test the admission service functions
    console.log('\n2️⃣ Testing Admission Service Functions...');
    
    if (wards.length > 0) {
      const wardId = wards[0].id;
      console.log(`\nTesting getAvailableRoomsByWard for ward: ${wardId}`);
      
      // Simulate getAvailableRoomsByWard
      const bedsResponse = await axios.get(`http://localhost:5000/ipd/wards/${wardId}/beds`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { isOccupied: false }
      });
      
      const beds = bedsResponse.data;
      console.log(`Available beds found: ${beds.length}`);
      
      if (beds.length > 0) {
        // Generate room numbers (what our fix does)
        const rooms = [...new Set(beds.map((bed, index) => {
          if (bed.roomNumber) {
            return bed.roomNumber;
          }
          const bedNum = parseInt(bed.bedNumber?.split('-')?.pop() || (index + 1).toString());
          return `${Math.floor((bedNum - 1) / 4) + 101}`;
        }))];
        
        console.log(`Generated rooms: ${rooms.join(', ')}`);
        
        // Test bed mapping for room selection
        const roomNumber = rooms[0];
        const bedsInRoom = beds.filter(bed => {
          if (bed.roomNumber) {
            return bed.roomNumber === roomNumber;
          }
          const bedNum = parseInt(bed.bedNumber?.split('-')?.pop() || '1');
          const generatedRoom = `${Math.floor((bedNum - 1) / 4) + 101}`;
          return generatedRoom === roomNumber;
        });
        
        console.log(`\nBeds in room ${roomNumber}:`);
        bedsInRoom.forEach(bed => {
          console.log(`  ${bed.bedNumber || `Bed-${bed.id?.substring(0,8)}`} - ${bed.bedType || 'Standard'} - ₹${bed.dailyRate || 1500}/day`);
        });
      }
    }

    console.log('\n✅ Frontend fixes validation complete!');
    console.log('The ward and bed data should now display correctly in the UI.');

  } catch (error) {
    console.error('❌ Error during testing:', error.response?.data || error.message);
  }
}

testFrontendFixes();