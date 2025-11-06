const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test user credentials (adjust based on your actual test user)
const TEST_USER = {
  email: 'debayudh@gmail.com',
  password: 'Debayudh@04'
};

let authToken = null;

// Function to authenticate and get token
async function authenticate() {
  try {
    console.log('🔐 Authenticating user...');
    const response = await axios.post(`${BASE_URL}/auth/login`, TEST_USER);
    authToken = response.data.accessToken || response.data.token;
    console.log('✅ Authentication successful');
    console.log('Token:', authToken ? 'Present' : 'Missing');
    return authToken;
  } catch (error) {
    console.error('❌ Authentication failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    console.error('Config:', {
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data
    });
    return null;
  }
}

// Function to make authenticated API calls
async function apiCall(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      }
    };
    
    if (data && (method === 'post' || method === 'patch' || method === 'put')) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ API call failed for ${method.toUpperCase()} ${endpoint}:`, 
      error.response?.data || error.message);
    throw error;
  }
}

// Test functions
async function testGetWards() {
  console.log('\n📋 Testing GET /ipd/wards...');
  try {
    const wards = await apiCall('get', '/ipd/wards');
    console.log('✅ Wards retrieved successfully');
    console.log(`Found ${wards.length} wards:`);
    
    wards.forEach((ward, index) => {
      console.log(`\n--- Ward ${index + 1} ---`);
      console.log(`ID: ${ward.id}`);
      console.log(`Ward Number: ${ward.wardNumber}`);
      console.log(`Name: ${ward.name}`);
      console.log(`Type: ${ward.type}`);
      console.log(`Total Beds: ${ward.totalBeds}`);
      console.log(`Available Beds: ${ward.availableBeds}`);
      console.log(`Department: ${ward.department?.name}`);
      console.log(`Beds count: ${ward.beds?.length || 0}`);
      
      if (ward.beds && ward.beds.length > 0) {
        console.log('Bed Details:');
        ward.beds.forEach((bed, bedIndex) => {
          console.log(`  Bed ${bedIndex + 1}:`);
          console.log(`    ID: ${bed.id}`);
          console.log(`    Bed Number: ${bed.bedNumber}`);
          console.log(`    Ward ID: ${bed.wardId}`);
          console.log(`    Is Occupied: ${bed.isOccupied}`);
          console.log(`    Bed Type: ${bed.bedType}`);
          console.log(`    Daily Rate: ${bed.dailyRate}`);
          console.log(`    Is Active: ${bed.isActive}`);
        });
      }
    });
    return wards;
  } catch (error) {
    console.error('Failed to get wards');
    return [];
  }
}

async function testGetSpecificWard(wardId) {
  console.log(`\n🏥 Testing GET /ipd/wards/${wardId}...`);
  try {
    const ward = await apiCall('get', `/ipd/wards/${wardId}`);
    console.log('✅ Ward details retrieved successfully');
    console.log('Ward Details:');
    console.log(JSON.stringify(ward, null, 2));
    return ward;
  } catch (error) {
    console.error('Failed to get ward details');
    return null;
  }
}

async function testGetBedsByWard(wardId) {
  console.log(`\n🛏️ Testing GET /ipd/wards/${wardId}/beds...`);
  try {
    const beds = await apiCall('get', `/ipd/wards/${wardId}/beds`);
    console.log('✅ Beds retrieved successfully');
    console.log(`Found ${beds.length} beds in ward:`);
    
    beds.forEach((bed, index) => {
      console.log(`\n--- Bed ${index + 1} ---`);
      console.log(`ID: ${bed.id}`);
      console.log(`Bed Number: ${bed.bedNumber}`);
      console.log(`Ward ID: ${bed.wardId}`);
      console.log(`Is Occupied: ${bed.isOccupied}`);
      console.log(`Bed Type: ${bed.bedType}`);
      console.log(`Daily Rate: ${bed.dailyRate} (Type: ${typeof bed.dailyRate})`);
      console.log(`Is Active: ${bed.isActive}`);
      console.log(`Ward Info: ${bed.ward?.name}`);
    });
    return beds;
  } catch (error) {
    console.error('Failed to get beds');
    return [];
  }
}

async function testGetAvailableBeds() {
  console.log('\n🆓 Testing GET /ipd/wards/available-beds/all...');
  try {
    const response = await apiCall('get', '/ipd/wards/available-beds/all');
    console.log('✅ Available beds retrieved successfully');
    console.log('Response structure:', {
      totalAvailableBeds: response.totalAvailableBeds,
      bedsByWardCount: response.bedsByWard?.length || 0,
      allBedsCount: response.allBeds?.length || 0
    });
    
    if (response.allBeds && response.allBeds.length > 0) {
      console.log(`Found ${response.allBeds.length} available beds:`);
      response.allBeds.slice(0, 3).forEach((bed, index) => {
        console.log(`\n--- Available Bed ${index + 1} ---`);
        console.log(`ID: ${bed.id}`);
        console.log(`Bed Number: ${bed.bedNumber}`);
        console.log(`Ward: ${bed.ward?.name}`);
        console.log(`Bed Type: ${bed.bedType}`);
        console.log(`Daily Rate: ${bed.dailyRate} (Type: ${typeof bed.dailyRate})`);
      });
      
      if (response.allBeds.length > 3) {
        console.log(`... and ${response.allBeds.length - 3} more beds`);
      }
    }
    
    return response;
  } catch (error) {
    console.error('Failed to get available beds');
    return null;
  }
}

async function createTestWard() {
  console.log('\n🏗️ Creating test ward...');
  try {
    // First get a department ID
    const departments = await apiCall('get', '/departments');
    if (departments.length === 0) {
      console.log('No departments found, cannot create ward');
      return null;
    }

    const testWard = {
      wardNumber: `TEST-${Date.now()}`,
      name: `Test Ward ${Date.now()}`,
      type: 'GENERAL',
      departmentId: departments[0].id,
      totalBeds: 3,
      floor: '1',
      description: 'Test ward for API testing'
    };

    const ward = await apiCall('post', '/ipd/wards', testWard);
    console.log('✅ Test ward created successfully');
    console.log('Ward ID:', ward.id);
    console.log('Ward Number:', ward.wardNumber);
    console.log('Beds created:', ward.beds?.length || 0);
    
    if (ward.beds) {
      ward.beds.forEach((bed, index) => {
        console.log(`Bed ${index + 1}: ${bed.bedNumber} - Daily Rate: ${bed.dailyRate}`);
      });
    }
    
    return ward;
  } catch (error) {
    console.error('Failed to create test ward');
    return null;
  }
}

async function testCreateBed(wardId) {
  console.log(`\n🛏️ Creating test bed in ward ${wardId}...`);
  try {
    const testBed = {
      bedNumber: `TEST-BED-${Date.now()}`,
      bedType: 'Standard',
      dailyRate: 1500
    };

    const bed = await apiCall('post', `/ipd/wards/${wardId}/beds`, testBed);
    console.log('✅ Test bed created successfully');
    console.log('Bed Details:');
    console.log(JSON.stringify(bed, null, 2));
    return bed;
  } catch (error) {
    console.error('Failed to create test bed');
    return null;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Ward & Bed API Tests');
  console.log('='.repeat(50));

  // Authenticate first
  const token = await authenticate();
  if (!token) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }

  try {
    // Test getting all wards
    const wards = await testGetWards();
    
    // If we have wards, test specific ward operations
    if (wards.length > 0) {
      const firstWard = wards[0];
      await testGetSpecificWard(firstWard.id);
      await testGetBedsByWard(firstWard.id);
    }

    // Test getting all available beds
    await testGetAvailableBeds();

    // Create a test ward and bed
    const newWard = await createTestWard();
    if (newWard && newWard.id) {
      await testCreateBed(newWard.id);
      // Test the new ward's beds
      await testGetBedsByWard(newWard.id);
    }

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('🏁 Tests completed');
}

// Run the tests
runTests().catch(console.error);