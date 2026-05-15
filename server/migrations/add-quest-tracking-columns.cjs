require('dotenv').config();
const { Pool } = require('pg');

function normalizeDatabaseUrl(rawUrl) {
  if (!rawUrl) return rawUrl;

  try {
    const url = new URL(rawUrl);
    const currentSslMode = url.searchParams.get('sslmode');

    if (!currentSslMode || ['prefer', 'require', 'verify-ca'].includes(currentSslMode)) {
      url.searchParams.set('sslmode', 'verify-full');
    }

    return url.toString();
  } catch (_error) {
    return rawUrl;
  }
}

async function runMigration() {
  const pool = new Pool({
    connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL),
  });

  try {
    console.log('[QuestTrackingMigration] Starting migration');

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      await client.query(`
        ALTER TABLE user_quests
        ADD COLUMN IF NOT EXISTS last_tracked_at TIMESTAMP;
      `);

      await client.query(`
        ALTER TABLE user_quests
        ADD COLUMN IF NOT EXISTS tracked_activities TEXT[];
      `);

      await client.query(`
        ALTER TABLE user_quests
        ADD COLUMN IF NOT EXISTS auto_completed BOOLEAN DEFAULT FALSE;
      `);

      await client.query(`
        ALTER TABLE user_quests
        ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0;
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_user_quests_last_tracked
        ON user_quests(user_id, last_tracked_at)
        WHERE last_tracked_at IS NOT NULL;
      `);

      await client.query(`
        COMMENT ON COLUMN user_quests.last_tracked_at IS 'When progress was last updated';
      `);
      await client.query(`
        COMMENT ON COLUMN user_quests.tracked_activities IS 'List of activities that contributed to progress';
      `);
      await client.query(`
        COMMENT ON COLUMN user_quests.auto_completed IS 'Whether quest was completed automatically';
      `);
      await client.query(`
        COMMENT ON COLUMN user_quests.completion_percentage IS 'Calculated completion percentage';
      `);

      await client.query('COMMIT');
      console.log('[QuestTrackingMigration] Migration completed successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[QuestTrackingMigration] Migration failed:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runMigration();