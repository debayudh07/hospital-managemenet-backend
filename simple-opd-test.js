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

async function testSimpleOPD() {
  console.log('\n🧪 Testing Simple OPD Visit Creation...');
  
  try {
    // Get required IDs
    const doctors = await makeAuthenticatedRequest('GET', '/doctors?limit=1');
    const departments = await makeAuthenticatedRequest('GET', '/departments?limit=1');
    
    const selectedDoctor = doctors[0];
    const selectedDepartment = departments[0];
    
    console.log(`Using doctor: ${selectedDoctor.firstName} ${selectedDoctor.lastName} (${selectedDoctor.id})`);
    console.log(`Using department: ${selectedDepartment.name} (${selectedDepartment.id})`);
    
    // Create minimal but complete OPD visit (based on working test structure)
    const patientNumber = Math.floor(Math.random() * 1000);
    
    const simpleOPDVisit = {
      // Patient auto-creation data (exact structure from working test)
      patientData: {
        firstName: 'TestPatient',
        lastName: `${patientNumber}`,
        email: `testpatient${patientNumber}@test.com`,
        phone: `+91987654${String(patientNumber).padStart(4, '0')}`,
        dateOfBirth: '1990-01-15',
        gender: 'MALE',
        address: `${patientNumber} Test Street, Test City`,
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        emergencyContactName: 'Test Emergency',
        emergencyContactPhone: '+919876543999',
        emergencyContactRelationship: 'Friend',
        bloodGroup: 'O+',
        allergies: 'None',
        chronicConditions: 'None',
        currentMedications: 'None'
      },
      
      // Visit details (exact structure from working test)
      doctorId: selectedDoctor.id,
      departmentId: selectedDepartment.id,
      visitDate: new Date().toISOString().split('T')[0],
      visitTime: '15:30',
      visitType: 'OPD',
      appointmentMode: 'WALK_IN',
      referralSource: 'SELF',
      priority: 'NORMAL',
      status: 'PENDING',
      
      // Clinical information (required fields)
      chiefComplaint: 'Test complaint for integration testing',
      historyOfPresentIllness: 'Testing OPD visit creation and appointments integration',
      pastMedicalHistory: 'No significant medical history',
      familyHistory: 'No significant family history',
      socialHistory: 'Non-smoker, non-alcoholic',
      generalExamination: 'Patient appears well',
      systemicExamination: 'Normal examination findings',
      provisionalDiagnosis: 'Test diagnosis',
      finalDiagnosis: 'Integration test case',
      treatmentPlan: 'Follow up as needed',
      followUpDate: '2025-11-10',
      followUpInstructions: 'Return if symptoms persist',
      investigationRecommendations: 'None required',
      symptoms: 'No specific symptoms reported',
      notes: 'Created for testing appointments integration',
      isFollowUp: false,
      
      // Vitals (complete structure from working test)
      vitals: {
        bloodPressure: '120/80',
        heartRate: 75,
        temperature: 98.6,
        respiratoryRate: 16,
        oxygenSaturation: 99,
        weight: 70,
        height: 175,
        bmi: 23.0,
        notes: 'Normal vital signs'
      },
      
      // Billing (from working test)
      billing: {
        consultationFee: selectedDoctor.consultationFee || 500,
        additionalFees: 0,
        totalAmount: selectedDoctor.consultationFee || 500,
        paymentMethod: 'CASH',
        paymentStatus: 'PENDING',
        notes: 'Integration test payment'
      }
    };

    console.log('📝 Creating OPD visit with complete structure...');
    const result = await makeAuthenticatedRequest('POST', '/opd/visits', simpleOPDVisit);
    
    console.log('✅ SUCCESS! OPD visit created:');
    console.log(`   Visit ID: ${result.visitId}`);
    console.log(`   Patient: ${result.patient.firstName} ${result.patient.lastName}`);
    console.log(`   Doctor: ${result.doctor.firstName} ${result.doctor.lastName}`);
    console.log(`   Department: ${result.department?.name}`);
    
    // Verify it appears in appointments
    console.log('\n🔍 Checking appointments dashboard...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const opdAppointments = await makeAuthenticatedRequest('GET', '/appointments/opd-visits?limit=100');
    const newAppointment = opdAppointments.appointments.find(apt => 
      apt.notes && apt.notes.includes(result.visitId)
    );
    
    if (newAppointment) {
      console.log('✅ OPD visit found in appointments dashboard!');
      console.log(`   Appointment ID: ${newAppointment.id}`);
      console.log(`   Patient: ${newAppointment.patientName}`);
      console.log(`   Doctor: ${newAppointment.doctorName}`);
      console.log(`   Time: ${newAppointment.startTime} - ${newAppointment.endTime}`);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Simple OPD creation failed:', error.message);
    return null;
  }
}

async function runSimpleTest() {
  console.log('🧪 SIMPLE OPD CREATION TEST');
  console.log('=' .repeat(40));
  
  try {
    await login();
    const result = await testSimpleOPD();
    
    if (result) {
      console.log('\n🎉 SIMPLE TEST SUCCESS!');
      console.log('✓ OPD visit creation is working');
      console.log('✓ Integration with appointments is working');
    } else {
      console.log('\n❌ SIMPLE TEST FAILED!');
    }
    
  } catch (error) {
    console.error('\n💥 TEST CRASHED:', error.message);
  }
}

runSimpleTest();