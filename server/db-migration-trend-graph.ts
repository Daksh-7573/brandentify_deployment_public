/**
 * Migration script to add Trend Graph and Job Graph tables
 * These tables support Musk's ability to provide skill trend analysis and career path guidance
 */

import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';
import * as schema from '../shared/schema';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString: databaseUrl });
const db = drizzle(pool);

async function executeQuery(queryText: string, params: any[] = []) {
  try {
    const { rows } = await pool.query(queryText, params);
    return rows;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

async function runMigration() {
  console.log('Starting trend graph database migration...');

  try {
    // Create skill_trends table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS skill_trends (
        id SERIAL PRIMARY KEY,
        skill_name TEXT NOT NULL,
        industry TEXT NOT NULL,
        category TEXT NOT NULL,
        growth_rate DECIMAL(5,2) NOT NULL,
        demand_score INTEGER NOT NULL,
        time_frame TEXT NOT NULL,
        data_source TEXT,
        job_count INTEGER,
        avg_salary_impact INTEGER,
        related_skills JSONB DEFAULT '[]',
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Created skill_trends table');

    // Create career_path_nodes table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS career_path_nodes (
        id SERIAL PRIMARY KEY,
        job_title TEXT NOT NULL,
        industry TEXT NOT NULL,
        level TEXT NOT NULL,
        avg_salary INTEGER,
        required_skills JSONB DEFAULT '[]',
        recommended_skills JSONB DEFAULT '[]',
        job_description TEXT,
        growth_outlook TEXT,
        entry_barrier TEXT,
        common_pathways JSONB DEFAULT '{}',
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Created career_path_nodes table');

    // Create career_transitions table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS career_transitions (
        id SERIAL PRIMARY KEY,
        from_node_id INTEGER NOT NULL REFERENCES career_path_nodes(id),
        to_node_id INTEGER NOT NULL REFERENCES career_path_nodes(id),
        transition_difficulty TEXT NOT NULL,
        skill_gaps JSONB DEFAULT '[]',
        avg_transition_time INTEGER,
        recommended_steps JSONB DEFAULT '[]',
        success_rate INTEGER,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Created career_transitions table');

    // Create indexes for faster querying
    await executeQuery('CREATE INDEX IF NOT EXISTS idx_skill_trends_name ON skill_trends(skill_name)');
    await executeQuery('CREATE INDEX IF NOT EXISTS idx_skill_trends_industry ON skill_trends(industry)');
    await executeQuery('CREATE INDEX IF NOT EXISTS idx_skill_trends_time_frame ON skill_trends(time_frame)');
    
    await executeQuery('CREATE INDEX IF NOT EXISTS idx_career_path_nodes_title ON career_path_nodes(job_title)');
    await executeQuery('CREATE INDEX IF NOT EXISTS idx_career_path_nodes_industry ON career_path_nodes(industry)');
    await executeQuery('CREATE INDEX IF NOT EXISTS idx_career_path_nodes_level ON career_path_nodes(level)');
    
    await executeQuery('CREATE INDEX IF NOT EXISTS idx_career_transitions_from ON career_transitions(from_node_id)');
    await executeQuery('CREATE INDEX IF NOT EXISTS idx_career_transitions_to ON career_transitions(to_node_id)');
    await executeQuery('CREATE INDEX IF NOT EXISTS idx_career_transitions_difficulty ON career_transitions(transition_difficulty)');
    
    console.log('Created indexes on trend graph tables');

    console.log('Trend graph migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    console.log('Migration complete');
    await pool.end();
  }
}

runMigration();