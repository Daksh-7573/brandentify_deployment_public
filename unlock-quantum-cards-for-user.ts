/**
 * Script to unlock the first 2 Quantum Cards for a specific user
 * User: daakshpatel1@gmail.com
 * Cards: 3d-animated, holographic
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function unlockQuantumCards() {
  const userEmail = 'daakshpatel1@gmail.com';
  const cardsToUnlock = ['3d-animated', 'holographic'];
  
  try {
    console.log(`\n🔍 Finding user: ${userEmail}...`);
    
    // Step 1: Find the user
    const userResult = await pool.query(
      'SELECT id, email, username FROM users WHERE email = $1',
      [userEmail]
    );
    
    if (userResult.rows.length === 0) {
      console.error(`❌ Error: User with email "${userEmail}" not found!`);
      process.exit(1);
    }
    
    const user = userResult.rows[0];
    console.log(`✅ User found: ID=${user.id}, Username=${user.username}`);
    
    // Step 2: Check existing unlocks
    const existingUnlocksResult = await pool.query(
      `SELECT unlock_id FROM user_unlocks 
       WHERE user_id = $1 AND unlock_type = 'quantum_card'`,
      [user.id]
    );
    
    const existingUnlocks = existingUnlocksResult.rows.map(row => row.unlock_id);
    console.log(`\n📊 Current unlocks: ${existingUnlocks.length > 0 ? existingUnlocks.join(', ') : 'None'}`);
    
    // Step 3: Unlock cards
    console.log(`\n🔓 Unlocking cards...`);
    
    for (const cardId of cardsToUnlock) {
      if (existingUnlocks.includes(cardId)) {
        console.log(`⏩ Card "${cardId}" is already unlocked`);
        continue;
      }
      
      await pool.query(
        `INSERT INTO user_unlocks (user_id, unlock_type, unlock_id, unlock_source)
         VALUES ($1, 'quantum_card', $2, 'manual_grant')`,
        [user.id, cardId]
      );
      
      console.log(`✅ Unlocked: ${cardId}`);
    }
    
    // Step 4: Verify final state
    const finalUnlocksResult = await pool.query(
      `SELECT unlock_id, unlocked_at, unlock_source FROM user_unlocks 
       WHERE user_id = $1 AND unlock_type = 'quantum_card'
       ORDER BY unlocked_at`,
      [user.id]
    );
    
    console.log(`\n✨ Final state for ${user.email}:`);
    console.table(finalUnlocksResult.rows);
    
    console.log(`\n✅ Successfully unlocked ${cardsToUnlock.length} quantum cards!`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Tell the user to refresh their browser`);
    console.log(`   2. They should see ${cardsToUnlock.join(' and ')} cards unlocked`);
    console.log(`   3. Verify at /quantum-card page`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

unlockQuantumCards()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
