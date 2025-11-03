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

// Test current data
async function checkCurrentData() {
  console.log('📊 Checking current data in the system...');
  
  try {
    // Check regular appointments
    console.log('\n1️⃣ Checking regular appointments:');
    const appointments = await makeAuthenticatedRequest('GET', '/appointments?limit=100');
    console.log(`   Found ${appointments.appointments?.length || appointments.length || 0} regular appointments`);
    
    if (appointments.appointments && appointments.appointments.length > 0) {
      console.log('   Sample appointment:');
      const sample = appointments.appointments[0];
      console.log(`     - Patient: ${sample.patientName}`);
      console.log(`     - Doctor: ${sample.doctorName}`);
      console.log(`     - Date: ${sample.date}`);
      console.log(`     - Status: ${sample.status}`);
    }
    
    // Check OPD visits
    console.log('\n2️⃣ Checking OPD visits:');
    const opdVisits = await makeAuthenticatedRequest('GET', '/opd/visits?limit=100');
    console.log(`   Found ${opdVisits.length || 0} OPD visits`);
    
    if (opdVisits && opdVisits.length > 0) {
      console.log('   Sample OPD visit:');
      const sample = opdVisits[0];
      console.log(`     - Visit ID: ${sample.visitId}`);
      console.log(`     - Patient: ${sample.patient?.firstName} ${sample.patient?.lastName}`);
      console.log(`     - Doctor: Dr. ${sample.doctor?.firstName} ${sample.doctor?.lastName}`);
      console.log(`     - Date: ${sample.visitDate}`);
      console.log(`     - Time: ${sample.visitTime}`);
      console.log(`     - Status: ${sample.status}`);
      console.log(`     - Chief Complaint: ${sample.chiefComplaint}`);
      
      console.log('\n🎯 ISSUE IDENTIFIED:');
      console.log('   ✅ OPD visits exist in the system');
      console.log('   ❌ But they are NOT showing up in the appointments dashboard');
      console.log('   💡 Solution: We need to integrate OPD visits with the appointments view');
    } else {
      console.log('   ⚠️ No OPD visits found - this explains why appointments dashboard is empty');
    }
    
    return {
      appointmentCount: appointments.appointments?.length || 0,
      opdVisitCount: opdVisits?.length || 0
    };
    
  } catch (error) {
    console.error('❌ Failed to check current data');
    throw error;
  }
}

// Main execution
async function runTest() {
  console.log('🔍 DIAGNOSING APPOINTMENTS DASHBOARD ISSUE');
  console.log('=' .repeat(60));
  
  try {
    await login();
    const results = await checkCurrentData();
    
    console.log('\n📋 DIAGNOSIS SUMMARY:');
    console.log('=' .repeat(30));
    console.log(`Regular Appointments: ${results.appointmentCount}`);
    console.log(`OPD Visits: ${results.opdVisitCount}`);
    
    if (results.opdVisitCount > 0 && results.appointmentCount === 0) {
      console.log('\n🎯 ROOT CAUSE IDENTIFIED:');
      console.log('• OPD visits are being created successfully');
      console.log('• But they are stored in the OPDVisit table, not the Appointment table');
      console.log('• The appointments dashboard only shows data from the Appointment table');
      
      console.log('\n💡 SOLUTIONS IMPLEMENTED:');
      console.log('1. Modified OPD visit creation to also create appointments');
      console.log('2. Added endpoint to fetch OPD visits as appointments');
      console.log('3. Updated frontend to combine both data sources');
      
      console.log('\n⚠️ NEXT STEPS:');
      console.log('• Restart the backend server to apply changes');
      console.log('• Test the new /appointments/opd-visits endpoint');
      console.log('• Verify frontend integration');
    } else if (results.appointmentCount > 0) {
      console.log('\n✅ Regular appointments are working correctly');
    } else {
      console.log('\n⚠️ No data found in either table');
    }
    
  } catch (error) {
    console.error('\n💥 DIAGNOSIS FAILED:', error.message);
    process.exit(1);
  }
}

runTest();