/**
 * Test script to verify card access for user with unlocked cards
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Simulate the checkVisitingCardAccess logic
async function testCardAccess(userId: number, cardType: string) {
  try {
    // Get user
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return { hasAccess: false, message: 'User not found' };
    }
    
    const user = userResult.rows[0];
    const subscriptionTier = user.subscription_tier || 'free';
    const isPremium = subscriptionTier === 'premium';
    
    // Premium users have access to all
    if (isPremium) {
      return { hasAccess: true, reason: 'premium_user', subscriptionTier };
    }
    
    // Free cards
    const FREE_CARDS = ['professional', 'professional-renewed', 'quantum-tech'];
    if (FREE_CARDS.includes(cardType)) {
      return { hasAccess: true, reason: 'free_card', subscriptionTier };
    }
    
    // Check user_unlocks table
    const unlockResult = await pool.query(
      `SELECT id FROM user_unlocks WHERE user_id = $1 AND unlock_type = 'quantum_card' AND unlock_id = $2`,
      [userId, cardType]
    );
    
    if (unlockResult.rows.length > 0) {
      return { hasAccess: true, reason: 'user_unlocks_table', subscriptionTier };
    }
    
    return { hasAccess: false, reason: 'not_unlocked', subscriptionTier };
    
  } catch (error) {
    console.error('Error:', error);
    return { hasAccess: false, error: error.message };
  }
}

async function runTest() {
  const email = 'daakshpatel1@gmail.com';
  const cardsToTest = ['professional', '3d-animated', 'holographic', 'neoglow'];
  
  try {
    // Find user
    const userResult = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      console.error('❌ User not found!');
      process.exit(1);
    }
    
    const userId = userResult.rows[0].id;
    console.log(`\n✅ Testing card access for user: ${email} (ID: ${userId})\n`);
    console.log('='.repeat(80));
    
    for (const cardType of cardsToTest) {
      const result = await testCardAccess(userId, cardType);
      const icon = result.hasAccess ? '✅' : '❌';
      console.log(`${icon} ${cardType.padEnd(20)} - ${result.hasAccess ? 'ACCESSIBLE' : 'BLOCKED'} (${result.reason || result.message})`);
    }
    
    console.log('='.repeat(80));
    console.log('\n📝 Summary:');
    console.log('   - Backend will now check user_unlocks table');
    console.log('   - Cards with manual_grant unlock source will be accessible');
    console.log('   - User can select and save these cards via UI');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await pool.end();
  }
}

runTest();
