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

// Check existing OPD visits to see how they were created
async function checkExistingOPDVisits() {
  console.log('\n🔍 Analyzing existing OPD visits...');
  
  try {
    const opdVisits = await makeAuthenticatedRequest('GET', '/opd/visits?limit=10');
    
    console.log(`Found ${opdVisits.length} existing OPD visits:`);
    
    opdVisits.forEach((visit, index) => {
      console.log(`\n${index + 1}. Visit ${visit.visitId}:`);
      console.log(`   Patient: ${visit.patient?.firstName} ${visit.patient?.lastName}`);
      console.log(`   Doctor: ${visit.doctor?.firstName} ${visit.doctor?.lastName}`);
      console.log(`   Department: ${visit.department?.name || 'N/A'}`);
      console.log(`   Date: ${visit.visitDate} at ${visit.visitTime}`);
      console.log(`   Status: ${visit.status}`);
      console.log(`   Created: ${visit.createdAt}`);
    });
    
    // Let's also check what these visits look like in the database structure
    if (opdVisits.length > 0) {
      console.log('\n📋 Sample visit structure:');
      const sample = opdVisits[0];
      console.log('Keys in visit object:', Object.keys(sample));
      
      if (sample.patient) {
        console.log('Patient keys:', Object.keys(sample.patient));
      }
      if (sample.doctor) {
        console.log('Doctor keys:', Object.keys(sample.doctor));
      }
      if (sample.department) {
        console.log('Department keys:', Object.keys(sample.department));
      }
    }
    
    return opdVisits;
    
  } catch (error) {
    console.error('❌ Failed to check existing OPD visits:', error.message);
    return [];
  }
}

// Test if we can create an OPD visit using the exact same structure as existing ones
async function testWithExistingStructure() {
  console.log('\n🧪 Testing OPD creation with structure matching existing visits...');
  
  try {
    const existingVisits = await checkExistingOPDVisits();
    
    if (existingVisits.length === 0) {
      console.log('No existing visits to analyze structure from');
      return;
    }
    
    // Get the structure from an existing visit
    const sampleVisit = existingVisits[0];
    console.log('\n📝 Attempting to create similar visit...');
    
    // Get required IDs
    const doctors = await makeAuthenticatedRequest('GET', '/doctors?limit=1');
    const departments = await makeAuthenticatedRequest('GET', '/departments?limit=1');
    
    const newVisit = {
      patientData: {
        firstName: 'Integration',
        lastName: 'Test',
        phone: '+919876543111',
        email: 'integration.test@example.com',
        dateOfBirth: '1990-01-01',
        gender: 'MALE',
        address: 'Test Address',
        city: 'Mumbai', 
        state: 'Maharashtra',
        zipCode: '400001',
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: '+919876543112',
        emergencyContactRelationship: 'Friend'
      },
      
      doctorId: doctors[0].id,
      departmentId: departments[0].id,
      visitDate: new Date().toISOString().split('T')[0],
      visitTime: '16:00',
      chiefComplaint: 'Test complaint'
    };
    
    console.log('Trying minimal structure first...');
    const result = await makeAuthenticatedRequest('POST', '/opd/visits', newVisit);
    
    console.log('✅ Minimal OPD visit created successfully!');
    console.log('Visit ID:', result.visitId);
    
    return result;
    
  } catch (error) {
    console.error('❌ Still failing with minimal structure:', error.response?.data || error.message);
    
    // Let's check if the API endpoint itself is accessible
    console.log('\n🔍 Checking API endpoint accessibility...');
    try {
      const result = await makeAuthenticatedRequest('GET', '/opd/visits?limit=1');
      console.log('✅ GET endpoint works fine, issue is with POST validation');
    } catch (getError) {
      console.log('❌ Even GET endpoint is failing:', getError.message);
    }
  }
}

async function runAnalysis() {
  console.log('🔍 OPD VISIT CREATION ANALYSIS');
  console.log('=' .repeat(40));
  
  try {
    await login();
    await testWithExistingStructure();
  } catch (error) {
    console.error('💥 Analysis failed:', error.message);
  }
}

runAnalysis();