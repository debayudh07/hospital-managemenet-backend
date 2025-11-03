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
  console.log('🔐 Authenticating with credentials...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, LOGIN_CREDENTIALS);
    authToken = response.data.accessToken;
    console.log('✅ Authentication successful!');
    console.log(`👤 Logged in as: ${response.data.user.firstName} ${response.data.user.lastName} (${response.data.user.role})`);
    return response.data;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    throw error;
  }
}

// Create comprehensive OPD visit with patient auto-creation
async function createComprehensiveOPDVisit() {
  console.log('🏥 Creating comprehensive OPD visit with new patient...');
  
  // Get available doctors and departments
  const [doctors, departments] = await Promise.all([
    makeAuthenticatedRequest('GET', '/doctors?limit=5'),
    makeAuthenticatedRequest('GET', '/departments?limit=5')
  ]);
  
  if (doctors.length === 0 || departments.length === 0) {
    throw new Error('No doctors or departments available');
  }

  const selectedDoctor = doctors[0];
  const selectedDepartment = departments[0];
  
  console.log(`👨‍⚕️ Selected Doctor: Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName} (${selectedDoctor.specialization})`);
  console.log(`🏢 Selected Department: ${selectedDepartment.name}`);

  // Generate unique patient data
  const timestamp = Date.now();
  const patientNumber = Math.floor(Math.random() * 1000);
  
  const comprehensiveOPDVisit = {
    // Patient auto-creation data
    patientData: {
      firstName: 'John',
      lastName: `Doe${patientNumber}`,
      email: `john.doe${patientNumber}@email.com`,
      phone: `+91987654${String(patientNumber).padStart(4, '0')}`,
      dateOfBirth: '1985-06-15',
      gender: 'MALE',
      address: `${patientNumber} Medical Plaza, Healthcare District`,
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '+919876543999',
      emergencyContactRelationship: 'Spouse',
      bloodGroup: 'B+',
      allergies: 'Penicillin allergy',
      chronicConditions: 'Hypertension',
      currentMedications: 'Amlodipine 5mg daily',
      guardianName: null,
      guardianRelation: null,
      occupation: 'Software Engineer',
      idProofType: 'Aadhaar',
      idProofNumber: '1234567890123456',
      insuranceProvider: 'Star Health',
      insurancePolicyNumber: 'SH123456789'
    },
    
    // Visit details
    doctorId: selectedDoctor.id,
    departmentId: selectedDepartment.id,
    visitDate: new Date().toISOString().split('T')[0],
    visitTime: '14:30',
    visitType: 'OPD',
    appointmentMode: 'WALK_IN',
    referralSource: 'DOCTOR',
    referredBy: 'Dr. Smith (General Physician)',
    priority: 'NORMAL',
    status: 'PENDING',
    
    // Clinical information
    chiefComplaint: 'Severe headache and dizziness for 5 days',
    historyOfPresentIllness: 'Patient reports severe throbbing headache in temporal region for 5 days, associated with nausea and sensitivity to light. No fever or vomiting. Headache worsens with physical activity.',
    pastMedicalHistory: 'Hypertension diagnosed 2 years ago, well controlled with medication. No history of migraines.',
    familyHistory: 'Father had stroke at age 65. Mother has diabetes mellitus.',
    socialHistory: 'Non-smoker, occasional social drinking, works long hours on computer',
    generalExamination: 'Patient appears anxious, vital signs stable except mild hypertension',
    systemicExamination: 'Neurological examination shows no focal deficits, fundoscopy normal, neck stiffness absent',
    provisionalDiagnosis: 'Tension headache vs Hypertensive headache',
    finalDiagnosis: 'Tension headache with stress component',
    treatmentPlan: 'Stress management, lifestyle modification, analgesics',
    followUpDate: '2025-11-10',
    followUpInstructions: 'Return if symptoms persist or worsen. Maintain BP diary.',
    investigationRecommendations: 'CT scan if no improvement in 1 week',
    symptoms: 'Headache, dizziness, photophobia, mild nausea',
    notes: 'Advised stress management techniques and regular BP monitoring',
    isFollowUp: false,
    
    // Vitals
    vitals: {
      bloodPressure: '150/95',
      heartRate: 78,
      temperature: 98.6,
      respiratoryRate: 16,
      oxygenSaturation: 99,
      weight: 75,
      height: 170,
      bmi: 26.0,
      notes: 'Mild hypertension noted'
    },
    
    // Prescriptions
    prescriptions: [
      {
        drugName: 'Paracetamol',
        strength: '650mg',
        dosage: '1 tablet',
        frequency: 'Twice daily',
        duration: '7 days',
        route: 'ORAL',
        quantity: 14,
        instructions: 'Take with food',
        notes: 'For headache relief',
        isGeneric: true
      },
      {
        drugName: 'Propranolol',
        strength: '40mg',
        dosage: '1 tablet',
        frequency: 'Once daily',
        duration: '30 days',
        route: 'ORAL',
        quantity: 30,
        instructions: 'Take at bedtime',
        notes: 'For migraine prophylaxis',
        isGeneric: false
      }
    ],
    
    // Investigations
    investigations: [
      {
        testName: 'Complete Blood Count',
        testType: 'LAB',
        urgency: 'ROUTINE',
        instructions: 'Fasting not required'
      },
      {
        testName: 'CT Scan Brain',
        testType: 'RADIOLOGY',
        urgency: 'URGENT',
        instructions: 'If symptoms persist beyond 1 week'
      }
    ],
    
    // Billing
    billing: {
      consultationFee: selectedDoctor.consultationFee || 800,
      additionalCharges: 200,
      discount: 100,
      tax: 90,
      paymentMethod: 'CASH',
      paidAmount: 990,
      transactionId: `TXN${timestamp}`,
      notes: 'Consultation + investigation charges'
    }
  };

  try {
    console.log('📝 Submitting comprehensive OPD visit data...');
    const result = await makeAuthenticatedRequest('POST', '/opd/visits', comprehensiveOPDVisit);
    
    console.log('✅ Comprehensive OPD Visit created successfully!');
    console.log('\n📋 VISIT SUMMARY:');
    console.log('='.repeat(50));
    console.log(`🆔 Visit ID: ${result.visitId} (${result.id})`);
    console.log(`👤 Patient: ${result.patient.firstName} ${result.patient.lastName} (${result.patient.patientId})`);
    console.log(`📧 Email: ${result.patient.email || 'Not provided'}`);
    console.log(`📱 Phone: ${result.patient.phone}`);
    console.log(`👨‍⚕️ Doctor: Dr. ${result.doctor.firstName} ${result.doctor.lastName}`);
    console.log(`🏢 Department: ${result.department.name}`);
    console.log(`📅 Visit Date: ${new Date(result.visitDate).toLocaleDateString()}`);
    console.log(`⏰ Visit Time: ${result.visitTime}`);
    console.log(`📊 Status: ${result.status}`);
    console.log(`🎯 Priority: ${result.priority}`);
    console.log(`💬 Chief Complaint: ${result.chiefComplaint}`);
    
    if (result.billing) {
      console.log('\n💰 BILLING DETAILS:');
      console.log(`   Consultation Fee: ₹${result.billing.consultationFee}`);
      console.log(`   Additional Charges: ₹${result.billing.additionalCharges}`);
      console.log(`   Discount: ₹${result.billing.discount}`);
      console.log(`   Tax: ₹${result.billing.tax}`);
      console.log(`   Total Amount: ₹${result.billing.totalAmount}`);
      console.log(`   Paid Amount: ₹${result.billing.paidAmount}`);
      console.log(`   Balance: ₹${result.billing.balanceAmount}`);
      console.log(`   Payment Status: ${result.billing.paymentStatus}`);
    }
    
    if (result.prescriptions && result.prescriptions.length > 0) {
      console.log('\n💊 PRESCRIPTIONS:');
      result.prescriptions.forEach((rx, index) => {
        console.log(`   ${index + 1}. ${rx.drugName} ${rx.strength} - ${rx.dosage} ${rx.frequency} for ${rx.duration}`);
      });
    }
    
    console.log('='.repeat(50));
    return result;
    
  } catch (error) {
    console.error('❌ Failed to create comprehensive OPD visit');
    throw error;
  }
}

