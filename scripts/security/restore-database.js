#!/usr/bin/env node

/**
 * Database Backup Restore Script
 * 
 * This script:
 * 1. Decrypts a backup file
 * 2. Restores it to the database
 * 3. Supports specifying a specific backup file
 * 
 * Usage:
 *   node restore-database.js --file backups/backup-2025-05-10T12-00-00.000Z.sql.enc [--force]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

// Configuration
const BACKUP_DIR = path.join(__dirname, '../../backups');
const DATABASE_URL = process.env.DATABASE_URL || '';
const ENCRYPTION_KEY = process.env.BACKUP_ENCRYPTION_KEY || 'default-backup-encryption-key';

// Parse command-line arguments
const args = process.argv.slice(2);
const fileArg = args.find(arg => arg.startsWith('--file='));
const force = args.includes('--force');
let backupFile = fileArg ? fileArg.split('=')[1] : null;

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Prompt the user for confirmation before proceeding
 */
function promptForConfirmation(message) {
  return new Promise((resolve) => {
    rl.question(`${message} (yes/no): `, (answer) => {
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Decrypt a database backup file
 */
function decryptFile(inputFile, outputFile) {
  try {
    // Read the first 16 bytes (IV) from the encrypted file
    const fileData = fs.readFileSync(inputFile);
    const iv = fileData.slice(0, 16);
    const encryptedData = fileData.slice(16);
    
    // Create a hash of the key to ensure it's the right length
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    // Write the decrypted data to the output file
    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final()
    ]);
    
    fs.writeFileSync(outputFile, decrypted);
    console.log(`File decrypted to ${outputFile}`);
  } catch (error) {
    console.error('Error decrypting backup file:', error.message);
    throw error;
  }
}

/**
 * Restore a database from a backup file
 */
async function restoreDatabase(backupFile) {
  if (!DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  // Get the decrypted file path
  const decryptedFile = backupFile.replace('.enc', '');
  
  try {
    // Decrypt the backup file
    decryptFile(backupFile, decryptedFile);
    
    // Extract connection details from DATABASE_URL
    const url = new URL(DATABASE_URL);
    const host = url.hostname;
    const port = url.port || '5432';
    const database = url.pathname.slice(1);
    const username = url.username;
    const password = url.password;
    
    // Set PGPASSWORD environment variable for psql
    const env = { ...process.env, PGPASSWORD: password };
    
    // Warn the user about data loss
    if (!force) {
      const confirmMessage = `WARNING: This will OVERWRITE the current database '${database}' with the backup. All current data will be LOST.`;
      const confirmed = await promptForConfirmation(confirmMessage);
      
      if (!confirmed) {
        console.log('Restore cancelled by user.');
        return;
      }
    }
    
    console.log(`Restoring database from backup: ${decryptedFile}`);
    
    // First drop all connections to the database
    const dropConnectionsQuery = `
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = '${database}'
      AND pid <> pg_backend_pid();
    `;
    
    execSync(
      `psql -h ${host} -p ${port} -U ${username} -d postgres -c "${dropConnectionsQuery}"`,
      { env }
    );
    
    // Restore the database
    execSync(
      `psql -h ${host} -p ${port} -U ${username} -d ${database} -f ${decryptedFile}`,
      { env }
    );
    
    console.log('✓ Database restore completed successfully!');
  } catch (error) {
    console.error('Error restoring database:', error.message);
    throw error;
  } finally {
    // Clean up the decrypted file
    if (fs.existsSync(decryptedFile)) {
      fs.unlinkSync(decryptedFile);
      console.log(`Removed temporary decrypted file: ${decryptedFile}`);
    }
    
    // Close the readline interface
    rl.close();
  }
}

/**
 * List available backup files
 */
function listBackupFiles() {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.error(`Backup directory does not exist: ${BACKUP_DIR}`);
    return [];
  }
  
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith('backup-') && file.endsWith('.sql.enc'))
    .map(file => ({
      name: file,
      path: path.join(BACKUP_DIR, file),
      mtime: fs.statSync(path.join(BACKUP_DIR, file)).mtime
    }))
    .sort((a, b) => b.mtime - a.mtime); // Sort newest to oldest
  
  return files;
}

/**
 * Prompt the user to select a backup file
 */
async function promptForBackupFile() {
  const files = listBackupFiles();
  
  if (files.length === 0) {
    console.error('No backup files found.');
    process.exit(1);
  }
  
  console.log('Available backup files:');
  files.forEach((file, index) => {
    console.log(`${index + 1}. ${file.name} (${file.mtime.toLocaleString()})`);
  });
  
  return new Promise((resolve) => {
    rl.question('Enter the number of the backup to restore: ', (answer) => {
      const index = parseInt(answer) - 1;
      
      if (isNaN(index) || index < 0 || index >= files.length) {
        console.error('Invalid selection.');
        rl.close();
        process.exit(1);
      }
      
      resolve(files[index].path);
    });
  });
}

// Main execution
(async () => {
  try {
    if (!backupFile) {
      backupFile = await promptForBackupFile();
    } else if (!backupFile.startsWith('/')) {
      // If a relative path was provided, make it absolute
      backupFile = path.join(process.cwd(), backupFile);
    }
    
    if (!fs.existsSync(backupFile)) {
      console.error(`Backup file does not exist: ${backupFile}`);
      process.exit(1);
    }
    
    await restoreDatabase(backupFile);
  } catch (error) {
    console.error('Restore process failed:', error.message);
    process.exit(1);
  }
})();