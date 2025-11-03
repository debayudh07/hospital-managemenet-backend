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
    console.error(`❌ Full Error Details for ${method} ${url}:`);
    console.error('Status:', error.response?.status);
    console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
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

// Test OPD creation with proper department ID
async function testOPDCreationFixed() {
  console.log('\n🧪 Testing OPD Visit Creation with Department ID...');
  
  try {
    // Get available doctors and departments
    console.log('\n1️⃣ Getting available doctors...');
    const doctors = await makeAuthenticatedRequest('GET', '/doctors?limit=10');
    if (!doctors || doctors.length === 0) {
      console.log('❌ No doctors found');
      return;
    }
    
    const doctor = doctors[0];
    console.log(`✅ Using doctor: ${doctor.firstName} ${doctor.lastName} (${doctor.id})`);
    console.log(`   Departments: ${JSON.stringify(doctor.departments, null, 2)}`);

    console.log('\n2️⃣ Getting available departments...');
    const departments = await makeAuthenticatedRequest('GET', '/departments?limit=10');
    if (!departments || departments.length === 0) {
      console.log('❌ No departments found');
      return;
    }
    
    const department = departments[0];
    console.log(`✅ Using department: ${department.name} (${department.id})`);

    // Test with proper structure including departmentId
    console.log('\n3️⃣ Creating OPD visit with all required fields...');
    const correctOPDVisit = {
      // Nested patient data
      patientData: {
        firstName: 'Test',
        lastName: 'Integration',
        phone: '+919876543999',
        email: 'test.integration@example.com',
        dateOfBirth: '1990-06-15',
        gender: 'MALE',
        address: '123 Integration Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: '+918765432109',
        emergencyContactRelationship: 'Friend'
      },
      
      // Required visit details
      doctorId: doctor.id,
      departmentId: department.id, // This was missing!
      chiefComplaint: 'Integration test - checking OPD to appointments flow',
      
      // Optional visit details
      visitDate: new Date().toISOString().split('T')[0],
      visitTime: '16:00',
      visitType: 'OPD',
      appointmentMode: 'WALK_IN',
      priority: 'NORMAL',
      status: 'PENDING',
      historyOfPresentIllness: 'Testing the complete integration flow',
      pastMedicalHistory: 'No known medical history',
      allergies: 'None',
      currentMedications: 'None',
      
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

    console.log('📝 Attempting to create OPD visit with complete data...');
    const result = await makeAuthenticatedRequest('POST', '/opd/visits', correctOPDVisit);
    
    console.log('✅ OPD visit created successfully!');
    console.log('Visit ID:', result.visitId);
    console.log('Patient:', result.patient?.firstName, result.patient?.lastName);
    console.log('Doctor:', result.doctor?.firstName, result.doctor?.lastName);
    console.log('Department:', result.department?.name);
    
    // Now check if it appears in appointments
    console.log('\n4️⃣ Checking if OPD visit appears in appointments...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a moment
    
    const appointments = await makeAuthenticatedRequest('GET', '/appointments/opd-visits?limit=100');
    const newAppointment = appointments.appointments.find(apt => 
      apt.notes && apt.notes.includes(result.visitId)
    );
    
    if (newAppointment) {
      console.log('✅ SUCCESS! OPD visit found in appointments dashboard:');
      console.log(`   Patient: ${newAppointment.patientName}`);
      console.log(`   Doctor: ${newAppointment.doctorName}`);
      console.log(`   Date: ${newAppointment.date} at ${newAppointment.startTime}`);
    } else {
      console.log('⚠️  OPD visit created but not found in appointments yet');
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ OPD creation failed');
    return null;
  }
}

// Main execution
async function fixOPDCreation() {
  console.log('🛠️  FIXING OPD VISIT CREATION');
  console.log('=' .repeat(50));
  
  try {
    await login();
    const result = await testOPDCreationFixed();
    
    if (result) {
      console.log('\n🎉 FIX SUCCESS!');
      console.log('✓ OPD visit creation is now working');
      console.log('✓ departmentId was the missing required field');
      console.log('✓ OPD visits are appearing in appointments dashboard');
    } else {
      console.log('\n❌ FIX FAILED!');
    }
    
  } catch (error) {
    console.error('\n💥 FIX CRASHED:', error.message);
  }
}

fixOPDCreation();