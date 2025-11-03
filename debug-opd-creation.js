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
    console.error(`❌ Full Error Details for ${method} ${url}:`);
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Request Data:', JSON.stringify(data, null, 2));
    throw error;
  }
};

// Login function
async function login() {
  console.log('🔐 Authenticating...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, LOGIN_CREDENTIALS);
    authToken = response.data.accessToken;
    console.log('✅ Authentication successful!');
    return response.data;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    throw error;
  }
}

// Test OPD creation with different approaches
async function testOPDCreation() {
  console.log('\n🧪 Testing OPD Visit Creation...');
  
  try {
    // First, let's get a valid doctor ID
    console.log('\n1️⃣ Getting available doctors...');
    const doctors = await makeAuthenticatedRequest('GET', '/doctors?limit=10');
    if (!doctors || doctors.length === 0) {
      console.log('❌ No doctors found');
      return;
    }
    
    const doctor = doctors[0];
    console.log(`✅ Using doctor: ${doctor.firstName} ${doctor.lastName} (${doctor.id})`);

    // Test 1: Correct nested structure
    console.log('\n2️⃣ Testing with correct nested patientData structure...');
    const correctOPDVisit = {
      // Nested patient data
      patientData: {
        firstName: 'Test',
        lastName: 'Integration',
        phone: '+919876543999',
        email: 'test.integration@example.com',
        dateOfBirth: '1990-06-15',
        gender: 'MALE',
        address: '123 Integration Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: '+918765432109',
        emergencyContactRelationship: 'Friend'
      },
      
      // Visit details
      doctorId: doctor.id,
      visitDate: new Date().toISOString().split('T')[0],
      visitTime: '16:00',
      visitType: 'OPD',
      appointmentMode: 'WALK_IN',
      priority: 'NORMAL',
      status: 'PENDING',
      chiefComplaint: 'Integration test - checking OPD to appointments flow',
      historyOfPresentIllness: 'Testing the complete integration flow',
      pastMedicalHistory: 'No known medical history',
      allergies: 'None',
      currentMedications: 'None',
      
      // Vitals
      vitals: {
        bloodPressure: '120/80',
        heartRate: 75,
        temperature: 98.6,
        respiratoryRate: 16,
        oxygenSaturation: 99,
        weight: 70,
        height: 175,
        bmi: 22.9
      }
    };

    console.log('📝 Attempting to create OPD visit with correct structure...');
    const result = await makeAuthenticatedRequest('POST', '/opd/visits', correctOPDVisit);
    
    console.log('✅ OPD visit created successfully!');
    console.log('Visit ID:', result.visitId);
    console.log('Patient:', result.patient?.firstName, result.patient?.lastName);
    
    return result;
    
  } catch (error) {
    console.error('❌ OPD creation failed');
    return null;
  }
}

// Main execution
async function debugOPDCreation() {
  console.log('🔍 DEBUGGING OPD VISIT CREATION');
  console.log('=' .repeat(50));
  
  try {
    await login();
    const result = await testOPDCreation();
    
    if (result) {
      console.log('\n🎉 DEBUG SUCCESS!');
      console.log('OPD visit creation is working with correct data structure.');
    } else {
      console.log('\n❌ DEBUG FAILED!');
      console.log('OPD visit creation is still failing.');
    }
    
  } catch (error) {
    console.error('\n💥 DEBUG CRASHED:', error.message);
  }
}

debugOPDCreation();