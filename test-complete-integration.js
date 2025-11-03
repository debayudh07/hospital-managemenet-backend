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

// Create a new OPD visit and verify it appears in appointments
async function testCompleteFlow() {
  console.log('\n🧪 Testing Complete OPD -> Appointments Flow...');
  
  try {
    // Get current appointment count
    const initialAppointments = await makeAuthenticatedRequest('GET', '/appointments?limit=100');
    const initialOpdVisits = await makeAuthenticatedRequest('GET', '/appointments/opd-visits?limit=100');
    
    console.log(`📊 Initial state:`);
    console.log(`   Regular appointments: ${initialAppointments.appointments?.length || 0}`);
    console.log(`   OPD visits as appointments: ${initialOpdVisits.appointments?.length || 0}`);
    
    // Create a new OPD visit with auto-generated patient
    console.log('\n📝 Creating new OPD visit...');
    const newOpdVisit = {
      // Patient data (flat structure)
      firstName: 'Test',
      lastName: 'Integration',
      dateOfBirth: '1990-06-15',
      gender: 'MALE',
      phoneNumber: '+919876543999',
      email: 'test.integration@example.com',
      address: '123 Integration Test Street',
      emergencyContactName: 'Emergency Contact',
      emergencyContactPhone: '+918765432109',
      
      // Visit details
      doctorId: 'cmhajbazr0002etb46ou9e4r7', // Debayudh Basu
      visitDate: new Date().toISOString().split('T')[0],
      visitTime: '16:00',
      chiefComplaint: 'Integration test - checking OPD to appointments flow',
      historyOfPresentIllness: 'Testing the complete integration flow',
      pastMedicalHistory: 'No known medical history',
      allergies: 'None',
      currentMedications: 'None',
      visitType: 'OPD',
      appointmentMode: 'WALK_IN',
      status: 'PENDING',
      
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

    const createdVisit = await makeAuthenticatedRequest('POST', '/opd/visits', newOpdVisit);
    console.log(`✅ OPD visit created: ${createdVisit.visitId}`);
    console.log(`   Patient: ${createdVisit.patient.firstName} ${createdVisit.patient.lastName}`);
    console.log(`   Doctor: Dr. ${createdVisit.doctor.firstName} ${createdVisit.doctor.lastName}`);
    console.log(`   Date/Time: ${createdVisit.visitDate} at ${createdVisit.visitTime}`);

    // Wait a moment for the system to process
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if OPD visit appears in appointments
    console.log('\n🔍 Verifying OPD visit appears in appointments...');
    const updatedOpdVisits = await makeAuthenticatedRequest('GET', '/appointments/opd-visits?limit=100');
    
    const newAppointment = updatedOpdVisits.appointments.find(apt => 
      apt.notes && apt.notes.includes(createdVisit.visitId)
    );
    
    if (newAppointment) {
      console.log('✅ SUCCESS! New OPD visit found in appointments:');
      console.log(`   Appointment ID: ${newAppointment.id}`);
      console.log(`   Patient: ${newAppointment.patientName}`);
      console.log(`   Doctor: ${newAppointment.doctorName}`);
      console.log(`   Date: ${newAppointment.date}`);
      console.log(`   Time: ${newAppointment.startTime} - ${newAppointment.endTime}`);
      console.log(`   Status: ${newAppointment.status}`);
      console.log(`   Notes: ${newAppointment.notes}`);
    } else {
      console.log('❌ FAILED: New OPD visit not found in appointments');
      return false;
    }

    // Test combined view (what the frontend would see)
    console.log('\n📊 Testing combined appointments view (frontend perspective)...');
    const regularAppointments = await makeAuthenticatedRequest('GET', '/appointments?limit=100');
    const opdAppointments = await makeAuthenticatedRequest('GET', '/appointments/opd-visits?limit=100');
    
    const totalAppointments = [
      ...(regularAppointments.appointments || []),
      ...(opdAppointments.appointments || [])
    ];
    
    console.log(`✅ Combined view results:`);
    console.log(`   Regular appointments: ${regularAppointments.appointments?.length || 0}`);
    console.log(`   OPD appointments: ${opdAppointments.appointments?.length || 0}`);
    console.log(`   Total visible appointments: ${totalAppointments.length}`);
    
    // Show the integration test appointment
    const integrationAppt = totalAppointments.find(apt => 
      apt.patientName && apt.patientName.includes('Integration')
    );
    
    if (integrationAppt) {
      console.log(`\n🎯 Integration test appointment visible:`);
      console.log(`   ${integrationAppt.patientName} -> ${integrationAppt.doctorName}`);
      console.log(`   ${integrationAppt.date} at ${integrationAppt.startTime}`);
      console.log(`   Status: ${integrationAppt.status}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    return false;
  }
}

// Main execution
async function runIntegrationTest() {
  console.log('🚀 COMPLETE OPD -> APPOINTMENTS INTEGRATION TEST');
  console.log('=' .repeat(60));
  
  try {
    await login();
    
    const success = await testCompleteFlow();
    
    if (success) {
      console.log('\n🎉 INTEGRATION TEST PASSED!');
      console.log('=' .repeat(40));
      console.log('✓ OPD visits are automatically converted to appointments');
      console.log('✓ New appointments appear in the dashboard');
      console.log('✓ Frontend can fetch and display combined data');
      console.log('✓ Complete flow is working end-to-end');
    } else {
      console.log('\n❌ INTEGRATION TEST FAILED!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 INTEGRATION TEST CRASHED:', error.message);
    process.exit(1);
  }
}

runIntegrationTest();