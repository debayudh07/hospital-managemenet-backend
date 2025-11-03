const axios = require('axios');

// Base URL for the API
const BASE_URL = 'http://localhost:5000';

// Login credentials
const LOGIN_CREDENTIALS = {
  email: 'debayudh@gmail.com',
  password: 'Debayudh@04'
};

let authToken = '';

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (method, url, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (data) {
    config.data = data;
  }

  const response = await axios(config);
  return response.data;
};

// Login function
async function login() {
  console.log('🔐 Authenticating...');
  const response = await axios.post(`${BASE_URL}/auth/login`, LOGIN_CREDENTIALS);
  authToken = response.data.accessToken;
  console.log('✅ Authentication successful!');
  return response.data;
}

// Test department information in appointments
async function testDepartmentInfo() {
  console.log('\n🏢 Testing Department Information in Appointments...');
  
  try {
    // Test OPD visits as appointments
    const opdAppointments = await makeAuthenticatedRequest('GET', '/appointments/opd-visits?limit=5');
    
    console.log(`Found ${opdAppointments.appointments.length} OPD appointments:`);
    
    opdAppointments.appointments.forEach((apt, index) => {
      console.log(`\n${index + 1}. Appointment ${apt.id}:`);
      console.log(`   Patient: ${apt.patientName}`);
      console.log(`   Doctor: ${apt.doctorName}`);
      console.log(`   Department ID: ${apt.departmentId || 'MISSING'}`);
      console.log(`   Department Object: ${JSON.stringify(apt.department) || 'MISSING'}`);
      console.log(`   Department Name: ${apt.department?.name || 'UNKNOWN'}`);
    });
    
    // Test regular appointments
    console.log('\n📋 Testing Regular Appointments for comparison:');
    const regularAppointments = await makeAuthenticatedRequest('GET', '/appointments?limit=3');
    
    regularAppointments.appointments.forEach((apt, index) => {
      console.log(`\n${index + 1}. Regular Appointment ${apt.id}:`);
      console.log(`   Patient: ${apt.patientName}`);
      console.log(`   Doctor: ${apt.doctorName}`);
      console.log(`   Department ID: ${apt.departmentId || 'MISSING'}`);
      console.log(`   Department Object: ${JSON.stringify(apt.department) || 'MISSING'}`);
      console.log(`   Department Name: ${apt.department?.name || 'UNKNOWN'}`);
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Failed to test department info:', error.message);
    return false;
  }
}

async function runDepartmentTest() {
  console.log('🏢 TESTING DEPARTMENT INFORMATION IN APPOINTMENTS');
  console.log('=' .repeat(55));
  
  try {
    await login();
    const success = await testDepartmentInfo();
    
    if (success) {
      console.log('\n✅ Department test completed successfully!');
    } else {
      console.log('\n❌ Department test failed!');
    }
    
  } catch (error) {
    console.error('💥 Department test crashed:', error.message);
  }
}

runDepartmentTest();