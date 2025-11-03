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

// Check what createdById values are used in existing appointments
async function checkExistingAppointments() {
  console.log('\n🔍 Analyzing existing appointments createdById values...');
  
  try {
    const appointments = await makeAuthenticatedRequest('GET', '/appointments?limit=100');
    
    if (appointments.appointments && appointments.appointments.length > 0) {
      console.log(`Found ${appointments.appointments.length} regular appointments:`);
      
      appointments.appointments.forEach((apt, index) => {
        console.log(`\n${index + 1}. Appointment ${apt.id}:`);
        console.log(`   Patient: ${apt.patientName}`);
        console.log(`   Doctor: ${apt.doctorName}`);
        console.log(`   Created By ID: ${apt.createdById || 'N/A'}`);
        console.log(`   Created At: ${apt.createdAt}`);
      });
      
      // Get unique createdById values
      const createdByIds = [...new Set(appointments.appointments.map(apt => apt.createdById))];
      console.log(`\n📊 Unique createdById values: ${JSON.stringify(createdByIds)}`);
      
      return createdByIds[0]; // Return the first valid createdById
    } else {
      console.log('No regular appointments found');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Failed to check appointments:', error.message);
    return null;
  }
}

async function runCheck() {
  console.log('🔍 CHECKING EXISTING APPOINTMENT STRUCTURE');
  console.log('=' .repeat(50));
  
  try {
    await login();
    const sampleCreatedById = await checkExistingAppointments();
    
    if (sampleCreatedById) {
      console.log(`\n✅ Sample createdById found: ${sampleCreatedById}`);
      console.log('💡 We can use this as a template for new appointments');
    } else {
      console.log('\n⚠️  No existing appointments to analyze');
      console.log('💡 We need to find a valid user ID or create appointments differently');
    }
    
  } catch (error) {
    console.error('💥 Check failed:', error.message);
  }
}

runCheck();