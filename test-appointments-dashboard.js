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
    console.error(`❌ Error ${method} ${url}:`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
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

// Test appointments dashboard
async function testAppointmentsDashboard() {
  console.log('📋 Testing Appointments Dashboard...');
  
  try {
    // Test regular appointments endpoint
    console.log('\n1️⃣ Testing regular appointments endpoint:');
    const regularAppointments = await makeAuthenticatedRequest('GET', '/appointments?limit=100');
    console.log(`   Regular appointments count: ${regularAppointments.appointments?.length || regularAppointments.length || 0}`);
    
    // Test OPD visits as appointments endpoint
    console.log('\n2️⃣ Testing OPD visits as appointments endpoint:');
    const opdAppointments = await makeAuthenticatedRequest('GET', '/appointments/opd-visits?limit=100');
    console.log(`   OPD visits count: ${opdAppointments.appointments?.length || opdAppointments.length || 0}`);
    
    if (opdAppointments.appointments && opdAppointments.appointments.length > 0) {
      console.log('✅ OPD visits found! Sample OPD visit as appointment:');
      const sample = opdAppointments.appointments[0];
      console.log(`   ID: ${sample.id}`);
      console.log(`   Patient: ${sample.patientName}`);
      console.log(`   Doctor: ${sample.doctorName}`);
      console.log(`   Date: ${sample.date}`);
      console.log(`   Time: ${sample.startTime} - ${sample.endTime}`);
      console.log(`   Status: ${sample.status}`);
      console.log(`   Reason: ${sample.reason}`);
    } else {
      console.log('⚠️ No OPD visits found. This might be expected if no visits have been created yet.');
    }
    
    // Test combined view (what the frontend will see)
    console.log('\n3️⃣ Testing combined appointments view:');
    const allRegular = regularAppointments.appointments || [];
    const allOPD = opdAppointments.appointments || [];
    const combined = [...allRegular, ...allOPD];
    
    console.log(`   Total appointments (regular + OPD): ${combined.length}`);
    console.log(`   - Regular appointments: ${allRegular.length}`);
    console.log(`   - OPD visits: ${allOPD.length}`);
    
    if (combined.length > 0) {
      console.log('\n📊 Sample appointments from combined view:');
      combined.slice(0, 3).forEach((apt, index) => {
        console.log(`   ${index + 1}. ${apt.patientName} -> Dr. ${apt.doctorName} (${apt.status})`);
        console.log(`      Date: ${new Date(apt.date).toLocaleDateString()}, Time: ${apt.startTime}`);
        console.log(`      Type: ${apt.notes?.includes('OPD Visit') ? 'OPD Visit' : 'Regular Appointment'}`);
      });
    }
    
    return {
      regularCount: allRegular.length,
      opdCount: allOPD.length,
      totalCount: combined.length
    };
    
  } catch (error) {
    console.error('❌ Failed to test appointments dashboard');
    throw error;
  }
}

// Main execution
async function runTest() {
  console.log('🚀 Testing Appointments Dashboard Integration');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Login
    await login();
    
    // Step 2: Test appointments dashboard
    const results = await testAppointmentsDashboard();
    
    console.log('\n🎉 TEST COMPLETED SUCCESSFULLY!');
    console.log('=' .repeat(60));
    
    // Summary
    console.log('\n📈 SUMMARY:');
    console.log(`✓ Authentication: SUCCESS`);
    console.log(`✓ Regular Appointments: ${results.regularCount}`);
    console.log(`✓ OPD Visits Available: ${results.opdCount}`);
    console.log(`✓ Total Appointments Visible: ${results.totalCount}`);
    
    if (results.opdCount > 0) {
      console.log(`\n🎯 SUCCESS: OPD visits are now visible in the appointments dashboard!`);
    } else {
      console.log(`\n⚠️ NOTE: No OPD visits found. Create some OPD visits to see them in the dashboard.`);
    }
    
  } catch (error) {
    console.error('\n💥 TEST FAILED:', error.message);
    process.exit(1);
  }
}

runTest();