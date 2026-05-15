require('dotenv').config();
const { Pool } = require('pg');

async function runMigration() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    console.log('[ScheduledDateMigration] Starting migration...');

    const existsCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'user_quests'
          AND column_name = 'scheduled_date'
      ) AS exists;
    `);

    console.log('[ScheduledDateMigration] scheduled_date exists before migration:', existsCheck.rows[0].exists);

    await client.query('BEGIN');

    await client.query(`
      ALTER TABLE user_quests
      ADD COLUMN IF NOT EXISTS scheduled_date DATE;
    `);

    await client.query('COMMIT');

    const verifyCheck = await client.query(`
      SELECT column_name, is_nullable, data_type
      FROM information_schema.columns
      WHERE table_name = 'user_quests'
        AND column_name = 'scheduled_date';
    `);

    if (verifyCheck.rows.length === 0) {
      throw new Error('scheduled_date column was not found after migration');
    }

    console.log('[ScheduledDateMigration] Migration complete. Column details:', verifyCheck.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[ScheduledDateMigration] Migration failed:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
