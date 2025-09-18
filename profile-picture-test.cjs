#!/usr/bin/env node

/**
 * Profile Picture Upload Test Suite
 * Tests profile picture upload functionality across preview and live domains
 */

const https = require('https');
const http = require('http');

// Test Configuration
const TEST_CONFIG = {
  previewDomain: 'https://25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev',
  liveDomain: 'https://brandentifier.replit.app',
  testUserId: '1', // Using a basic test user ID
  
  // Small test image (1x1 pixel red PNG in base64 - valid but minimal for testing)
  testImageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
};

// Utility Functions
function makeRequest(url, method = 'GET', data = null, headers = {}) {
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
        'User-Agent': 'ProfilePictureTest/1.0',
        ...headers
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
            headers: res.headers,
            data: parsedData,
            rawData: responseData
          });
        } catch (parseError) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
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

// Test Cases
class ProfilePictureTests {
  constructor() {
    this.results = [];
  }

  log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  async runTest(testName, testFn) {
    this.log(`Starting test: ${testName}`);
    try {
      const result = await testFn();
      this.results.push({ test: testName, status: 'PASS', result });
      this.log(`✅ PASS: ${testName}`);
      return result;
    } catch (error) {
      this.results.push({ test: testName, status: 'FAIL', error: error.message });
      this.log(`❌ FAIL: ${testName} - ${error.message}`);
      throw error;
    }
  }

  async testHealthCheck(domain) {
    return await this.runTest(`Health check - ${domain}`, async () => {
      const response = await makeRequest(`${domain}/api/health`);
      if (response.statusCode !== 200) {
        throw new Error(`Health check failed with status ${response.statusCode}`);
      }
      return response;
    });
  }

