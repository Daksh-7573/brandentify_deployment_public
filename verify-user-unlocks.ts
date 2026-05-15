/**
 * Verify unlocks for user: daakshpatel1@gmail.com
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function verifyUnlocks() {
  try {
    const result = await pool.query(
      `SELECT 
        u.id,
        u.email,
        u.username,
        ul.unlock_type,
        ul.unlock_id,
        ul.unlock_source,
        ul.unlocked_at
      FROM users u
      LEFT JOIN user_unlocks ul ON u.id = ul.user_id
      WHERE u.email = 'daakshpatel1@gmail.com'
      ORDER BY ul.unlocked_at`
    );
    
    if (result.rows.length === 0) {
      console.error('❌ User not found!');
      process.exit(1);
    }
    
    console.log('\n✅ User unlocks for: daakshpatel1@gmail.com');
    console.log('='.repeat(80));
    console.table(result.rows);
    
    const quantumCards = result.rows.filter(r => r.unlock_type === 'quantum_card');
    console.log(`\n📊 Total Quantum Cards Unlocked: ${quantumCards.length}`);
    console.log('Cards:', quantumCards.map(c => c.unlock_id).join(', '));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

verifyUnlocks();