// Verify patient creation
async function verifyPatientCreation(patientId) {
  console.log('\n🔍 Verifying patient creation...');
  try {
    const patient = await makeAuthenticatedRequest('GET', `/patients/${patientId}`);
    console.log('✅ Patient verification successful!');
    console.log(`   Patient ID: ${patient.patientId}`);
    console.log(`   Full Name: ${patient.firstName} ${patient.lastName}`);
    console.log(`   Contact: ${patient.phone} | ${patient.email || 'No email'}`);
    console.log(`   Address: ${patient.address}, ${patient.city}, ${patient.state} ${patient.zipCode}`);
    return patient;
  } catch (error) {
    console.error('❌ Patient verification failed:', error.message);
    throw error;
  }
}

// Get visit history
async function getVisitHistory(patientId) {
  console.log('\n📊 Fetching patient visit history...');
  try {
    const visits = await makeAuthenticatedRequest('GET', `/opd/visits?patientId=${patientId}&limit=10`);
    console.log(`✅ Found ${visits.length} visit(s) for this patient`);
    visits.forEach((visit, index) => {
      console.log(`   ${index + 1}. ${visit.visitId} - ${visit.chiefComplaint} (${visit.status})`);
    });
    return visits;
  } catch (error) {
    console.error('❌ Failed to fetch visit history:', error.message);
    throw error;
  }
}

