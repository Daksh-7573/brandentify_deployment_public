/**
 * Quest engine additive migration
 * - Adds quest_definitions.verification_method
 * - Converts assigned_date to DATE
 * - Creates quest_assignment_retries table
 * - Adds quest_content_hash for duplicate detection
 * - Adds quest_category enum and field
 * - Creates user_quest_history table for rotation tracking
 */

require('dotenv').config();
const { Client } = require('pg');

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
  const client = new Client({
    connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL),
  });

  try {
    await client.connect();
    console.log('[QuestEngineMigration] Starting migration');

    // 1. Add verification_method column
    console.log('[QuestEngineMigration] Adding verification_method column...');
    await client.query(`
      ALTER TABLE quest_definitions
      ADD COLUMN IF NOT EXISTS verification_method TEXT DEFAULT 'manual';
    `);

    // 2. Update verification methods for database_event quests
    console.log('[QuestEngineMigration] Updating verification methods...');
    await client.query(`
      UPDATE quest_definitions
      SET verification_method = 'database_event'
      WHERE target_action IN (
        'create_pulse',
        'add_portfolio_project',
        'add_project',
        'update_profile_field',
        'connect_with_user',
        'publish_portfolio_project'
      )
        AND COALESCE(verification_method, 'manual') = 'manual';
    `);

    // 3. Convert assigned_date to DATE type
    console.log('[QuestEngineMigration] Converting assigned_date to DATE...');
    await client.query(`
      ALTER TABLE user_quests
      ALTER COLUMN assigned_date TYPE DATE
      USING assigned_date::date;
    `);

    // 4. Create quest_assignment_retries table
    console.log('[QuestEngineMigration] Creating quest_assignment_retries table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS quest_assignment_retries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
        retry_count INTEGER NOT NULL DEFAULT 0,
        last_attempt TIMESTAMP DEFAULT NOW(),
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_quest_assignment_retries_status
      ON quest_assignment_retries(status);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_quest_assignment_retries_last_attempt
      ON quest_assignment_retries(last_attempt DESC);
    `);

    // 5. Add quest_content_hash column for duplicate detection
    console.log('[QuestEngineMigration] Adding quest_content_hash column...');
    await client.query(`
      ALTER TABLE quest_definitions
      ADD COLUMN IF NOT EXISTS quest_content_hash TEXT;
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_quest_definitions_content_hash
      ON quest_definitions(quest_content_hash)
      WHERE quest_content_hash IS NOT NULL;
    `);

    // 6. Create quest_category enum and add column
    console.log('[QuestEngineMigration] Creating quest_category enum...');
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE quest_category AS ENUM (
          'career',
          'profile',
          'portfolio',
          'social',
          'networking'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      ALTER TABLE quest_definitions
      ADD COLUMN IF NOT EXISTS quest_category quest_category;
    `);

    // 7. Update existing quests with appropriate categories
    console.log('[QuestEngineMigration] Categorizing existing quests...');
    
    // Profile quests
    await client.query(`
      UPDATE quest_definitions
      SET quest_category = 'profile'
      WHERE quest_category IS NULL
        AND (
          target_action LIKE '%profile%'
          OR target_action IN ('add_uvp', 'add_vision_statement', 'add_mission_statement', 
                               'add_core_values', 'add_tagline', 'add_title', 'add_about_me', 
                               'add_what_i_offer', 'update_profile_field')
          OR type = 'profile_update'
        );
    `);

    // Portfolio quests
    await client.query(`
      UPDATE quest_definitions
      SET quest_category = 'portfolio'
      WHERE quest_category IS NULL
        AND (
          target_action LIKE '%portfolio%'
          OR target_action LIKE '%project%'
          OR target_action IN ('add_portfolio_project', 'add_project', 'publish_portfolio_project',
                               'add_case_study', 'showcase_work')
          OR type = 'portfolio'
        );
    `);

    // Social quests
    await client.query(`
      UPDATE quest_definitions
      SET quest_category = 'social'
      WHERE quest_category IS NULL
        AND (
          target_action LIKE '%pulse%'
          OR target_action LIKE '%post%'
          OR target_action LIKE '%content%'
          OR target_action IN ('create_pulse', 'share_post', 'publish_content', 
                               'write_article', 'create_video', 'share_insight')
          OR type = 'pulse_creation'
        );
    `);

    // Networking quests
    await client.query(`
      UPDATE quest_definitions
      SET quest_category = 'networking'
      WHERE quest_category IS NULL
        AND (
          target_action LIKE '%connect%'
          OR target_action LIKE '%comment%'
          OR target_action LIKE '%react%'
          OR target_action LIKE '%engage%'
          OR target_action IN ('connect_with_user', 'comment_on_pulse', 'react_to_post',
                               'engage_with_content', 'send_connection_request', 'participate_discussion')
          OR type = 'networking'
        );
    `);

    // Default remaining to career
    await client.query(`
      UPDATE quest_definitions
      SET quest_category = 'career'
      WHERE quest_category IS NULL;
    `);

    // 8. Create user_quest_history table for rotation tracking
    console.log('[QuestEngineMigration] Creating user_quest_history table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_quest_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        quest_definition_id INTEGER NOT NULL REFERENCES quest_definitions(id),
        assigned_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_quest_history_user_id
      ON user_quest_history(user_id, assigned_at DESC);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_quest_history_quest_def
      ON user_quest_history(quest_definition_id);
    `);

    // 9. Populate user_quest_history from existing user_quests
    console.log('[QuestEngineMigration] Populating user_quest_history from existing quests...');
    await client.query(`
      INSERT INTO user_quest_history (user_id, quest_definition_id, assigned_at)
      SELECT 
        user_id,
        quest_definition_id,
        assigned_at
      FROM user_quests
      WHERE assigned_at IS NOT NULL
      ON CONFLICT DO NOTHING;
    `);

    console.log('[QuestEngineMigration] Migration completed successfully');
    console.log('[QuestEngineMigration] Summary:');
    console.log('  ✓ verification_method column added');
    console.log('  ✓ assigned_date converted to DATE');
    console.log('  ✓ quest_assignment_retries table created');
    console.log('  ✓ quest_content_hash column added');
    console.log('  ✓ quest_category enum and column created');
    console.log('  ✓ user_quest_history table created');
    console.log('  ✓ Quest categories populated');
    console.log('  ✓ Quest history populated');

  } catch (error) {
    console.error('[QuestEngineMigration] Migration failed:', error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

runMigration();
