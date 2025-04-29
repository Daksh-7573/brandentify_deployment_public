import { pool } from './db';

async function executeQuery(query: string, params: any[] = []) {
  try {
    return await pool.query(query, params);
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
}

async function runMigration() {
  try {
    console.log('Starting migration: Creating Career Quests tables');

    // Create quest_type enum if it doesn't exist
    await executeQuery(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quest_type') THEN
          CREATE TYPE quest_type AS ENUM (
            'profile_update', 'pulse_creation', 'networking', 'learning', 
            'portfolio', 'resume', 'visibility'
          );
        END IF;
      END $$;
    `);
    console.log('Created quest_type enum');

    // Create quest_status enum if it doesn't exist
    await executeQuery(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quest_status') THEN
          CREATE TYPE quest_status AS ENUM (
            'active', 'completed', 'dismissed', 'expired'
          );
        END IF;
      END $$;
    `);
    console.log('Created quest_status enum');

    // Create badge_type enum if it doesn't exist
    await executeQuery(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'badge_type') THEN
          CREATE TYPE badge_type AS ENUM (
            'quest_initiate', 'weekly_hustler', 'musk_learner', 
            'thought_leader', 'portfolio_star', 'visibility_boosted'
          );
        END IF;
      END $$;
    `);
    console.log('Created badge_type enum');

    // Create quest_definitions table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS quest_definitions (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        type quest_type NOT NULL,
        target_count INTEGER NOT NULL DEFAULT 1,
        target_action TEXT NOT NULL,
        xp_reward INTEGER NOT NULL DEFAULT 50,
        badge_reward badge_type,
        required_profile_completion INTEGER DEFAULT 0,
        required_career_stage TEXT,
        required_industry TEXT,
        musk_tip TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Created quest_definitions table');

    // Create user_quests table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS user_quests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        quest_definition_id INTEGER NOT NULL REFERENCES quest_definitions(id),
        status quest_status NOT NULL DEFAULT 'active',
        progress INTEGER NOT NULL DEFAULT 0,
        assigned_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP,
        week_number INTEGER NOT NULL,
        year INTEGER NOT NULL,
        dismissed_reason TEXT,
        xp_earned INTEGER,
        badge_earned badge_type,
        musk_response TEXT
      );
    `);
    console.log('Created user_quests table');

    // Create user_xp table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS user_xp (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
        balance INTEGER NOT NULL DEFAULT 0,
        lifetime_earned INTEGER NOT NULL DEFAULT 0,
        current_month_earned INTEGER NOT NULL DEFAULT 0,
        last_earned_at TIMESTAMP,
        last_reset_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Created user_xp table');

    // Create user_badges table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        badge_type badge_type NOT NULL,
        earned_at TIMESTAMP DEFAULT NOW(),
        quest_id INTEGER REFERENCES user_quests(id)
      );
    `);
    console.log('Created user_badges table');

    // Create xp_transactions table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS xp_transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        amount INTEGER NOT NULL,
        source TEXT NOT NULL,
        source_id INTEGER,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Created xp_transactions table');

    // Create nowboard_items table with category enum (fix type column issue)
    await executeQuery(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nowboard_category') THEN
          CREATE TYPE nowboard_category AS ENUM (
            'growth', 'learning', 'launch', 'planning', 'collaboration', 'visibility'
          );
        END IF;
      END $$;
    `);
    console.log('Created nowboard_category enum');

    await executeQuery(`
      CREATE TABLE IF NOT EXISTS nowboard_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        content VARCHAR(150) NOT NULL,
        category nowboard_category NOT NULL,
        visibility VARCHAR(20) NOT NULL DEFAULT 'public',
        inspired_count INTEGER NOT NULL DEFAULT 0,
        related_skills TEXT,
        related_project INTEGER,
        image_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Created nowboard_items table');

    await executeQuery(`
      CREATE TABLE IF NOT EXISTS nowboard_inspired_by (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        nowboard_item_id INTEGER NOT NULL REFERENCES nowboard_items(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT unique_user_item UNIQUE (user_id, nowboard_item_id)
      );
    `);
    console.log('Created nowboard_inspired_by table');

    // Create brands_of_the_day table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS brands_of_the_day (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        industry TEXT NOT NULL,
        domain TEXT,
        featured_at TIMESTAMP DEFAULT NOW(),
        times_viewed INTEGER DEFAULT 0,
        times_shared INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Created brands_of_the_day table');

    console.log('Migration completed successfully');
    
    return {
      success: true,
      message: 'Migration completed successfully'
    };
  } catch (error) {
    console.error('Error during migration:', error);
    return {
      success: false,
      message: 'Error during migration',
      error: String(error)
    };
  }
}

// Run the migration and exit
runMigration()
  .then(result => {
    console.log('Migration result:', result);
    process.exit(0);
  })
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });