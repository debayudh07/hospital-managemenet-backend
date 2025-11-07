async function debugAppointmentId() {
  const baseUrl = 'http://localhost:5000';
  const appointmentId = 'cmhjkyo4h0006et58x72nzv3j';
  let authToken = null;
  
  try {
    // Login first
    console.log('🔐 Logging in...');
    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'debayudh@gmail.com',
        password: 'Debayudh@04'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      authToken = loginData.accessToken;
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed');
      return;
    }
    
    // Test 1: Try to get the specific appointment by ID
    console.log(`\n🔍 Testing GET /appointments/${appointmentId}`);
    const getResponse = await fetch(`${baseUrl}/appointments/${appointmentId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    console.log(`📡 GET response status: ${getResponse.status}`);
    if (getResponse.ok) {
      const appointment = await getResponse.json();
      console.log('✅ Appointment found via GET:', {
        id: appointment.id,
        status: appointment.status,
        patientName: appointment.patientName
      });
    } else {
      const error = await getResponse.json().catch(() => ({ message: 'Unknown error' }));
      console.log('❌ GET failed:', error.message);
    }
    
    // Test 2: Try status update with different status values
    const statusesToTry = ['IN_PROGRESS', 'CHECKED_IN', 'COMPLETED'];
    
    for (const status of statusesToTry) {
      console.log(`\n🔄 Testing PATCH /appointments/${appointmentId}/status with status: ${status}`);
      const updateResponse = await fetch(`${baseUrl}/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      console.log(`📡 PATCH response status: ${updateResponse.status}`);
      if (updateResponse.ok) {
        const result = await updateResponse.json();
        console.log(`✅ Status update successful! New status: ${result.status}`);
        break; // Stop after first successful update
      } else {
        const error = await updateResponse.json().catch(() => ({ message: 'Unknown error' }));
        console.log(`❌ PATCH failed: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugAppointmentId();