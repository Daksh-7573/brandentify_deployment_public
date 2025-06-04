/**
 * Test script to debug profile update issues
 */

async function testProfileUpdate() {
  const baseUrl = 'http://localhost:3000/api';
  
  // Test data for updating user profile
  const updateData = {
    name: 'Test Name Updated',
    brandName: 'testbrand123',
    phoneNumber: '+1 555 123 4567',
    title: 'Test Title Updated',
    location: 'Test Location',
    industry: 'Technology',
    domain: 'Software Development',
    aboutMe: 'This is a test about me',
    lookingFor: 'job_opportunities'
  };

  console.log('Testing profile update with data:', updateData);

  try {
    // Test with numeric ID (2)
    console.log('\n=== Testing PUT /api/users/2 ===');
    const response1 = await fetch(`${baseUrl}/users/2`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    console.log('Response status:', response1.status);
    console.log('Response headers:', Object.fromEntries(response1.headers.entries()));
    
    if (response1.ok) {
      const result1 = await response1.json();
      console.log('Update successful:', result1);
    } else {
      const error1 = await response1.text();
      console.log('Update failed:', error1);
    }

    // Test with Firebase UID
    console.log('\n=== Testing PUT /api/users/Unvhj38FHSg36vbagvGL8MvDJuL2 ===');
    const response2 = await fetch(`${baseUrl}/users/Unvhj38FHSg36vbagvGL8MvDJuL2`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    console.log('Response status:', response2.status);
    console.log('Response headers:', Object.fromEntries(response2.headers.entries()));
    
    if (response2.ok) {
      const result2 = await response2.json();
      console.log('Update successful:', result2);
    } else {
      const error2 = await response2.text();
      console.log('Update failed:', error2);
    }

    // Verify the update by fetching the user
    console.log('\n=== Verifying update by fetching user ===');
    const fetchResponse = await fetch(`${baseUrl}/users/Unvhj38FHSg36vbagvGL8MvDJuL2`);
    
    if (fetchResponse.ok) {
      const userData = await fetchResponse.json();
      console.log('Current user data after update:');
      console.log('Name:', userData.name);
      console.log('Brand Name:', userData.brandName);
      console.log('Title:', userData.title);
      console.log('Location:', userData.location);
      console.log('Industry:', userData.industry);
      console.log('Domain:', userData.domain);
      console.log('About Me:', userData.aboutMe);
      console.log('Looking For:', userData.lookingFor);
    } else {
      console.log('Failed to fetch user data:', await fetchResponse.text());
    }

  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
testProfileUpdate();