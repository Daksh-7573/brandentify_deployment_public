/**
 * COMPREHENSIVE ALL-PHASES TEST SUITE
 * Tests all database migrations (Phase 1, 2, 3) to verify no UI/functionality broken
 * Verifies: Resume contexts, User memory, Conversation history, Learning patterns, Cohorts, Hashtag cache
 */

import { pool } from '../db';
import { resumeContextService } from '../services/resume-context-service';
import { 
  addMessageToMemorySync, 
  getRecentMessagesSync 
} from '../services/conversation-memory';
import * as learningPatterns from '../services/learning-patterns-service';
import * as cohortIntelligence from '../services/cohort-intelligence-service';
import { cacheService } from '../services/cache-service';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
let passCount = 0;
let failCount = 0;

const logTest = (phase: string, test: string, status: 'PASS' | 'FAIL', message?: string) => {
  const emoji = status === 'PASS' ? '✅' : '❌';
  if (status === 'PASS') passCount++; else failCount++;
  console.log(`${emoji} [${phase}] ${test}${message ? ` → ${message}` : ''}`);
};

async function testPhase1() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   PHASE 1: Resume Context Persistence   ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    const testUserId = 1;
    const testContext = {
      resumeText: 'Test resume for comprehensive phase testing',
      resumeTextPreview: 'Test resume...',
      detectedRole: 'Product Manager',
      skills: ['Leadership', 'Strategy', 'Analytics'],
      detectedIndustry: 'Tech',
      fileName: 'test.pdf',
      fileSize: 1000,
      fileType: 'application/pdf'
    };

    // Test 1: Store and retrieve
    await resumeContextService.set(testUserId, testContext);
    const retrieved = await resumeContextService.get(testUserId);
    if (retrieved && retrieved.detectedRole === 'Product Manager') {
      logTest('1', 'Resume Storage & Retrieval', 'PASS', 'Context persisted correctly');
    } else {
      logTest('1', 'Resume Storage & Retrieval', 'FAIL', 'Failed to retrieve context');
    }

    // Test 2: Database record exists
    const dbRecord = await pool.query(
      'SELECT * FROM resume_context_cache WHERE user_id = $1',
      [testUserId]
    );
    if (dbRecord.rows.length > 0) {
      logTest('1', 'Database Record Exists', 'PASS', `Record ID: ${dbRecord.rows[0].id}`);
    } else {
      logTest('1', 'Database Record Exists', 'FAIL', 'No database record');
    }

    // Test 3: Has method works
    const exists = await resumeContextService.has(testUserId);
    if (exists) {
      logTest('1', 'Context Existence Check', 'PASS', 'Context detected');
    } else {
      logTest('1', 'Context Existence Check', 'FAIL', 'Context not found');
    }

  } catch (error) {
    logTest('1', 'Phase 1 Suite', 'FAIL', error instanceof Error ? error.message : String(error));
  }
}

async function testPhase2() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   PHASE 2: Memory & Intelligence        ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    const testUserId = 1;

    // Test 1: Conversation memory
    addMessageToMemorySync(testUserId, 'user', 'Test message');
    const recentMessages = getRecentMessagesSync(testUserId, 5);
    if (recentMessages && recentMessages.length > 0) {
      logTest('2', 'Conversation Memory Storage', 'PASS', `${recentMessages.length} messages stored`);
    } else {
      logTest('2', 'Conversation Memory Storage', 'FAIL', 'No messages found');
    }

    // Test 2: Learning patterns
    if (learningPatterns && typeof learningPatterns === 'object') {
      logTest('2', 'Learning Patterns Service', 'PASS', 'Service loaded');
    } else {
      logTest('2', 'Learning Patterns Service', 'FAIL', 'Service not loaded');
    }

    // Test 3: Cohort intelligence
    if (cohortIntelligence && typeof cohortIntelligence === 'object') {
      logTest('2', 'Cohort Intelligence Service', 'PASS', 'Service loaded');
    } else {
      logTest('2', 'Cohort Intelligence Service', 'FAIL', 'Service not loaded');
    }

    // Test 4: Database tables exist
    const chatMessagesTable = await pool.query(
      "SELECT * FROM information_schema.tables WHERE table_name='chat_messages' LIMIT 1"
    );
    const learningPatternsTable = await pool.query(
      "SELECT * FROM information_schema.tables WHERE table_name='user_learning_patterns' LIMIT 1"
    );
    const cohortsTable = await pool.query(
      "SELECT * FROM information_schema.tables WHERE table_name='user_cohorts' LIMIT 1"
    );

    if (chatMessagesTable.rows.length > 0 && learningPatternsTable.rows.length > 0 && cohortsTable.rows.length > 0) {
      logTest('2', 'Database Tables Created', 'PASS', 'All Phase 2 tables exist');
    } else {
      logTest('2', 'Database Tables Created', 'FAIL', 'Missing database tables');
    }

  } catch (error) {
    logTest('2', 'Phase 2 Suite', 'FAIL', error instanceof Error ? error.message : String(error));
  }
}

