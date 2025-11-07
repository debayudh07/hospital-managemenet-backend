async function testAppointmentStatus() {
  const baseUrl = 'http://localhost:5000';
  let authToken = null;
  
  try {
    // First, login to get authentication token
    console.log('� Logging in...');
    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'debayudh@gmail.com',
        password: 'Debayudh@04'
      })
    });
    
    console.log(`📡 Login response status: ${loginResponse.status}`);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      authToken = loginData.accessToken;
      console.log('✅ Login successful! Token obtained.');
      console.log('👤 User info:', {
        name: loginData.user?.firstName + ' ' + loginData.user?.lastName,
        email: loginData.user?.email,
        role: loginData.user?.role
      });
    } else {
      const errorData = await loginResponse.json().catch(() => ({ message: 'Login failed' }));
      console.log('❌ Login failed:', errorData.message);
      return;
    }
    
    // Now fetch appointments with proper authentication
    console.log('\n🔍 Fetching all appointments...');
    const response = await fetch(`${baseUrl}/appointments`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📡 Appointments response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📋 Appointments data structure:', Object.keys(data));
      
      if (data.appointments && data.appointments.length > 0) {
        console.log(`📊 Found ${data.appointments.length} appointments`);
        console.log('\n📝 First appointment details:');
        const firstApp = data.appointments[0];
        console.log({
          id: firstApp.id,
          patientName: firstApp.patientName,
          doctorName: firstApp.doctorName,
          status: firstApp.status,
          date: firstApp.date,
          startTime: firstApp.startTime
        });
        
        // Test status update on the first appointment
        if (firstApp.id) {
          console.log(`\n🔄 Testing status update for appointment: ${firstApp.id}`);
          const statusUpdateResponse = await fetch(`${baseUrl}/appointments/${firstApp.id}/status`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              status: 'IN_PROGRESS'
            })
          });
          
          console.log(`📡 Status update response: ${statusUpdateResponse.status}`);
          
          if (statusUpdateResponse.ok) {
            const updatedApp = await statusUpdateResponse.json();
            console.log('✅ Status update successful!');
            console.log('� Updated appointment status:', updatedApp.status);
          } else {
            const errorData = await statusUpdateResponse.json().catch(() => ({ message: 'Status update failed' }));
            console.log('❌ Status update failed:', errorData.message);
          }
        }
      } else {
        console.log('📭 No appointments found');
      }
    } else {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch appointments' }));
      console.log('❌ Failed to fetch appointments:', errorData.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAppointmentStatus();