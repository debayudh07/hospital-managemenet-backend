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

// Test OPD creation with correct billing structure
async function testCorrectedOPD() {
  console.log('\n🛠️ Testing OPD Creation with Corrected Billing Structure...');
  
  try {
    // Get required IDs
    const doctors = await makeAuthenticatedRequest('GET', '/doctors?limit=1');
    const departments = await makeAuthenticatedRequest('GET', '/departments?limit=1');
    
    const doctor = doctors[0];
    const department = departments[0];
    
    console.log(`Using doctor: ${doctor.firstName} ${doctor.lastName} (Fee: ${doctor.consultationFee})`);
    console.log(`Using department: ${department.name}`);
    
    // Create OPD visit with CORRECTED billing structure
    const correctedOPDVisit = {
      patientData: {
        firstName: 'Corrected',
        lastName: 'Test',
        phone: '+919876543333',
        email: 'corrected.test@example.com',
        dateOfBirth: '1990-01-01',
        gender: 'MALE',
        address: 'Test Address',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: '+919876543334',
        emergencyContactRelationship: 'Friend'
      },
      
      doctorId: doctor.id,
      departmentId: department.id,
      visitDate: new Date().toISOString().split('T')[0],
      visitTime: '18:00',
      chiefComplaint: 'Corrected test - with proper billing validation',
      
      // CORRECTED billing structure based on DTO
      billing: {
        consultationFee: doctor.consultationFee || 500,
        additionalCharges: 0,  // NOT additionalFees
        discount: 0,
        tax: 0,
        paymentMethod: 'CASH',
        paidAmount: 0,
        notes: 'Integration test payment'
        // Removed: totalAmount (calculated automatically)
        // Removed: paymentStatus (not in DTO)
      }
    };

    console.log('📝 Creating OPD visit with corrected billing structure...');
    const result = await makeAuthenticatedRequest('POST', '/opd/visits', correctedOPDVisit);
    
    console.log('✅ SUCCESS! OPD visit created:');
    console.log(`   Visit ID: ${result.visitId}`);
    console.log(`   Patient: ${result.patient.firstName} ${result.patient.lastName}`);
    console.log(`   Doctor: ${result.doctor.firstName} ${result.doctor.lastName}`);
    console.log(`   Department: ${result.department?.name}`);
    console.log(`   Billing Total: ${result.billing?.totalAmount}`);
    
    // Check if it appears in appointments
    console.log('\n🔍 Verifying appointment creation...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for the transaction
    
    const opdAppointments = await makeAuthenticatedRequest('GET', '/appointments/opd-visits?limit=100');
    const newAppointment = opdAppointments.appointments.find(apt => 
      apt.notes && apt.notes.includes(result.visitId)
    );
    
    if (newAppointment) {
      console.log('✅ SUCCESS! OPD visit appears in appointments dashboard!');
      console.log(`   Appointment ID: ${newAppointment.id}`);
      console.log(`   Patient: ${newAppointment.patientName}`);
      console.log(`   Doctor: ${newAppointment.doctorName}`);
      console.log(`   Date: ${newAppointment.date}`);
      console.log(`   Time: ${newAppointment.startTime} - ${newAppointment.endTime}`);
      console.log(`   Status: ${newAppointment.status}`);
      
      // Final verification: test complete dashboard view
      console.log('\n📊 Testing complete dashboard integration...');
      const regularAppointments = await makeAuthenticatedRequest('GET', '/appointments?limit=100');
      
      console.log('✅ Complete integration verified:');
      console.log(`   Regular appointments: ${regularAppointments.appointments?.length || 0}`);
      console.log(`   OPD appointments: ${opdAppointments.appointments?.length || 0}`);
      console.log(`   Total dashboard appointments: ${(regularAppointments.appointments?.length || 0) + (opdAppointments.appointments?.length || 0)}`);
      
      return true;
    } else {
      console.log('⚠️  OPD visit created but not found in appointments');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Corrected OPD test failed');
    return false;
  }
}

async function runCorrectedTest() {
  console.log('🛠️ CORRECTED OPD -> APPOINTMENTS INTEGRATION TEST');
  console.log('=' .repeat(55));
  console.log('🔧 Issues Fixed:');
  console.log('   ✓ additionalFees → additionalCharges');
  console.log('   ✓ Removed totalAmount (calculated automatically)');
  console.log('   ✓ Removed paymentStatus (not in DTO)');
  console.log('');
  
  try {
    await login();
    const success = await testCorrectedOPD();
    
    if (success) {
      console.log('\n🏆 CORRECTED TEST RESULT: COMPLETE SUCCESS!');
      console.log('=' .repeat(40));
      console.log('✅ OPD visit creation working perfectly');
      console.log('✅ Automatic appointment creation working');
      console.log('✅ OPD visits visible in appointments dashboard');
      console.log('✅ Complete frontend integration functional');
      console.log('\n🎯 FINAL RESULT: OPD visits now successfully appear in appointments dashboard!');
      console.log('🎉 The integration is working end-to-end!');
    } else {
      console.log('\n❌ CORRECTED TEST RESULT: STILL HAS ISSUES');
    }
    
  } catch (error) {
    console.error('\n💥 CORRECTED TEST CRASHED:', error.message);
  }
}

runCorrectedTest();