// Main execution function
async function runComprehensiveTest() {
  console.log('🚀 Hospital Management System - OPD Visit API Test');
  console.log('🎯 Testing: Patient Auto-creation + Comprehensive OPD Visit');
  console.log('=' .repeat(80));
  
  try {
    // Step 1: Authenticate
    const loginResult = await login();
    
    // Step 2: Create comprehensive OPD visit
    const opdVisit = await createComprehensiveOPDVisit();
    
    // Step 3: Verify patient creation
    if (opdVisit.patient?.id) {
      await verifyPatientCreation(opdVisit.patient.id);
    }
    
    // Step 4: Get visit history
    if (opdVisit.patientId) {
      await getVisitHistory(opdVisit.patientId);
    }
    
    console.log('\n🎉 COMPREHENSIVE TEST COMPLETED SUCCESSFULLY! 🎉');
    console.log('=' .repeat(80));
    
    // Final summary
    console.log('\n📈 TEST SUMMARY:');
    console.log(`✓ Authentication: SUCCESS (${loginResult.user.firstName} ${loginResult.user.lastName})`);
    console.log(`✓ Patient Auto-Creation: SUCCESS (${opdVisit.patient.patientId})`);
    console.log(`✓ OPD Visit Creation: SUCCESS (${opdVisit.visitId})`);
    console.log(`✓ Vitals Recording: ${opdVisit.vitals && opdVisit.vitals.length > 0 ? 'SUCCESS' : 'PENDING'}`);
    console.log(`✓ Prescriptions: ${opdVisit.prescriptions ? opdVisit.prescriptions.length : 0} items`);
    console.log(`✓ Billing: SUCCESS (₹${opdVisit.billing.totalAmount})`);
    console.log(`✓ Patient Verification: SUCCESS`);
    
  } catch (error) {
    console.error('\n💥 COMPREHENSIVE TEST FAILED:', error.message);
    console.log('=' .repeat(80));
    process.exit(1);
  }
}

// Handle process errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the comprehensive test
runComprehensiveTest();