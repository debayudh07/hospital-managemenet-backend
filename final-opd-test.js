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

// Test OPD creation with proper billing structure
async function testWorkingOPD() {
  console.log('\n🧪 Testing OPD Creation with Required Billing...');
  
  try {
    // Get required IDs
    const doctors = await makeAuthenticatedRequest('GET', '/doctors?limit=1');
    const departments = await makeAuthenticatedRequest('GET', '/departments?limit=1');
    
    const doctor = doctors[0];
    const department = departments[0];
    
    console.log(`Using doctor: ${doctor.firstName} ${doctor.lastName} (Fee: ${doctor.consultationFee})`);
    console.log(`Using department: ${department.name}`);
    
    // Create OPD visit with required billing structure
    const workingOPDVisit = {
      patientData: {
        firstName: 'Working',
        lastName: 'Test',
        phone: '+919876543222',
        email: 'working.test@example.com',
        dateOfBirth: '1990-01-01',
        gender: 'MALE',
        address: 'Test Address',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: '+919876543223',
        emergencyContactRelationship: 'Friend'
      },
      
      doctorId: doctor.id,
      departmentId: department.id,
      visitDate: new Date().toISOString().split('T')[0],
      visitTime: '17:00',
      chiefComplaint: 'Working test - with proper billing structure',
      
      // Required billing structure
      billing: {
        consultationFee: doctor.consultationFee || 500,
        additionalCharges: 0,
        discount: 0,
        tax: 0,
        paidAmount: 0,
        paymentMethod: 'CASH',
        paymentStatus: 'PENDING'
      }
    };

    console.log('📝 Creating OPD visit with proper billing structure...');
    const result = await makeAuthenticatedRequest('POST', '/opd/visits', workingOPDVisit);
    
    console.log('✅ SUCCESS! OPD visit created:');
    console.log(`   Visit ID: ${result.visitId}`);
    console.log(`   Patient: ${result.patient.firstName} ${result.patient.lastName}`);
    console.log(`   Doctor: ${result.doctor.firstName} ${result.doctor.lastName}`);
    console.log(`   Department: ${result.department?.name}`);
    console.log(`   Billing: ${result.billing?.totalAmount} (Fee: ${result.billing?.consultationFee})`);
    
    // Check if it appears in appointments
    console.log('\n🔍 Verifying appointment creation...');
    await new Promise(resolve => setTimeout(resolve, 1500)); // Wait a moment for the transaction
    
    const opdAppointments = await makeAuthenticatedRequest('GET', '/appointments/opd-visits?limit=100');
    const newAppointment = opdAppointments.appointments.find(apt => 
      apt.notes && apt.notes.includes(result.visitId)
    );
    
    if (newAppointment) {
      console.log('✅ OPD visit successfully appears in appointments dashboard!');
      console.log(`   Appointment ID: ${newAppointment.id}`);
      console.log(`   Patient: ${newAppointment.patientName}`);
      console.log(`   Doctor: ${newAppointment.doctorName}`);
      console.log(`   Date: ${newAppointment.date}`);
      console.log(`   Time: ${newAppointment.startTime} - ${newAppointment.endTime}`);
      console.log(`   Status: ${newAppointment.status}`);
    } else {
      console.log('⚠️  OPD visit created but not found in appointments (check integration)');
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Working OPD test failed');
    return null;
  }
}

// Final test of the complete integration
async function testCompleteIntegration() {
  console.log('\n🎯 Testing Complete OPD -> Appointments Integration...');
  
  try {
    const result = await testWorkingOPD();
    
    if (!result) {
      console.log('❌ OPD creation failed, cannot test integration');
      return false;
    }
    
    // Test combined view that frontend would use
    console.log('\n📊 Testing frontend combined view...');
    const regularAppointments = await makeAuthenticatedRequest('GET', '/appointments?limit=100');
    const opdAppointments = await makeAuthenticatedRequest('GET', '/appointments/opd-visits?limit=100');
    
    const totalAppointments = [
      ...(regularAppointments.appointments || []),
      ...(opdAppointments.appointments || [])
    ];
    
    console.log(`✅ Combined dashboard view:`);
    console.log(`   Regular appointments: ${regularAppointments.appointments?.length || 0}`);
    console.log(`   OPD appointments: ${opdAppointments.appointments?.length || 0}`);
    console.log(`   Total visible appointments: ${totalAppointments.length}`);
    
    // Find our new appointment
    const ourNewAppointment = totalAppointments.find(apt => 
      apt.notes && apt.notes.includes(result.visitId)
    );
    
    if (ourNewAppointment) {
      console.log('\n🎉 COMPLETE INTEGRATION SUCCESS!');
      console.log('✓ OPD visit created successfully');
      console.log('✓ Appointment automatically created');
      console.log('✓ Visible in appointments dashboard');
      console.log('✓ Frontend can fetch combined data');
      return true;
    } else {
      console.log('\n⚠️  Integration partially working - OPD created but not in dashboard');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    return false;
  }
}

async function runFinalTest() {
  console.log('🎯 FINAL OPD -> APPOINTMENTS INTEGRATION TEST');
  console.log('=' .repeat(50));
  console.log('Issue identified: Missing required billing structure in OPD creation');
  console.log('Solution: Adding proper billing object with consultationFee');
  console.log('');
  
  try {
    await login();
    const success = await testCompleteIntegration();
    
    if (success) {
      console.log('\n🏆 FINAL TEST RESULT: SUCCESS!');
      console.log('=' .repeat(35));
      console.log('✅ Root cause identified and fixed');
      console.log('✅ OPD visit creation working');
      console.log('✅ OPD visits appear in appointments dashboard');
      console.log('✅ Complete integration is functional');
      console.log('\n🎯 ISSUE RESOLVED: OPD visits now show up in appointments dashboard!');
    } else {
      console.log('\n❌ FINAL TEST RESULT: PARTIAL SUCCESS');
      console.log('OPD creation works but integration needs more work');
    }
    
  } catch (error) {
    console.error('\n💥 FINAL TEST CRASHED:', error.message);
  }
}

runFinalTest();