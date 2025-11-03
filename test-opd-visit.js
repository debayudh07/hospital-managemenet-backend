const axios = require('axios');

// Base URL for the API
const BASE_URL = 'http://localhost:5000';

// Login credentials
const LOGIN_CREDENTIALS = {
  email: 'debayudh@gmail.com',
  password: 'Debayudh@04'
};

// Global variables
let authToken = '';
let doctorId = '';
let departmentId = '';

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
    console.error(`Error making ${method} request to ${url}:`, error.response?.data || error.message);
    throw error;
  }
};

// Step 1: Login and get authentication token
async function login() {
  console.log('🔐 Logging in...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, LOGIN_CREDENTIALS);
    console.log('Login response:', JSON.stringify(response.data, null, 2));
    
    // Try different possible token field names
    authToken = response.data.access_token || response.data.accessToken || response.data.token;
    
    if (!authToken) {
      throw new Error('No authentication token received. Response: ' + JSON.stringify(response.data));
    }
    
    console.log('✅ Login successful!');
    console.log('Token:', authToken.substring(0, 50) + '...');
    return response.data;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

// Step 2: Get available doctors
async function getDoctors() {
  console.log('👨‍⚕️ Fetching available doctors...');
  try {
    const doctors = await makeAuthenticatedRequest('GET', '/doctors?limit=10');
    console.log('✅ Available doctors:');
    doctors.forEach((doctor, index) => {
      console.log(`  ${index + 1}. Dr. ${doctor.firstName} ${doctor.lastName} (ID: ${doctor.id}) - ${doctor.specialization}`);
    });
    
    if (doctors.length > 0) {
      doctorId = doctors[0].id;
      console.log(`🎯 Selected Doctor ID: ${doctorId}`);
      return doctors[0];
    }
    throw new Error('No doctors available');
  } catch (error) {
    console.error('❌ Failed to fetch doctors:', error.response?.data || error.message);
    throw error;
  }
}

// Step 3: Get available departments
async function getDepartments() {
  console.log('🏥 Fetching available departments...');
  try {
    const departments = await makeAuthenticatedRequest('GET', '/departments?limit=10');
    console.log('✅ Available departments:');
    departments.forEach((dept, index) => {
      console.log(`  ${index + 1}. ${dept.name} (ID: ${dept.id})`);
    });
    
    if (departments.length > 0) {
      departmentId = departments[0].id;
      console.log(`🎯 Selected Department ID: ${departmentId}`);
      return departments[0];
    }
    throw new Error('No departments available');
  } catch (error) {
    console.error('❌ Failed to fetch departments:', error.response?.data || error.message);
    throw error;
  }
}

// Step 4: Create OPD visit with patient auto-creation
async function createOPDVisit() {
  console.log('📋 Creating OPD visit with new patient...');
  
  const opdVisitData = {
    // Patient data for auto-creation (no patientId provided, so it will auto-create)
    patientData: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phone: '+919876543210',
      dateOfBirth: '1990-01-15',
      gender: 'MALE',
      address: '123 Main Street, City Center',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '+919876543211',
      emergencyContactRelationship: 'Spouse',
      bloodGroup: 'O+',
      allergies: 'No known allergies',
      chronicConditions: 'None',
      currentMedications: 'None'
    },
    
    // Visit information
    doctorId: doctorId,
    departmentId: departmentId,
    visitDate: new Date().toISOString().split('T')[0], // Today's date
    visitTime: '10:30',
    visitType: 'NEW',
    appointmentMode: 'WALK_IN',
    referralSource: 'SELF',
    priority: 'NORMAL',
    status: 'SCHEDULED',
    
    // Clinical information
    chiefComplaint: 'Fever and headache for 3 days',
    historyOfPresentIllness: 'Patient complains of high fever (102°F) with severe headache and body aches for the past 3 days. No nausea or vomiting.',
    pastMedicalHistory: 'No significant past medical history',
    familyHistory: 'Father has diabetes, mother has hypertension',
    socialHistory: 'Non-smoker, occasional alcohol consumption',
    generalExamination: 'Patient appears ill, febrile',
    systemicExamination: 'CVS: Normal, RS: Clear, CNS: No focal deficits',
    provisionalDiagnosis: 'Viral fever',
    treatmentPlan: 'Symptomatic treatment with paracetamol and rest',
    followUpDate: '2025-11-07',
    followUpInstructions: 'Return if symptoms worsen or persist beyond 7 days',
    symptoms: 'Fever, headache, body aches',
    notes: 'Patient advised to maintain hydration and take adequate rest',
    isFollowUp: false,
    
    // Vitals
    vitals: {
      bloodPressure: '120/80',
      heartRate: 88,
      temperature: 102.2,
      respiratoryRate: 18,
      oxygenSaturation: 98,
      weight: 70,
      height: 175,
      bmi: 22.9,
      notes: 'Vitals stable except for fever'
    },
    
    // Prescriptions
    prescriptions: [
      {
        drugName: 'Paracetamol',
        strength: '500mg',
        dosage: '1 tablet',
        frequency: 'Three times daily',
        duration: '5 days',
        route: 'ORAL',
        quantity: 15,
        instructions: 'Take after meals',
        notes: 'For fever and body ache',
        isGeneric: true
      },
      {
        drugName: 'ORS',
        dosage: '1 sachet',
        frequency: 'As needed',
        duration: '5 days',
        route: 'ORAL',
        quantity: 10,
        instructions: 'Mix in 1 liter of water',
        notes: 'For hydration',
        isGeneric: true
      }
    ],
    
    // Investigations
    investigations: [
      {
        testName: 'Complete Blood Count (CBC)',
        testType: 'LAB',
        urgency: 'ROUTINE',
        instructions: 'Fasting not required'
      },
      {
        testName: 'Malaria Rapid Test',
        testType: 'LAB',
        urgency: 'ROUTINE',
        instructions: 'To rule out malaria'
      }
    ],
    
    // Billing
    billing: {
      consultationFee: 500,
      additionalCharges: 0,
      discount: 50,
      tax: 45,
      paymentMethod: 'CASH',
      paidAmount: 495,
      notes: 'Consultation fee with minor discount'
    }
  };

  try {
    const result = await makeAuthenticatedRequest('POST', '/opd/visits', opdVisitData);
    console.log('✅ OPD Visit created successfully!');
    console.log('📋 Visit Details:');
    console.log(`   Visit ID: ${result.id}`);
    console.log(`   Patient: ${result.patient?.firstName} ${result.patient?.lastName}`);
    console.log(`   Patient ID: ${result.patient?.id}`);
    console.log(`   Doctor: Dr. ${result.doctor?.firstName} ${result.doctor?.lastName}`);
    console.log(`   Department: ${result.department?.name}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Chief Complaint: ${result.chiefComplaint}`);
    console.log(`   Total Amount: ₹${result.billing?.totalAmount || 'N/A'}`);
    
    return result;
  } catch (error) {
    console.error('❌ Failed to create OPD visit:', error.response?.data || error.message);
    throw error;
  }
}

// Step 5: Verify the created patient
async function verifyPatient(patientId) {
  console.log('🔍 Verifying created patient...');
  try {
    const patient = await makeAuthenticatedRequest('GET', `/patients/${patientId}`);
    console.log('✅ Patient verification successful!');
    console.log('👤 Patient Details:');
    console.log(`   Name: ${patient.firstName} ${patient.lastName}`);
    console.log(`   Email: ${patient.email}`);
    console.log(`   Phone: ${patient.phone}`);
    console.log(`   DOB: ${patient.dateOfBirth}`);
    console.log(`   Address: ${patient.address}`);
    return patient;
  } catch (error) {
    console.error('❌ Failed to verify patient:', error.response?.data || error.message);
    throw error;
  }
}

// Main execution function
async function runTest() {
  console.log('🚀 Starting OPD Visit API Test');
  console.log('=' .repeat(50));
  
  try {
    // Step 1: Login
    const loginResult = await login();
    console.log('');
    
    // Step 2: Get doctors
    const selectedDoctor = await getDoctors();
    console.log('');
    
    // Step 3: Get departments
    const selectedDepartment = await getDepartments();
    console.log('');
    
    // Step 4: Create OPD visit
    const opdVisit = await createOPDVisit();
    console.log('');
    
    // Step 5: Verify patient (if patient ID is available)
    if (opdVisit.patient?.id) {
      await verifyPatient(opdVisit.patient.id);
    }
    
    console.log('');
    console.log('🎉 Test completed successfully!');
    console.log('=' .repeat(50));
    
    // Summary
    console.log('📊 SUMMARY:');
    console.log(`✓ Authentication: SUCCESS`);
    console.log(`✓ Doctor Selected: Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`);
    console.log(`✓ Department Selected: ${selectedDepartment.name}`);
    console.log(`✓ Patient Created: ${opdVisit.patient?.firstName} ${opdVisit.patient?.lastName}`);
    console.log(`✓ OPD Visit Created: ${opdVisit.id}`);
    console.log(`✓ Billing Amount: ₹${opdVisit.billing?.totalAmount || 'N/A'}`);
    
  } catch (error) {
    console.error('');
    console.error('💥 Test failed:', error.message);
    console.log('=' .repeat(50));
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the test
runTest();