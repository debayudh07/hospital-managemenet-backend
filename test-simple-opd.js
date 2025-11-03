const axios = require('axios');

// Base URL for the API
const BASE_URL = 'http://localhost:5000';

// Login credentials
const LOGIN_CREDENTIALS = {
  email: 'debayudh@gmail.com',
  password: 'Debayudh@04'
};

// Global variables
let authToken = '';

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (method, url, data = null) => {
  try {
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
  } catch (error) {
    console.error(`Error details for ${method} ${url}:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

// Login function
async function login() {
  console.log('🔐 Logging in...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, LOGIN_CREDENTIALS);
    authToken = response.data.accessToken;
    console.log('✅ Login successful!');
    return response.data;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

// Test simple OPD visit creation
async function testSimpleOPDVisit() {
  console.log('📋 Testing simple OPD visit creation...');
  
  // First get a doctor and department
  const doctors = await makeAuthenticatedRequest('GET', '/doctors?limit=1');
  const departments = await makeAuthenticatedRequest('GET', '/departments?limit=1');
  
  if (doctors.length === 0 || departments.length === 0) {
    throw new Error('No doctors or departments available');
  }

  const doctorId = doctors[0].id;
  const departmentId = departments[0].id;
  
  console.log(`Using Doctor: ${doctors[0].firstName} ${doctors[0].lastName} (${doctorId})`);
  console.log(`Using Department: ${departments[0].name} (${departmentId})`);

  // Minimal OPD visit data
  const minimalOPDVisit = {
    patientData: {
      firstName: 'Test',
      lastName: 'Patient',
      phone: '+919876543210',
      dateOfBirth: '1990-01-01',
      gender: 'MALE',
      address: '123 Test Street'
    },
    doctorId: doctorId,
    departmentId: departmentId,
    chiefComplaint: 'Routine checkup',
    billing: {
      consultationFee: 500
    }
  };

  try {
    console.log('Sending minimal OPD visit data:', JSON.stringify(minimalOPDVisit, null, 2));
    const result = await makeAuthenticatedRequest('POST', '/opd/visits', minimalOPDVisit);
    console.log('✅ OPD Visit created successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('❌ Failed to create minimal OPD visit');
    throw error;
  }
}

// Main execution
async function runSimpleTest() {
  console.log('🧪 Running Simple OPD Visit Test');
  console.log('='.repeat(40));
  
  try {
    await login();
    await testSimpleOPDVisit();
    console.log('🎉 Simple test completed successfully!');
  } catch (error) {
    console.error('💥 Simple test failed:', error.message);
    process.exit(1);
  }
}

runSimpleTest();