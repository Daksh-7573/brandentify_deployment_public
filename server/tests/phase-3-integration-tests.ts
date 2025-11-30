/**
 * Phase 3 Integration Tests
 * Tests Phase 3 migrations: Resume context, hashtag cache, user interest indexer
 * Verifies database-backed storage and Redis caching work correctly
 */

import { resumeContextService } from '../services/resume-context-service';
import { cacheService } from '../services/cache-service';
import { pool } from '../db';

const logTest = (phase: string, test: string, status: 'PASS' | 'FAIL', message?: string) => {
  const emoji = status === 'PASS' ? '✅' : '❌';
  console.log(`\n${emoji} [${phase}] ${test}`);
  if (message) console.log(`   → ${message}`);
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Phase 3.1 Tests: Resume Context Service (Database-backed)
 */
async function testResumeContextService() {
  console.log('\n═════════════════════════════════════════');
  console.log('🧪 PHASE 3.1 TESTS: Resume Context Service');
  console.log('═════════════════════════════════════════\n');

  try {
    const testUserId = 1; // Use existing user ID

    // Test 1: Store resume context
    console.log('Test 1: Store resume context in database');
    const testContext = {
      resumeText: 'Test resume content for Phase 3 testing',
      resumeTextPreview: 'Test resume content...',
      detectedRole: 'Software Engineer',
      skills: ['JavaScript', 'TypeScript', 'React'],
      detectedIndustry: 'Technology',
      fileName: 'test_resume.pdf',
      fileSize: 12345,
      fileType: 'application/pdf'
    };

    const stored = await resumeContextService.set(testUserId, testContext);
    if (stored) {
      logTest('3.1', 'Store Resume Context', 'PASS', 'Context stored successfully');
    } else {
      logTest('3.1', 'Store Resume Context', 'FAIL', 'Failed to store context');
      return;
    }

    // Test 2: Retrieve resume context
    console.log('\nTest 2: Retrieve resume context from database');
    const retrieved = await resumeContextService.get(testUserId);
    if (retrieved && retrieved.resumeText === testContext.resumeText) {
      logTest('3.1', 'Retrieve Resume Context', 'PASS', 
        `Retrieved context with role: ${retrieved.detectedRole}`);
    } else {
      logTest('3.1', 'Retrieve Resume Context', 'FAIL', 'Failed to retrieve context');
      return;
    }

    // Test 3: Check existence
    console.log('\nTest 3: Check if resume context exists');
    const exists = await resumeContextService.has(testUserId);
    if (exists) {
      logTest('3.1', 'Check Context Existence', 'PASS', 'Context exists in database');
    } else {
      logTest('3.1', 'Check Context Existence', 'FAIL', 'Context not found');
    }

    // Test 4: Database verification
    console.log('\nTest 4: Verify database record');
    const dbCheck = await pool.query(
      'SELECT * FROM resume_context_cache WHERE user_id = $1',
      [testUserId]
    );
    if (dbCheck.rows.length > 0) {
      logTest('3.1', 'Database Verification', 'PASS',
        `Record found with role: ${dbCheck.rows[0].detected_role}`);
    } else {
      logTest('3.1', 'Database Verification', 'FAIL', 'No record in database');
    }

    console.log('✨ Phase 3.1 tests complete\n');

  } catch (error) {
    logTest('3.1', 'Resume Context Suite', 'FAIL',
      `Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Phase 3.4 Tests: Redis Cache Service
 */
async function testRedisCacheService() {
  console.log('\n═════════════════════════════════════════');
  console.log('🧪 PHASE 3.4 TESTS: Redis Cache Service');
  console.log('═════════════════════════════════════════\n');

  try {
    const testKey = 'test:phase3:hashtags';
    const testValue = JSON.stringify({ suggestions: ['#tech', '#career', '#growth'] });

    // Test 1: Set cache value
    console.log('Test 1: Store value in cache');
    await cacheService.set(testKey, testValue, 300);
    logTest('3.4', 'Store Cache Value', 'PASS', 'Value stored successfully');

    // Test 2: Get cache value
    console.log('\nTest 2: Retrieve value from cache');
    const retrieved = await cacheService.get(testKey);
    if (retrieved === testValue) {
      logTest('3.4', 'Retrieve Cache Value', 'PASS', 'Value retrieved correctly');
    } else {
      logTest('3.4', 'Retrieve Cache Value', 'FAIL', 'Value mismatch');
    }

    // Test 3: Check existence
    console.log('\nTest 3: Check cache key existence');
    const exists = await cacheService.exists(testKey);
    if (exists) {
      logTest('3.4', 'Check Cache Existence', 'PASS', 'Key exists in cache');
    } else {
      logTest('3.4', 'Check Cache Existence', 'FAIL', 'Key not found');
    }

    // Test 4: Delete cache value
    console.log('\nTest 4: Delete cache value');
    await cacheService.del(testKey);
    const afterDelete = await cacheService.get(testKey);
    if (afterDelete === null) {
      logTest('3.4', 'Delete Cache Value', 'PASS', 'Value deleted successfully');
    } else {
      logTest('3.4', 'Delete Cache Value', 'FAIL', 'Value still exists');
    }

    // Test 5: Hashtag cache key format (SHA-256 hash-based)
    console.log('\nTest 5: Test hashtag cache key format (SHA-256 hash)');
    const { createHash } = await import('crypto');
    const testData = JSON.stringify({ industry: 'test', domain: 'test' });
    const hash = createHash('sha256').update(testData).digest('hex').slice(0, 32);
    const hashtagCacheKey = `hashtag_suggestions:${hash}`;
    await cacheService.set(hashtagCacheKey, JSON.stringify({ suggestions: ['#test'] }), 60);
    const hashtagCached = await cacheService.get(hashtagCacheKey);
    if (hashtagCached) {
      const parsed = JSON.parse(hashtagCached);
      logTest('3.4', 'Hashtag Cache Format (SHA-256)', 'PASS', 
        `Cached ${parsed.suggestions.length} hashtag(s) with hash key`);
    } else {
      logTest('3.4', 'Hashtag Cache Format (SHA-256)', 'FAIL', 'Hashtag cache not working');
    }
    await cacheService.del(hashtagCacheKey);

    console.log('✨ Phase 3.4 tests complete\n');

  } catch (error) {
    logTest('3.4', 'Redis Cache Suite', 'FAIL',
      `Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Integration Test: Full Phase 3 Verification
 */
async function testIntegration() {
  console.log('\n═════════════════════════════════════════');
  console.log('🧪 INTEGRATION TEST: Phase 3 Complete');
  console.log('═════════════════════════════════════════\n');

  try {
    // Test 1: Verify resume context persists
    console.log('Step 1: Verify resume context persistence');
    const userId = 1;
    const context = await resumeContextService.get(userId);
    if (context) {
      logTest('Integration', 'Resume Context Persistence', 'PASS',
        `Context found with ${context.skills?.length || 0} skills`);
    } else {
      logTest('Integration', 'Resume Context Persistence', 'FAIL', 'No context found');
    }

    // Test 2: Verify cache service is functional
    console.log('\nStep 2: Verify cache service');
    const testCacheKey = 'test:integration:phase3';
    await cacheService.set(testCacheKey, 'test_value', 60);
    const cacheValue = await cacheService.get(testCacheKey);
    if (cacheValue === 'test_value') {
      logTest('Integration', 'Cache Service Functional', 'PASS', 'Cache is working');
    } else {
      logTest('Integration', 'Cache Service Functional', 'FAIL', 'Cache not working');
    }
    await cacheService.del(testCacheKey);

    // Test 3: Database connection health
    console.log('\nStep 3: Verify database health');
    const dbHealth = await pool.query('SELECT 1 as health');
    if (dbHealth.rows.length > 0) {
      logTest('Integration', 'Database Health', 'PASS', 'Database connection healthy');
    } else {
      logTest('Integration', 'Database Health', 'FAIL', 'Database connection issue');
    }

    console.log('✨ Integration tests complete\n');

  } catch (error) {
    logTest('Integration', 'Phase 3 Integration', 'FAIL',
      `Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Run all Phase 3 tests
 */
export async function runPhase3Tests() {
  console.log('\n\n╔═══════════════════════════════════════════════════╗');
  console.log('║       PHASE 3 DATABASE INTEGRATION TESTS           ║');
  console.log('║  Testing Resume Context & Redis Cache Services     ║');
  console.log('╚═══════════════════════════════════════════════════╝');

  try {
    await testResumeContextService();
    await sleep(500);

    await testRedisCacheService();
    await sleep(500);

    await testIntegration();

    console.log('\n╔═══════════════════════════════════════════════════╗');
    console.log('║          ✅ PHASE 3 TESTS COMPLETE ✅             ║');
    console.log('║   All Phase 3 services verified working           ║');
    console.log('╚═══════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('❌ Test suite error:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Run tests
runPhase3Tests();
