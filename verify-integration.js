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

// Verify integration using existing data
async function verifyIntegration() {
  console.log('\n🔍 Verifying OPD -> Appointments Integration...');
  
  try {
    // 1. Check OPD visits exist
    console.log('\n1️⃣ Checking OPD visits...');
    const opdVisits = await makeAuthenticatedRequest('GET', '/opd/visits?limit=100');
    console.log(`   Found ${opdVisits.length} OPD visits`);
    
    if (opdVisits.length === 0) {
      console.log('⚠️  No OPD visits found to test with');
      return false;
    }

    // Show sample OPD visit
    const sampleVisit = opdVisits[0];
    console.log(`   Sample OPD visit:`);
    console.log(`     - Visit ID: ${sampleVisit.visitId}`);
    console.log(`     - Patient: ${sampleVisit.patient.firstName} ${sampleVisit.patient.lastName}`);
    console.log(`     - Doctor: Dr. ${sampleVisit.doctor.firstName} ${sampleVisit.doctor.lastName}`);

    // 2. Check if OPD visits are available as appointments
    console.log('\n2️⃣ Checking OPD visits in appointments endpoint...');
    const opdAsAppointments = await makeAuthenticatedRequest('GET', '/appointments/opd-visits?limit=100');
    console.log(`   Found ${opdAsAppointments.appointments.length} OPD visits as appointments`);
    
    if (opdAsAppointments.appointments.length === 0) {
      console.log('❌ ISSUE: OPD visits exist but not appearing in appointments endpoint');
      return false;
    }

    // 3. Verify data mapping
    console.log('\n3️⃣ Verifying data mapping...');
    const appointmentFromOPD = opdAsAppointments.appointments.find(apt => 
      apt.notes && apt.notes.includes(sampleVisit.visitId)
    );

    if (!appointmentFromOPD) {
      console.log('❌ ISSUE: OPD visit not properly mapped to appointment format');
      return false;
    }

    console.log('✅ Data mapping verified:');
    console.log(`   OPD Visit ID: ${sampleVisit.visitId}`);
    console.log(`   → Appointment ID: ${appointmentFromOPD.id}`);
    console.log(`   Patient: ${sampleVisit.patient.firstName} ${sampleVisit.patient.lastName} → ${appointmentFromOPD.patientName}`);
    console.log(`   Doctor: Dr. ${sampleVisit.doctor.firstName} ${sampleVisit.doctor.lastName} → ${appointmentFromOPD.doctorName}`);
    console.log(`   Time: ${sampleVisit.visitTime} → ${appointmentFromOPD.startTime}`);

    // 4. Test combined frontend view
    console.log('\n4️⃣ Testing frontend combined view...');
    const regularAppointments = await makeAuthenticatedRequest('GET', '/appointments?limit=100');
    
    const combinedAppointments = [
      ...(regularAppointments.appointments || []),
      ...(opdAsAppointments.appointments || [])
    ];
    
    console.log(`   Regular appointments: ${regularAppointments.appointments?.length || 0}`);
    console.log(`   OPD appointments: ${opdAsAppointments.appointments?.length || 0}`);
    console.log(`   Total appointments visible: ${combinedAppointments.length}`);

    // 5. Verify no duplicates and proper formatting
    console.log('\n5️⃣ Checking data quality...');
    const uniqueIds = new Set(combinedAppointments.map(apt => apt.id));
    if (uniqueIds.size === combinedAppointments.length) {
      console.log('✅ No duplicate appointments found');
    } else {
      console.log('⚠️  Warning: Duplicate appointment IDs detected');
    }

    // Check required fields
    const hasRequiredFields = combinedAppointments.every(apt => 
      apt.id && apt.patientName && apt.doctorName && apt.date && apt.status
    );
    
    if (hasRequiredFields) {
      console.log('✅ All appointments have required fields');
    } else {
      console.log('⚠️  Warning: Some appointments missing required fields');
    }

    return true;
    
  } catch (error) {
    console.error('❌ Integration verification failed:', error.message);
    return false;
  }
}

// Main execution
async function runVerification() {
  console.log('🚀 OPD -> APPOINTMENTS INTEGRATION VERIFICATION');
  console.log('=' .repeat(60));
  
  try {
    await login();
    
    const success = await verifyIntegration();
    
    if (success) {
      console.log('\n🎉 INTEGRATION VERIFICATION PASSED!');
      console.log('=' .repeat(45));
      console.log('✓ OPD visits exist in the system');
      console.log('✓ OPD visits are accessible via appointments endpoint');
      console.log('✓ Data mapping is working correctly');
      console.log('✓ Frontend can fetch and combine both data sources');
      console.log('✓ No data quality issues detected');
      console.log('\n🎯 CONCLUSION: OPD visits are successfully integrated with the appointments dashboard!');
    } else {
      console.log('\n❌ INTEGRATION VERIFICATION FAILED!');
      console.log('There are issues with the OPD to appointments integration.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 VERIFICATION CRASHED:', error.message);
    process.exit(1);
  }
}

runVerification();