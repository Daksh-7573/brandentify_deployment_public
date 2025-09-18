#!/usr/bin/env node

// Test script to trigger photoURL field filtering issue
import http from 'http';

// Test data with photoURL and name
const testData = {
  name: 'Debug Test User',
  photoURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wIChKQVZJREFNVEM0bnc='
};

// Function to make HTTP request
function makeRequest(method, path, data, port = 5000) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedBody = JSON.parse(body);
          resolve({ statusCode: res.statusCode, headers: res.headers, body: parsedBody });
        } catch (e) {
          resolve({ statusCode: res.statusCode, headers: res.headers, body: body });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function testPhotoURLUpdate() {
  console.log('🧪 Testing PhotoURL field persistence...\n');
  
  try {
    // First, let's test with a known user ID (using user ID 2 as suggested in the logs)
    console.log('📡 Making PUT request to update user profile...');
    console.log('Data being sent:', testData);
    
    const response = await makeRequest('PUT', '/api/users/2', testData);
    
    console.log('\n📊 Response received:');
    console.log('Status Code:', response.statusCode);
    console.log('Response Body:', response.body);
    
    if (response.body && response.body.photoURL) {
      console.log('✅ SUCCESS: photoURL persisted in response');
      console.log('PhotoURL value:', response.body.photoURL.substring(0, 50) + '...');
    } else {
      console.log('❌ FAILURE: photoURL missing from response');
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }
}

// Run the test
testPhotoURLUpdate();