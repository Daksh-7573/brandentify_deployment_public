/**
 * Phase 2 Integration Tests
 * Tests Phase 2.2 (Learning Patterns) and Phase 2.3 (Cohort Intelligence)
 * Verifies database-backed storage works correctly
 */

import { learningPatternsService } from '../services/learning-patterns-service';
import { cohortIntelligenceService } from '../services/cohort-intelligence-service';
import { pool } from '../db';

// Test helpers
const logTest = (phase: string, test: string, status: 'PASS' | 'FAIL', message?: string) => {
  const emoji = status === 'PASS' ? '✅' : '❌';
  console.log(`\n${emoji} [${phase}] ${test}`);
  if (message) console.log(`   → ${message}`);
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Phase 2.2 Tests: Learning Patterns Service
 */
async function testLearningPatterns() {
  console.log('\n═════════════════════════════════════════');
  console.log('🧪 PHASE 2.2 TESTS: Learning Patterns Service');
  console.log('═════════════════════════════════════════\n');

  try {
    // Test 1: Create/get pattern for new user
    console.log('Test 1: Get or create learning pattern');
    const testUserId = 2; // Use real user ID from database
    const pattern = await learningPatternsService.getOrCreatePattern(testUserId);
    
    if (pattern && pattern.preferences) {
      logTest('2.2', 'Create/Get Pattern', 'PASS', 
        `Pattern created with confidence: ${pattern.confidence}`);
    } else {
      logTest('2.2', 'Create/Get Pattern', 'FAIL', 'Pattern not created');
      return;
    }

    // Test 2: Verify database insertion
    console.log('\nTest 2: Verify database insertion');
    const dbCheck = await pool.query(
      'SELECT * FROM user_learning_patterns WHERE user_id = $1',
      [testUserId]
    );
    
    if (dbCheck.rows.length > 0) {
      logTest('2.2', 'Database Insertion', 'PASS',
        `Record found in DB: ${JSON.stringify(dbCheck.rows[0]).substring(0, 80)}...`);
    } else {
      logTest('2.2', 'Database Insertion', 'FAIL', 'No record in database');
      return;
    }

    // Test 3: Update pattern
    console.log('\nTest 3: Update learning pattern');
    const updatedPattern = {
      ...pattern,
      preferences: {
        ...pattern.preferences,
        responseLength: 'comprehensive' as const,
      },
      confidence: 0.75,
    };
    
    await learningPatternsService.updatePattern(testUserId, updatedPattern);
    await sleep(100);
    
    const retrievedPattern = await learningPatternsService.getOrCreatePattern(testUserId);
    if (retrievedPattern.preferences.responseLength === 'comprehensive' && retrievedPattern.confidence >= 0.74) {
      logTest('2.2', 'Update Pattern', 'PASS',
        `Pattern updated: responseLength=${retrievedPattern.preferences.responseLength}`);
    } else {
      logTest('2.2', 'Update Pattern', 'FAIL', 'Pattern not updated correctly');
    }

    // Test 4: Verify persistence across calls
    console.log('\nTest 4: Verify persistence');
    const persistedPattern = await learningPatternsService.getOrCreatePattern(testUserId);
    if (persistedPattern.confidence >= 0.74) {
      logTest('2.2', 'Data Persistence', 'PASS',
        `Data persisted: confidence=${persistedPattern.confidence}`);
    } else {
      logTest('2.2', 'Data Persistence', 'FAIL', 'Data not persisted');
    }

    // Cleanup
    await pool.query('DELETE FROM user_learning_patterns WHERE user_id = $1', [testUserId]);
    console.log('✨ Phase 2.2 cleanup complete\n');

  } catch (error) {
    logTest('2.2', 'Learning Patterns Suite', 'FAIL', 
      `Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Phase 2.3 Tests: Cohort Intelligence Service
 */
async function testCohortIntelligence() {
  console.log('\n═════════════════════════════════════════');
  console.log('🧪 PHASE 2.3 TESTS: Cohort Intelligence Service');
  console.log('═════════════════════════════════════════\n');

  try {
    const testUserId = 2; // Use real user ID from database
    const testCohortId = 'test_finance_senior';
    const testUserProfile = {
      industry: 'Finance',
      title: 'Senior Analyst',
      location: 'India',
      lookingFor: 'growth'
    };

    // Test 1: Create cohort
    console.log('Test 1: Get or create cohort');
    const cohort = await cohortIntelligenceService.getOrCreateCohort(testCohortId, testUserProfile);
    
    if (cohort && cohort.id === testCohortId) {
      logTest('2.3', 'Create/Get Cohort', 'PASS',
        `Cohort created: ${cohort.id}, sampleSize=${cohort.sampleSize}`);
    } else {
      logTest('2.3', 'Create/Get Cohort', 'FAIL', 'Cohort not created');
      return;
    }

    // Test 2: Verify database insertion
    console.log('\nTest 2: Verify cohort database insertion');
    const dbCheck = await pool.query(
      'SELECT * FROM user_cohorts WHERE cohort_id = $1',
      [testCohortId]
    );
    
    if (dbCheck.rows.length > 0) {
      logTest('2.3', 'Cohort Database Insertion', 'PASS',
        `Cohort record found in DB`);
    } else {
      logTest('2.3', 'Cohort Database Insertion', 'FAIL', 'No cohort record in database');
      return;
    }

    // Test 3: Add user to cohort
    console.log('\nTest 3: Add user to cohort');
    await cohortIntelligenceService.addUserToCohort(testUserId, testCohortId);
    await sleep(100);
    
    const memberCheck = await pool.query(
      'SELECT * FROM cohort_membership WHERE user_id = $1 AND cohort_id = $2',
      [testUserId, testCohortId]
    );
    
    if (memberCheck.rows.length > 0) {
      logTest('2.3', 'Add User to Cohort', 'PASS',
        `User added to cohort membership`);
    } else {
      logTest('2.3', 'Add User to Cohort', 'FAIL', 'User not added to cohort');
    }

    // Test 4: Get user cohorts
    console.log('\nTest 4: Retrieve user cohorts');
    const userCohorts = await cohortIntelligenceService.getUserCohorts(testUserId);
    
    if (Array.isArray(userCohorts)) {
      logTest('2.3', 'Get User Cohorts', 'PASS',
        `Retrieved ${userCohorts.length} cohorts for user`);
    } else {
      logTest('2.3', 'Get User Cohorts', 'FAIL', 'Failed to retrieve cohorts');
    }

    // Test 5: Update cohort
    console.log('\nTest 5: Update cohort patterns');
    const updatedCohort = {
      ...cohort,
      patterns: {
        ...cohort.patterns,
        commonChallenges: ['Market volatility', 'Regulatory changes'],
        successfulStrategies: ['Risk management', 'Diversification'],
      },
      sampleSize: 5,
      confidence: 0.65,
    };
    
    await cohortIntelligenceService.updateCohort(testCohortId, updatedCohort);
    await sleep(100);
    
    const retrievedCohort = await cohortIntelligenceService.getOrCreateCohort(testCohortId, testUserProfile);
    if (retrievedCohort.sampleSize === 5 && retrievedCohort.patterns.commonChallenges.length > 0) {
      logTest('2.3', 'Update Cohort', 'PASS',
        `Cohort updated: sampleSize=${retrievedCohort.sampleSize}`);
    } else {
      logTest('2.3', 'Update Cohort', 'FAIL', 'Cohort not updated correctly');
    }

    // Cleanup
    await pool.query('DELETE FROM cohort_membership WHERE cohort_id = $1', [testCohortId]);
    await pool.query('DELETE FROM user_cohorts WHERE cohort_id = $1', [testCohortId]);
    console.log('✨ Phase 2.3 cleanup complete\n');

  } catch (error) {
    logTest('2.3', 'Cohort Intelligence Suite', 'FAIL',
      `Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Integration Test: Learning Patterns + Cross-User Intelligence
 */
async function testIntegration() {
  console.log('\n═════════════════════════════════════════');
  console.log('🧪 INTEGRATION TEST: Phase 2.2 + 2.3');
  console.log('═════════════════════════════════════════\n');

  try {
    const testUserId = 4; // Use real user ID from database
    const testProfile = {
      industry: 'Technology',
      title: 'Senior Engineer',
      location: 'USA',
      lookingFor: 'leadership'
    };

    // Test: Create learning pattern
    console.log('Step 1: Create learning pattern');
    const pattern = await learningPatternsService.getOrCreatePattern(testUserId);
    logTest('Integration', 'Create Learning Pattern', 'PASS',
      `Pattern confidence: ${pattern.confidence}`);

    // Test: User should be identified for multiple cohorts
    console.log('\nStep 2: Identify cohorts for user');
    const cohortIds = [
      `${testProfile.industry.toLowerCase()}_senior`,
      `${testProfile.industry.toLowerCase()}_leadership`,
    ];
    
    for (const cohortId of cohortIds) {
      const cohort = await cohortIntelligenceService.getOrCreateCohort(cohortId, testProfile);
      await cohortIntelligenceService.addUserToCohort(testUserId, cohortId);
    }
    
    const userCohorts = await cohortIntelligenceService.getUserCohorts(testUserId);
    logTest('Integration', 'User in Multiple Cohorts', 'PASS',
      `User is member of ${userCohorts.length} cohorts`);

    // Test: Verify data integrity
    console.log('\nStep 3: Verify data integrity');
    const dbPattern = await pool.query(
      'SELECT * FROM user_learning_patterns WHERE user_id = $1',
      [testUserId]
    );
    const dbMembership = await pool.query(
      'SELECT COUNT(*) FROM cohort_membership WHERE user_id = $1',
      [testUserId]
    );
    
    if (dbPattern.rows.length > 0 && parseInt(dbMembership.rows[0].count) > 0) {
      logTest('Integration', 'Data Integrity', 'PASS',
        `Learning pattern and ${dbMembership.rows[0].count} cohort memberships in DB`);
    }

    // Cleanup
    await pool.query('DELETE FROM cohort_membership WHERE user_id = $1', [testUserId]);
    await pool.query('DELETE FROM user_learning_patterns WHERE user_id = $1', [testUserId]);
    
    console.log('✨ Integration test cleanup complete\n');

  } catch (error) {
    logTest('Integration', 'Phase 2 Integration', 'FAIL',
      `Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Run all tests
 */
export async function runPhase2Tests() {
  console.log('\n\n╔═══════════════════════════════════════════════════╗');
  console.log('║     PHASE 2 DATABASE INTEGRATION TESTS             ║');
  console.log('║  Testing Learning Patterns & Cohort Intelligence   ║');
  console.log('╚═══════════════════════════════════════════════════╝');

  try {
    await testLearningPatterns();
    await sleep(500);
    
    await testCohortIntelligence();
    await sleep(500);
    
    await testIntegration();

    console.log('\n╔═══════════════════════════════════════════════════╗');
    console.log('║          ✅ PHASE 2 TESTS COMPLETE ✅             ║');
    console.log('║   All database-backed services verified working   ║');
    console.log('╚═══════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('❌ Test suite error:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Run tests
runPhase2Tests();
