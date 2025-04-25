import express from 'express';
import { executeRawQuery } from './db';

export const routesMigrateWorkExperiences = express.Router();

// Route to add domain and key_responsibilities columns to work_experiences table
routesMigrateWorkExperiences.get('/migrate-work-experiences', async (req, res) => {
  try {
    console.log('Starting migration: Adding domain and key_responsibilities columns to work_experiences table');
    
    // Check if columns already exist
    const checkColumnQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'work_experiences'
      AND column_name IN ('domain', 'key_responsibilities');
    `;
    
    const existingColumns = await executeRawQuery(checkColumnQuery);
    const existingColumnNames = existingColumns.rows.map((row: any) => row.column_name);
    
    // Add domain column if it doesn't exist
    if (!existingColumnNames.includes('domain')) {
      console.log('Adding domain column to work_experiences table');
      await executeRawQuery(`
        ALTER TABLE work_experiences
        ADD COLUMN domain TEXT;
      `);
      console.log('Domain column added successfully');
    } else {
      console.log('Domain column already exists');
    }
    
    // Add key_responsibilities column if it doesn't exist
    if (!existingColumnNames.includes('key_responsibilities')) {
      console.log('Adding key_responsibilities column to work_experiences table');
      await executeRawQuery(`
        ALTER TABLE work_experiences
        ADD COLUMN key_responsibilities JSONB DEFAULT '[]';
      `);
      console.log('Key responsibilities column added successfully');
    } else {
      console.log('Key responsibilities column already exists');
    }
    
    console.log('Migration completed successfully');
    
    return res.status(200).json({
      success: true,
      message: 'Migration completed successfully',
      columns: {
        domain: !existingColumnNames.includes('domain') ? 'added' : 'already exists',
        key_responsibilities: !existingColumnNames.includes('key_responsibilities') ? 'added' : 'already exists'
      }
    });
  } catch (error) {
    console.error('Error during migration:', error);
    return res.status(500).json({
      success: false,
      message: 'Error during migration',
      error: String(error)
    });
  }
});