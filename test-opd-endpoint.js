const axios = require('axios');

// Base URL for the API
const BASE_URL = 'http://localhost:5000';

// Login credentials
const LOGIN_CREDENTIALS = {
  email: 'debayudh@gmail.com',
  password: 'Debayudh@04'
};

async function testEndpoint() {
  try {
    // Login first
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, LOGIN_CREDENTIALS);
    const token = loginResponse.data.accessToken;
    console.log('✅ Login successful');

    // Test the endpoint with exact path
    console.log('\n🔍 Testing /appointments/opd-visits endpoint...');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const response = await axios.get(`${BASE_URL}/appointments/opd-visits`, { headers });
    
    console.log('✅ Endpoint response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error details:');
    console.error('Status:', error.response?.status);
    console.error('Response:', error.response?.data);
    console.error('URL:', error.config?.url);
    console.error('Method:', error.config?.method);
  }
}

testEndpoint();