/**
 * Comprehensive OAuth Configuration and Authentication Flow Test Suite
 * 
 * This test suite validates all aspects of the OAuth implementation:
 * - OAuth URL generation and parameter validation
 * - Callback URL configuration and routing
 * - PKCE implementation
 * - State parameter security
 * - Redirect URI whitelist and domain validation
 * - Error handling scenarios
 * - Google OAuth scopes
 * - Cross-domain handling
 * - Configuration status endpoints
 * - Credential validation
 */

import crypto from 'crypto';
import { URL, URLSearchParams } from 'url';

// Test configuration
const TEST_CONFIG = {
  baseUrl: process.env.REPLIT_URL || 'http://localhost:5000',
  testDomains: [
    'localhost:5000',
    'brandentifier.replit.app',
    'brandentifier.com',
    'test-app.replit.app',
    '25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev'
  ],
  invalidDomains: [
    'malicious.com',
    'evil.example.com',
    'phishing-site.net'
  ]
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
  summary: {},
  issues: [],
  securityConcerns: []
};

/**
 * Utility function to make HTTP requests
 */
async function makeRequest(endpoint, options = {}) {
  const url = `${TEST_CONFIG.baseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Host': options.host || 'localhost:5000',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      redirect: 'manual' // Don't follow redirects for testing
    });
    
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }
    
    return {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
      url: response.url
    };
  } catch (error) {
    console.error(`Request failed for ${endpoint}:`, error.message);
    return {
      status: 0,
      error: error.message,
      data: null
    };
  }
}

/**
 * Test helper to record test results
 */
function recordTest(testName, passed, details = {}) {
  const result = {
    name: testName,
    passed,
    timestamp: new Date().toISOString(),
    details
  };
  
  testResults.tests.push(result);
  
  if (passed) {
    testResults.passed++;
    console.log(`✅ PASS: ${testName}`);
  } else {
    testResults.failed++;
    console.log(`❌ FAIL: ${testName}`);
    if (details.error) {
      console.log(`   Error: ${details.error}`);
    }
  }
  
  if (details.warning) {
    testResults.warnings++;
    console.log(`⚠️  WARNING: ${details.warning}`);
  }
  
  if (details.securityConcern) {
    testResults.securityConcerns.push({
      test: testName,
      concern: details.securityConcern,
      severity: details.severity || 'medium'
    });
  }
  
  return result;
}

/**
 * Test 1: OAuth Configuration Status Endpoint
 */
async function testOAuthConfigurationStatus() {
  console.log('\n🔍 Testing OAuth Configuration Status Endpoint...');
  
  try {
    const response = await makeRequest('/api/auth/oauth-config-status');
    
    // Test endpoint accessibility
    const endpointAccessible = response.status === 200;
    recordTest('OAuth Config Status Endpoint Accessible', endpointAccessible, {
      status: response.status,
      error: endpointAccessible ? null : `HTTP ${response.status}: ${response.statusText}`
    });
    
    if (!endpointAccessible) return;
    
    // Validate response structure
    const hasRequiredFields = response.data && 
      typeof response.data.valid === 'boolean' &&
      Array.isArray(response.data.errors) &&
      Array.isArray(response.data.warnings);
    
    recordTest('OAuth Config Status Response Structure', hasRequiredFields, {
      responseData: response.data,
      error: hasRequiredFields ? null : 'Missing required fields: valid, errors, warnings'
    });
    
    // Check for credential validation
    const credentialsValid = response.data.summary?.credentialsValid === true;
    recordTest('OAuth Credentials Validation', credentialsValid, {
      credentialsValid,
      environment: response.data.summary?.environment,
      warning: credentialsValid ? null : 'OAuth credentials may not be properly configured',
      securityConcern: credentialsValid ? null : 'Invalid OAuth credentials could prevent authentication'
    });
    
    // Check environment detection
    const hasEnvironment = response.data.summary?.environment;
    recordTest('Environment Detection', !!hasEnvironment, {
      environment: hasEnvironment,
      nodeEnv: response.data.summary?.nodeEnv,
      error: hasEnvironment ? null : 'Environment not properly detected'
    });
    
    // Store config status for other tests
    testResults.summary.oauthConfig = response.data;
    
  } catch (error) {
    recordTest('OAuth Configuration Status Test', false, {
      error: error.message
    });
  }
}

/**
 * Test 2: OAuth URL Generation and Parameter Validation
 */
async function testOAuthURLGeneration() {
  console.log('\n🔗 Testing OAuth URL Generation...');
  
  for (const domain of TEST_CONFIG.testDomains) {
    try {
      const response = await makeRequest('/api/auth/google/url', {
        method: 'POST',
        headers: {
          'Host': domain
        },
        body: {
          returnHost: domain
        }
      });
      
      // Test successful URL generation
      const urlGenerated = response.status === 200 && response.data && response.data.oauthUrl;
      recordTest(`OAuth URL Generation for ${domain}`, urlGenerated, {
        domain,
        status: response.status,
        hasOAuthUrl: !!response.data?.oauthUrl,
        redirectUri: response.data?.redirectUri,
        error: urlGenerated ? null : `Failed to generate OAuth URL: ${response.status}`
      });
      
      if (!urlGenerated) continue;
      
      // Parse and validate OAuth URL parameters
      const oauthUrl = new URL(response.data.oauthUrl);
      const params = new URLSearchParams(oauthUrl.search);
      
      // Test required OAuth parameters
      const requiredParams = ['client_id', 'redirect_uri', 'response_type', 'scope', 'state', 'code_challenge', 'code_challenge_method'];
      const missingParams = requiredParams.filter(param => !params.has(param));
      
      recordTest(`OAuth URL Required Parameters for ${domain}`, missingParams.length === 0, {
        domain,
        requiredParams,
        missingParams,
        allParams: Array.from(params.keys()),
        error: missingParams.length > 0 ? `Missing required parameters: ${missingParams.join(', ')}` : null
      });
      
      // Test PKCE implementation
      const hasCodeChallenge = params.has('code_challenge') && params.get('code_challenge').length > 0;
      const hasCodeChallengeMethod = params.get('code_challenge_method') === 'S256';
      
      recordTest(`PKCE Implementation for ${domain}`, hasCodeChallenge && hasCodeChallengeMethod, {
        domain,
        hasCodeChallenge,
        codeChallengeMethod: params.get('code_challenge_method'),
        codeChallengeLength: params.get('code_challenge')?.length,
        error: !(hasCodeChallenge && hasCodeChallengeMethod) ? 'PKCE parameters missing or incorrect' : null,
        securityConcern: !(hasCodeChallenge && hasCodeChallengeMethod) ? 'PKCE missing - OAuth flow vulnerable to authorization code interception' : null
      });
      
      // Test OAuth scopes
      const scopes = params.get('scope')?.split(' ') || [];
      const requiredScopes = ['openid', 'email', 'profile'];
      const missingScopeS = requiredScopes.filter(scope => !scopes.includes(scope));
      
      recordTest(`OAuth Scopes for ${domain}`, missingScopeS.length === 0, {
        domain,
        requestedScopes: scopes,
        requiredScopes,
        missingScopes: missingScopeS,
        error: missingScopeS.length > 0 ? `Missing required scopes: ${missingScopeS.join(', ')}` : null
      });
      
      // Test state parameter security
      const stateParam = params.get('state');
      const stateValid = stateParam && stateParam.length >= 20; // Minimum secure length
      
      recordTest(`OAuth State Parameter Security for ${domain}`, stateValid, {
        domain,
        hasState: !!stateParam,
        stateLength: stateParam?.length,
        error: !stateValid ? 'State parameter missing or too short' : null,
        securityConcern: !stateValid ? 'Weak state parameter - vulnerable to CSRF attacks' : null
      });
      
      // Test redirect URI validation
      const redirectUri = params.get('redirect_uri');
      const redirectUriValid = redirectUri && redirectUri.includes('/api/auth/google/callback');
      
      recordTest(`Redirect URI Format for ${domain}`, redirectUriValid, {
        domain,
        redirectUri,
        isValid: redirectUriValid,
        error: !redirectUriValid ? 'Invalid redirect URI format' : null
      });
      
    } catch (error) {
      recordTest(`OAuth URL Generation for ${domain}`, false, {
        domain,
        error: error.message
      });
    }
  }
}

/**
 * Test 3: Redirect URI Whitelist and Domain Validation
 */
async function testRedirectURIValidation() {
  console.log('\n🛡️ Testing Redirect URI Whitelist and Domain Validation...');
  
  // Test with invalid/malicious domains
  for (const invalidDomain of TEST_CONFIG.invalidDomains) {
    try {
      const response = await makeRequest('/api/auth/google/url', {
        method: 'POST',
        headers: {
          'Host': invalidDomain
        },
        body: {
          returnHost: invalidDomain
        }
      });
      
      // Should either reject invalid domains or use secure fallback
      const handledSecurely = response.status !== 200 || 
        (response.data?.redirectUri && !response.data.redirectUri.includes(invalidDomain));
      
      recordTest(`Invalid Domain Rejection for ${invalidDomain}`, handledSecurely, {
        domain: invalidDomain,
        status: response.status,
        redirectUri: response.data?.redirectUri,
        securityConcern: !handledSecurely ? `OAuth URL generated for invalid domain: ${invalidDomain}` : null,
        severity: 'high'
      });
      
    } catch (error) {
      // Errors are acceptable for invalid domains
      recordTest(`Invalid Domain Rejection for ${invalidDomain}`, true, {
        domain: invalidDomain,
        rejectedWithError: error.message
      });
    }
  }
}

/**
 * Test 4: OAuth Callback URL Configuration and Routing
 */
async function testOAuthCallbackRouting() {
  console.log('\n🔄 Testing OAuth Callback URL Configuration...');
  
  for (const domain of TEST_CONFIG.testDomains) {
    try {
      // Test callback endpoint accessibility (without valid parameters)
      const response = await makeRequest('/api/auth/google/callback', {
        headers: {
          'Host': domain
        }
      });
      
      // Should handle missing parameters gracefully (redirect with error)
      const handlesGracefully = response.status === 302 || response.status === 200;
      
      recordTest(`OAuth Callback Endpoint Accessible for ${domain}`, handlesGracefully, {
        domain,
        status: response.status,
        isRedirect: response.status === 302,
        location: response.headers.location,
        error: !handlesGracefully ? `Unexpected status: ${response.status}` : null
      });
      
      // Test error parameter handling
      const errorResponse = await makeRequest('/api/auth/google/callback?error=access_denied', {
        headers: {
          'Host': domain
        }
      });
      
      const handlesErrors = errorResponse.status === 302 && 
        errorResponse.headers.location?.includes('error=oauth_error');
      
      recordTest(`OAuth Error Handling for ${domain}`, handlesErrors, {
        domain,
        status: errorResponse.status,
        location: errorResponse.headers.location,
        handlesErrors
      });
      
    } catch (error) {
      recordTest(`OAuth Callback Test for ${domain}`, false, {
        domain,
        error: error.message
      });
    }
  }
}

/**
 * Test 5: State Parameter Security Validation
 */
async function testStateParameterSecurity() {
  console.log('\n🔐 Testing OAuth State Parameter Security...');
  
  const testCases = [
    { name: 'Missing State', query: '?code=test_code', expectedError: 'missing_params' },
    { name: 'Invalid State Format', query: '?code=test_code&state=invalid', expectedError: 'invalid_state' },
    { name: 'Missing Code', query: '?state=test_state', expectedError: 'missing_params' }
  ];
  
  for (const testCase of testCases) {
    try {
      const response = await makeRequest(`/api/auth/google/callback${testCase.query}`);
      
      const handledSecurely = response.status === 302 && 
        response.headers.location?.includes(`error=${testCase.expectedError}`);
      
      recordTest(`State Security - ${testCase.name}`, handledSecurely, {
        testCase: testCase.name,
        query: testCase.query,
        status: response.status,
        location: response.headers.location,
        expectedError: testCase.expectedError,
        securityConcern: !handledSecurely ? `Improper handling of ${testCase.name.toLowerCase()}` : null
      });
      
    } catch (error) {
      recordTest(`State Security - ${testCase.name}`, false, {
        testCase: testCase.name,
        error: error.message
      });
    }
  }
}

/**
 * Test 6: Session Exchange and Cross-Domain Handling
 */
async function testCrossDomainHandling() {
  console.log('\n🌐 Testing Cross-Domain Session Handling...');
  
  try {
    // Test session acceptance endpoint
    const response = await makeRequest('/auth/accept-session');
    
    // Should handle missing exchange code
    const handlesGracefully = response.status === 302 && 
      response.headers.location?.includes('error=missing_exchange_code');
    
    recordTest('Session Accept Endpoint - Missing Code', handlesGracefully, {
      status: response.status,
      location: response.headers.location,
      handlesGracefully
    });
    
    // Test invalid exchange code
    const invalidCodeResponse = await makeRequest('/auth/accept-session?code=invalid_code');
    
    const handlesInvalidCode = invalidCodeResponse.status === 302 && 
      invalidCodeResponse.headers.location?.includes('error=');
    
    recordTest('Session Accept Endpoint - Invalid Code', handlesInvalidCode, {
      status: invalidCodeResponse.status,
      location: invalidCodeResponse.headers.location,
      handlesInvalidCode
    });
    
  } catch (error) {
    recordTest('Cross-Domain Session Handling', false, {
      error: error.message
    });
  }
}

/**
 * Test 7: Session Status Checking
 */
async function testSessionStatus() {
  console.log('\n📊 Testing Session Status Endpoint...');
  
  try {
    const response = await makeRequest('/api/auth/session');
    
    // Should return session status (typically 401 for unauthenticated)
    const respondsCorrectly = response.status === 401 || response.status === 200;
    
    recordTest('Session Status Endpoint', respondsCorrectly, {
      status: response.status,
      data: response.data,
      respondsCorrectly
    });
    
    if (response.status === 401) {
      // Check error response format
      const hasProperErrorFormat = response.data && 
        (response.data.success === false || response.data.error);
      
      recordTest('Session Status Error Format', hasProperErrorFormat, {
        status: response.status,
        data: response.data,
        hasProperErrorFormat
      });
    }
    
  } catch (error) {
    recordTest('Session Status Test', false, {
      error: error.message
    });
  }
}

/**
 * Generate comprehensive test report
 */
function generateTestReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📋 OAUTH CONFIGURATION AND AUTHENTICATION FLOW TEST REPORT');
  console.log('='.repeat(80));
  
  console.log(`\n📊 TEST SUMMARY:`);
  console.log(`   Total Tests: ${testResults.tests.length}`);
  console.log(`   ✅ Passed: ${testResults.passed}`);
  console.log(`   ❌ Failed: ${testResults.failed}`);
  console.log(`   ⚠️  Warnings: ${testResults.warnings}`);
  console.log(`   🛡️  Security Concerns: ${testResults.securityConcerns.length}`);
  
  if (testResults.failed > 0) {
    console.log(`\n❌ FAILED TESTS:`);
    testResults.tests
      .filter(test => !test.passed)
      .forEach(test => {
        console.log(`   - ${test.name}`);
        if (test.details.error) {
          console.log(`     Error: ${test.details.error}`);
        }
      });
  }
  
  if (testResults.securityConcerns.length > 0) {
    console.log(`\n🛡️  SECURITY CONCERNS:`);
    testResults.securityConcerns.forEach(concern => {
      console.log(`   - [${concern.severity.toUpperCase()}] ${concern.test}`);
      console.log(`     ${concern.concern}`);
    });
  }
  
  console.log(`\n🔍 OAUTH CONFIGURATION STATUS:`);
  if (testResults.summary.oauthConfig) {
    const config = testResults.summary.oauthConfig.summary;
    console.log(`   Environment: ${config?.environment || 'Unknown'}`);
    console.log(`   Credentials Valid: ${config?.credentialsValid ? '✅' : '❌'}`);
    console.log(`   Scopes Valid: ${config?.scopesValid ? '✅' : '❌'}`);
    console.log(`   Redirect URIs: ${config?.redirectUriCount || 'Unknown'}`);
    console.log(`   Domain Patterns: ${config?.domainPatternCount || 'Unknown'}`);
    console.log(`   Current Host: ${config?.currentHost || 'Unknown'}`);
    console.log(`   Has JWT Secret: ${config?.hasJwtSecret ? '✅' : '❌'}`);
    console.log(`   Has CSRF Secret: ${config?.hasCsrfSecret ? '✅' : '❌'}`);
  }
  
  console.log(`\n🎯 RECOMMENDATIONS:`);
  
  if (testResults.failed > 0) {
    console.log(`   1. Address failed tests to ensure OAuth functionality works properly`);
  }
  
  if (testResults.securityConcerns.some(c => c.severity === 'high')) {
    console.log(`   2. CRITICAL: Address high-severity security concerns immediately`);
  }
  
  if (testResults.summary.oauthConfig?.summary?.credentialsValid === false) {
    console.log(`   3. Configure proper OAuth credentials in environment variables`);
  }
  
  if (!testResults.summary.oauthConfig?.summary?.hasJwtSecret) {
    console.log(`   4. Set JWT_SECRET environment variable for production`);
  }
  
  if (!testResults.summary.oauthConfig?.summary?.hasCsrfSecret) {
    console.log(`   5. Set CSRF_SECRET environment variable for production`);
  }
  
  console.log(`\n⏰ Test completed at: ${new Date().toISOString()}`);
  console.log('='.repeat(80));
  
  return testResults;
}

/**
 * Main test execution function
 */
async function runOAuthTestSuite() {
  console.log('🚀 Starting Comprehensive OAuth Configuration and Authentication Flow Test Suite...');
  console.log(`📍 Testing against: ${TEST_CONFIG.baseUrl}`);
  console.log(`🌐 Test domains: ${TEST_CONFIG.testDomains.join(', ')}`);
  
  try {
    // Run all test suites
    await testOAuthConfigurationStatus();
    await testOAuthURLGeneration();
    await testRedirectURIValidation();
    await testOAuthCallbackRouting();
    await testStateParameterSecurity();
    await testCrossDomainHandling();
    await testSessionStatus();
    
    // Generate final report
    return generateTestReport();
    
  } catch (error) {
    console.error('❌ Test suite execution failed:', error);
    return testResults;
  }
}

// Export for use in other scripts
export {
  runOAuthTestSuite,
  testResults,
  TEST_CONFIG
};

// Run tests if this script is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  runOAuthTestSuite()
    .then(results => {
      const hasFailures = results.failed > 0 || results.securityConcerns.some(c => c.severity === 'high');
      process.exit(hasFailures ? 1 : 0);
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}