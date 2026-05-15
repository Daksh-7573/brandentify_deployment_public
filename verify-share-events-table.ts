import { Pool, neonConfig } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function verify() {
  const result = await pool.query(`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'share_events' 
    ORDER BY ordinal_position
  `);
  console.table(result.rows);
  await pool.end();
}

verify();