  async testProfilePictureUpload(domain, userId) {
    return await this.runTest(`Profile picture upload - ${domain}`, async () => {
      const response = await makeRequest(
        `${domain}/api/users/${userId}`,
        'PUT',
        { photoURL: TEST_CONFIG.testImageBase64 }
      );

      if (response.statusCode !== 200 && response.statusCode !== 201) {
        throw new Error(`Upload failed with status ${response.statusCode}: ${response.rawData}`);
      }

      // Validate response structure
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response structure');
      }

      return response;
    });
  }

  async testProfilePictureRetrieval(domain, userId) {
    return await this.runTest(`Profile picture retrieval - ${domain}`, async () => {
      const response = await makeRequest(`${domain}/api/users/${userId}`);
      
      if (response.statusCode !== 200) {
        throw new Error(`Retrieval failed with status ${response.statusCode}`);
      }

      return response;
    });
  }

  async testEmptyPhotoURL(domain, userId) {
    return await this.runTest(`Empty photoURL handling - ${domain}`, async () => {
      const response = await makeRequest(
        `${domain}/api/users/${userId}`,
        'PUT',
        { photoURL: null }
      );

      if (response.statusCode !== 200 && response.statusCode !== 201) {
        throw new Error(`Empty photoURL test failed with status ${response.statusCode}`);
      }

      return response;
    });
  }

  async testInvalidImageData(domain, userId) {
    return await this.runTest(`Invalid image data handling - ${domain}`, async () => {
      const response = await makeRequest(
        `${domain}/api/users/${userId}`,
        'PUT',
        { photoURL: 'invalid-image-data' }
      );

      // This test should either succeed (if validation is lenient) or fail gracefully
      // We're testing that the system doesn't crash
      return response;
    });
  }

  compareResponses(response1, response2, testName) {
    this.log(`Comparing responses for: ${testName}`);
    
    const differences = [];

    // Compare status codes
    if (response1.statusCode !== response2.statusCode) {
      differences.push(`Status code: ${response1.statusCode} vs ${response2.statusCode}`);
    }

    // Compare data structure (if both have data)
    if (response1.data && response2.data) {
      const keys1 = Object.keys(response1.data);
      const keys2 = Object.keys(response2.data);
      
      const missingKeys = keys1.filter(key => !keys2.includes(key));
      const extraKeys = keys2.filter(key => !keys1.includes(key));
      
      if (missingKeys.length > 0) {
        differences.push(`Missing keys in second response: ${missingKeys.join(', ')}`);
      }
      if (extraKeys.length > 0) {
        differences.push(`Extra keys in second response: ${extraKeys.join(', ')}`);
      }

      // Compare photoURL field specifically
      if (response1.data.photoURL !== response2.data.photoURL) {
        differences.push(`photoURL field differs`);
      }
    }

    if (differences.length > 0) {
      this.log(`⚠️  Differences found in ${testName}:`);
      differences.forEach(diff => this.log(`   - ${diff}`));
    } else {
      this.log(`✅ No differences found in ${testName}`);
    }

    return differences;
  }

  async runFullTestSuite() {
    this.log('='.repeat(60));
    this.log('Profile Picture Upload Test Suite');
    this.log('='.repeat(60));

    try {
      // Test 1: Health checks
      const previewHealth = await this.testHealthCheck(TEST_CONFIG.previewDomain);
      const liveHealth = await this.testHealthCheck(TEST_CONFIG.liveDomain);

      // Test 2: Profile picture upload
      let previewUpload, liveUpload;
      try {
        previewUpload = await this.testProfilePictureUpload(TEST_CONFIG.previewDomain, TEST_CONFIG.testUserId);
        liveUpload = await this.testProfilePictureUpload(TEST_CONFIG.liveDomain, TEST_CONFIG.testUserId);
        this.compareResponses(previewUpload, liveUpload, 'Profile Picture Upload');
      } catch (error) {
        this.log(`Upload test failed: ${error.message}`);
      }

      // Test 3: Profile picture retrieval
      let previewGet, liveGet;
      try {
        previewGet = await this.testProfilePictureRetrieval(TEST_CONFIG.previewDomain, TEST_CONFIG.testUserId);
        liveGet = await this.testProfilePictureRetrieval(TEST_CONFIG.liveDomain, TEST_CONFIG.testUserId);
        this.compareResponses(previewGet, liveGet, 'Profile Picture Retrieval');
      } catch (error) {
        this.log(`Retrieval test failed: ${error.message}`);
      }

      // Test 4: Empty/null photoURL handling
      let previewEmpty, liveEmpty;
      try {
        previewEmpty = await this.testEmptyPhotoURL(TEST_CONFIG.previewDomain, TEST_CONFIG.testUserId);
        liveEmpty = await this.testEmptyPhotoURL(TEST_CONFIG.liveDomain, TEST_CONFIG.testUserId);
        this.compareResponses(previewEmpty, liveEmpty, 'Empty PhotoURL Handling');
      } catch (error) {
        this.log(`Empty photoURL test failed: ${error.message}`);
      }

      // Test 5: Invalid image data handling  
      let previewInvalid, liveInvalid;
      try {
        previewInvalid = await this.testInvalidImageData(TEST_CONFIG.previewDomain, TEST_CONFIG.testUserId);
        liveInvalid = await this.testInvalidImageData(TEST_CONFIG.liveDomain, TEST_CONFIG.testUserId);
        this.compareResponses(previewInvalid, liveInvalid, 'Invalid Image Data Handling');
      } catch (error) {
        this.log(`Invalid image data test failed: ${error.message}`);
      }

    } catch (error) {
      this.log(`Test suite failed: ${error.message}`);
    }

    // Summary
    this.log('='.repeat(60));
    this.log('Test Results Summary');
    this.log('='.repeat(60));
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    
    this.log(`Total tests: ${this.results.length}`);
    this.log(`Passed: ${passed}`);
    this.log(`Failed: ${failed}`);
    
    if (failed > 0) {
      this.log('\nFailed tests:');
      this.results.filter(r => r.status === 'FAIL').forEach(result => {
        this.log(`  - ${result.test}: ${result.error}`);
      });
    }

    return {
      total: this.results.length,
      passed,
      failed,
      results: this.results
    };
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new ProfilePictureTests();
  tester.runFullTestSuite().then(summary => {
    console.log('\n' + '='.repeat(60));
    console.log(`Final Result: ${summary.failed === 0 ? 'ALL TESTS PASSED' : `${summary.failed} TEST(S) FAILED`}`);
    console.log('='.repeat(60));
    process.exit(summary.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('Test suite crashed:', error);
    process.exit(1);
  });
}

module.exports = ProfilePictureTests;