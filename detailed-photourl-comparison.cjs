#!/usr/bin/env node

/**
 * Detailed PhotoURL Comparison Script
 * Analyzes the specific differences in photoURL values between domains
 */

const https = require('https');
const http = require('http');

const TEST_CONFIG = {
  previewDomain: 'https://25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev',
  liveDomain: 'https://brandentifier.replit.app',
  testUserId: '1',
  testImageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
};

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DetailedPhotoURLTest/1.0',
      }
    };

    if (data && typeof data === 'object') {
      data = JSON.stringify(data);
      requestOptions.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = client.request(requestOptions, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({
            statusCode: res.statusCode,
            data: parsedData,
            rawData: responseData
          });
        } catch (parseError) {
          resolve({
            statusCode: res.statusCode,
            data: null,
            rawData: responseData,
            parseError: parseError.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(data);
    }

    req.end();
  });
}

async function analyzePhotoURLDifferences() {
  console.log('='.repeat(80));
  console.log('DETAILED PHOTOURL COMPARISON ANALYSIS');
  console.log('='.repeat(80));

  // Test Case 1: Upload test image and compare exact values
  console.log('\n1. Testing Image Upload - PhotoURL Value Comparison');
  console.log('-'.repeat(60));
  
  try {
    const previewUpload = await makeRequest(
      `${TEST_CONFIG.previewDomain}/api/users/${TEST_CONFIG.testUserId}`,
      'PUT',
      { photoURL: TEST_CONFIG.testImageBase64 }
    );

    const liveUpload = await makeRequest(
      `${TEST_CONFIG.liveDomain}/api/users/${TEST_CONFIG.testUserId}`,
      'PUT',
      { photoURL: TEST_CONFIG.testImageBase64 }
    );

    console.log(`Preview Domain Response Status: ${previewUpload.statusCode}`);
    console.log(`Live Domain Response Status: ${liveUpload.statusCode}`);
    
    if (previewUpload.data && liveUpload.data) {
      console.log('\nPhotoURL Values:');
      console.log(`Preview photoURL: ${previewUpload.data.photoURL ? `"${previewUpload.data.photoURL.substring(0, 100)}..."` : 'null/undefined'}`);
      console.log(`Live photoURL: ${liveUpload.data.photoURL ? `"${liveUpload.data.photoURL.substring(0, 100)}..."` : 'null/undefined'}`);
      
      console.log('\nPhotoURL Lengths:');
      console.log(`Preview photoURL length: ${previewUpload.data.photoURL ? previewUpload.data.photoURL.length : 'N/A'}`);
      console.log(`Live photoURL length: ${liveUpload.data.photoURL ? liveUpload.data.photoURL.length : 'N/A'}`);
      
      console.log('\nPhotoURL Types:');
      console.log(`Preview photoURL type: ${typeof previewUpload.data.photoURL}`);
      console.log(`Live photoURL type: ${typeof liveUpload.data.photoURL}`);

      console.log('\nExact Values Match?', previewUpload.data.photoURL === liveUpload.data.photoURL);
    }
  } catch (error) {
    console.log(`Upload test failed: ${error.message}`);
  }

  // Test Case 2: Retrieve and compare current values
  console.log('\n2. Testing Retrieval - Current PhotoURL Values');
  console.log('-'.repeat(60));
  
  try {
    const previewGet = await makeRequest(`${TEST_CONFIG.previewDomain}/api/users/${TEST_CONFIG.testUserId}`);
    const liveGet = await makeRequest(`${TEST_CONFIG.liveDomain}/api/users/${TEST_CONFIG.testUserId}`);

    console.log(`Preview GET Status: ${previewGet.statusCode}`);
    console.log(`Live GET Status: ${liveGet.statusCode}`);
    
    if (previewGet.data && liveGet.data) {
      console.log('\nRetrieved PhotoURL Values:');
      console.log(`Preview photoURL: ${previewGet.data.photoURL ? `"${previewGet.data.photoURL.substring(0, 100)}..."` : 'null/undefined'}`);
      console.log(`Live photoURL: ${liveGet.data.photoURL ? `"${liveGet.data.photoURL.substring(0, 100)}..."` : 'null/undefined'}`);
      
      console.log('\nFull User Objects Comparison:');
      console.log('Preview user keys:', Object.keys(previewGet.data));
      console.log('Live user keys:', Object.keys(liveGet.data));
      
      // Check if they're the same user
      console.log('\nUser Identity Verification:');
      console.log(`Preview user ID: ${previewGet.data.id}`);
      console.log(`Live user ID: ${liveGet.data.id}`);
      console.log(`Preview user email: ${previewGet.data.email}`);
      console.log(`Live user email: ${liveGet.data.email}`);
      
      // Critical question: Are they accessing the same database?
      console.log('\nDatabase Connection Analysis:');
      console.log(`Same user ID? ${previewGet.data.id === liveGet.data.id}`);
      console.log(`Same email? ${previewGet.data.email === liveGet.data.email}`);
      console.log(`Same name? ${previewGet.data.name === liveGet.data.name}`);
    }
  } catch (error) {
    console.log(`Retrieval test failed: ${error.message}`);
  }

  // Test Case 3: Test with null value
  console.log('\n3. Testing NULL PhotoURL Handling');
  console.log('-'.repeat(60));
  
  try {
    const previewNull = await makeRequest(
      `${TEST_CONFIG.previewDomain}/api/users/${TEST_CONFIG.testUserId}`,
      'PUT',
      { photoURL: null }
    );

    const liveNull = await makeRequest(
      `${TEST_CONFIG.liveDomain}/api/users/${TEST_CONFIG.testUserId}`,
      'PUT',
      { photoURL: null }
    );

    console.log(`Preview NULL Status: ${previewNull.statusCode}`);
    console.log(`Live NULL Status: ${liveNull.statusCode}`);
    
    if (previewNull.data && liveNull.data) {
      console.log('\nNULL PhotoURL Handling:');
      console.log(`Preview photoURL (null): ${previewNull.data.photoURL} (type: ${typeof previewNull.data.photoURL})`);
      console.log(`Live photoURL (null): ${liveNull.data.photoURL} (type: ${typeof liveNull.data.photoURL})`);
      console.log(`NULL handling identical? ${previewNull.data.photoURL === liveNull.data.photoURL}`);
    }
  } catch (error) {
    console.log(`NULL test failed: ${error.message}`);
  }

  // Final Analysis
  console.log('\n' + '='.repeat(80));
  console.log('ANALYSIS SUMMARY');
  console.log('='.repeat(80));
  console.log('This comparison reveals the exact nature of photoURL differences');
  console.log('between the preview and live domains, helping identify if they are:');
  console.log('1. Using different databases');
  console.log('2. Processing data differently');  
  console.log('3. Having environment-specific configurations');
  console.log('='.repeat(80));
}

// Run the analysis
analyzePhotoURLDifferences().catch(error => {
  console.error('Analysis failed:', error);
  process.exit(1);
});