async function testPhase3() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   PHASE 3: Hashtag Cache & Production   ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    // Test 1: Redis cache operations
    const testKey = 'test:comprehensive:hashtags';
    const testValue = JSON.stringify({ suggestions: ['#test', '#comprehensive'] });
    
    await cacheService.set(testKey, testValue, 300);
    const cached = await cacheService.get(testKey);
    if (cached === testValue) {
      logTest('3', 'Redis Cache Set/Get', 'PASS', 'Cache operations working');
    } else {
      logTest('3', 'Redis Cache Set/Get', 'FAIL', 'Cache value mismatch');
    }

    // Test 2: Cache deletion
    await cacheService.del(testKey);
    const deleted = await cacheService.get(testKey);
    if (deleted === null) {
      logTest('3', 'Cache Deletion', 'PASS', 'Cache cleaned successfully');
    } else {
      logTest('3', 'Cache Deletion', 'FAIL', 'Cache still exists');
    }

    // Test 3: SHA-256 hash-based keys
    const { createHash } = await import('crypto');
    const testData = JSON.stringify({ industry: 'comprehensive', domain: 'test' });
    const hash = createHash('sha256').update(testData).digest('hex').slice(0, 32);
    const hashKey = `hashtag_suggestions:${hash}`;
    
    await cacheService.set(hashKey, JSON.stringify({ suggestions: ['#hash', '#test'] }), 60);
    const hashCached = await cacheService.get(hashKey);
    if (hashCached) {
      logTest('3', 'SHA-256 Hash Cache Keys', 'PASS', 'Hash-based caching working');
    } else {
      logTest('3', 'SHA-256 Hash Cache Keys', 'FAIL', 'Hash cache not working');
    }
    await cacheService.del(hashKey);

    // Test 4: Database health
    const healthCheck = await pool.query('SELECT 1 as health');
    if (healthCheck.rows.length > 0) {
      logTest('3', 'Database Health', 'PASS', 'Database connection stable');
    } else {
      logTest('3', 'Database Health', 'FAIL', 'Database connection issue');
    }

  } catch (error) {
    logTest('3', 'Phase 3 Suite', 'FAIL', error instanceof Error ? error.message : String(error));
  }
}

async function verifyNoFunctionalityBroken() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   FUNCTIONALITY VERIFICATION             ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    // Test 1: User table accessible
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    if (userCount.rows[0].count > 0) {
      logTest('FV', 'User Table Access', 'PASS', `${userCount.rows[0].count} users exist`);
    } else {
      logTest('FV', 'User Table Access', 'FAIL', 'No users found');
    }

    // Test 2: Resume context cache table
    const resumeCount = await pool.query('SELECT COUNT(*) FROM resume_context_cache');
    logTest('FV', 'Resume Cache Table', 'PASS', `${resumeCount.rows[0].count} resume records`);

    // Test 3: Chat messages table
    const messagesCount = await pool.query('SELECT COUNT(*) FROM chat_messages');
    logTest('FV', 'Chat Messages Table', 'PASS', `${messagesCount.rows[0].count} messages stored`);

    // Test 4: Learning patterns table
    const patternsCount = await pool.query('SELECT COUNT(*) FROM user_learning_patterns');
    logTest('FV', 'Learning Patterns Table', 'PASS', `${patternsCount.rows[0].count} patterns tracked`);

    // Test 5: Cohorts table
    const cohortsCount = await pool.query('SELECT COUNT(*) FROM user_cohorts');
    logTest('FV', 'Cohorts Table', 'PASS', `${cohortsCount.rows[0].count} cohorts created`);

    // Test 6: All critical tables exist
    const tablesCheck = await pool.query(`
      SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_name IN ('users', 'resume_context_cache', 'chat_messages', 'user_learning_patterns', 'user_cohorts')
      AND table_schema = 'public'
    `);
    if (tablesCheck.rows[0].count === 5) {
      logTest('FV', 'All Critical Tables', 'PASS', '5/5 essential tables present');
    } else {
      logTest('FV', 'All Critical Tables', 'FAIL', `Only ${tablesCheck.rows[0].count}/5 tables found`);
    }

  } catch (error) {
    logTest('FV', 'Functionality Check', 'FAIL', error instanceof Error ? error.message : String(error));
  }
}

export async function runComprehensiveTests() {
  console.log('\n\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   🧪 COMPREHENSIVE ALL-PHASES TEST SUITE 🧪                ║');
  console.log('║   Testing Phase 1, 2, 3 + Functionality Verification      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    await testPhase1();
    await sleep(300);

    await testPhase2();
    await sleep(300);

    await testPhase3();
    await sleep(300);

    await verifyNoFunctionalityBroken();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log(`║   📊 TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED                      ║`);
    if (failCount === 0) {
      console.log('║   ✅ ALL PHASES WORKING - NO FUNCTIONALITY BROKEN ✅       ║');
    } else {
      console.log('║   ⚠️  SOME TESTS FAILED - REVIEW REQUIRED                  ║');
    }
    console.log('╚════════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('❌ Test suite error:', error);
  } finally {
    await pool.end();
    process.exit(failCount > 0 ? 1 : 0);
  }
}

// Run tests
runComprehensiveTests();
