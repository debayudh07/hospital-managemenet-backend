async function compareEndpoints() {
  const baseUrl = 'http://localhost:5000';
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
    
    // Get all appointments to see the actual data structure
    console.log('\n📋 Getting all appointments...');
    const listResponse = await fetch(`${baseUrl}/appointments`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (listResponse.ok) {
      const data = await listResponse.json();
      console.log(`✅ Found ${data.appointments.length} appointments in list`);
      
      if (data.appointments.length > 0) {
        const firstApp = data.appointments[0];
        console.log('\n📝 First appointment details from LIST endpoint:');
        console.log({
          id: firstApp.id,
          patientName: firstApp.patientName,
          doctorName: firstApp.doctorName,
          status: firstApp.status,
          date: firstApp.date,
          startTime: firstApp.startTime
        });
        
        // Now try to get this same appointment by ID
        console.log(`\n🔍 Testing GET /appointments/${firstApp.id} (INDIVIDUAL endpoint)`);
        const getResponse = await fetch(`${baseUrl}/appointments/${firstApp.id}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`📡 Individual GET response status: ${getResponse.status}`);
        if (getResponse.ok) {
          const individualApp = await getResponse.json();
          console.log('✅ Individual appointment found:');
          console.log({
            id: individualApp.id,
            patientName: individualApp.patientName,
            status: individualApp.status
          });
          
          // Now try the status update
          console.log(`\n🔄 Testing status update on ${individualApp.id}`);
          const updateResponse = await fetch(`${baseUrl}/appointments/${individualApp.id}/status`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'IN_PROGRESS' })
          });
          
          console.log(`📡 Status update response: ${updateResponse.status}`);
          if (updateResponse.ok) {
            const result = await updateResponse.json();
            console.log(`✅ Status update successful! New status: ${result.status}`);
          } else {
            const error = await updateResponse.json().catch(() => ({ message: 'Unknown error' }));
            console.log(`❌ Status update failed: ${error.message}`);
          }
          
        } else {
          const error = await getResponse.json().catch(() => ({ message: 'Unknown error' }));
          console.log(`❌ Individual GET failed: ${error.message}`);
          console.log('\n🔍 This suggests the issue is in the findOne method, not the list method');
        }
      }
    } else {
      console.log('❌ Failed to get appointments list');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

compareEndpoints();