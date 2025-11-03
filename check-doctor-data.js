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

// Check doctor data structure
async function checkDoctorData() {
  console.log('\n👨‍⚕️ Checking Doctor Data Structure...');
  
  try {
    const doctors = await makeAuthenticatedRequest('GET', '/doctors?limit=2');
    
    console.log(`Found ${doctors.length} doctors:`);
    
    doctors.forEach((doctor, index) => {
      console.log(`\n${index + 1}. Doctor ${doctor.id}:`);
      console.log(`   Name: Dr. ${doctor.firstName} ${doctor.lastName}`);
      console.log(`   Department ID: ${doctor.departmentId || 'MISSING'}`);
      console.log(`   Specialization: ${doctor.specialization}`);
      console.log(`   Has departments relation: ${doctor.departments ? 'YES' : 'NO'}`);
      if (doctor.departments) {
        console.log(`   Departments: ${JSON.stringify(doctor.departments)}`);
      }
    });
    
    // Check department data
    console.log('\n🏢 Checking Departments Data...');
    const departments = await makeAuthenticatedRequest('GET', '/departments?limit=5');
    
    console.log(`Found ${departments.length} departments:`);
    
    departments.forEach((dept, index) => {
      console.log(`\n${index + 1}. Department ${dept.id}:`);
      console.log(`   Name: ${dept.name}`);
      console.log(`   Description: ${dept.description || 'N/A'}`);
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Failed to check doctor data:', error.message);
    return false;
  }
}

async function runDoctorCheck() {
  console.log('👨‍⚕️ CHECKING DOCTOR AND DEPARTMENT DATA STRUCTURE');
  console.log('=' .repeat(60));
  
  try {
    await login();
    const success = await checkDoctorData();
    
    if (success) {
      console.log('\n✅ Doctor data check completed successfully!');
    } else {
      console.log('\n❌ Doctor data check failed!');
    }
    
  } catch (error) {
    console.error('💥 Doctor data check crashed:', error.message);
  }
}

runDoctorCheck();