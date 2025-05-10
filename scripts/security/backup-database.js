#!/usr/bin/env node

/**
 * Automated Database Backup Script
 * 
 * This script:
 * 1. Creates a full database backup
 * 2. Encrypts the backup for storage
 * 3. Can be run manually or scheduled with cron
 * 
 * Usage:
 *   node backup-database.js [--rotate]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const BACKUP_DIR = path.join(__dirname, '../../backups');
const BACKUP_RETENTION = 7; // Number of days to keep backups
const ROTATE = process.argv.includes('--rotate');
const DATABASE_URL = process.env.DATABASE_URL || '';
const ENCRYPTION_KEY = process.env.BACKUP_ENCRYPTION_KEY || 'default-backup-encryption-key';

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Create a database backup using pg_dump
 */
function createDatabaseBackup() {
  if (!DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.sql`);
  const encryptedFile = `${backupFile}.enc`;

  try {
    console.log(`Creating database backup: ${backupFile}`);
    
    // Extract connection details from DATABASE_URL
    const url = new URL(DATABASE_URL);
    const host = url.hostname;
    const port = url.port || '5432';
    const database = url.pathname.slice(1);
    const username = url.username;
    const password = url.password;
    
    // Set PGPASSWORD environment variable for pg_dump
    const env = { ...process.env, PGPASSWORD: password };
    
    // Run pg_dump to create the backup
    execSync(
      `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -F p -f ${backupFile}`,
      { env }
    );
    
    // Encrypt the backup file
    encryptFile(backupFile, encryptedFile);
    
    // Remove the unencrypted backup
    fs.unlinkSync(backupFile);
    
    console.log(`✓ Backup created and encrypted: ${encryptedFile}`);
    
    return encryptedFile;
  } catch (error) {
    console.error('Error creating database backup:', error.message);
    
    // Clean up any partial files
    if (fs.existsSync(backupFile)) {
      fs.unlinkSync(backupFile);
    }
    
    process.exit(1);
  }
}

/**
 * Encrypt a file using AES-256-CBC
 */
function encryptFile(inputFile, outputFile) {
  try {
    // Create a hash of the key to ensure it's the right length
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const input = fs.createReadStream(inputFile);
    const output = fs.createWriteStream(outputFile);
    
    // Write the IV at the beginning of the encrypted file
    output.write(iv);
    
    // Pipe the input through the cipher to the output
    input.pipe(cipher).pipe(output);
    
    return new Promise((resolve, reject) => {
      output.on('finish', resolve);
      output.on('error', reject);
    });
  } catch (error) {
    console.error('Error encrypting backup file:', error.message);
    throw error;
  }
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
 * Rotate old backup files to keep disk usage under control
 */
function rotateBackups() {
  try {
    console.log('Rotating old backup files...');
    
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-') && file.endsWith('.sql.enc'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        mtime: fs.statSync(path.join(BACKUP_DIR, file)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime); // Sort newest to oldest
    
    // Keep the most recent BACKUP_RETENTION backups, delete the rest
    if (files.length > BACKUP_RETENTION) {
      const filesToDelete = files.slice(BACKUP_RETENTION);
      
      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`Deleted old backup: ${file.name}`);
      });
      
      console.log(`Rotated backups, keeping the ${BACKUP_RETENTION} most recent files.`);
    } else {
      console.log(`No backup rotation needed, have ${files.length} backups (threshold: ${BACKUP_RETENTION}).`);
    }
  } catch (error) {
    console.error('Error rotating backup files:', error.message);
  }
}

// Main execution
(async () => {
  try {
    const backupFile = createDatabaseBackup();
    
    if (ROTATE) {
      rotateBackups();
    }
    
    console.log('Database backup completed successfully!');
    console.log('To restore this backup: node restore-database.js --file ' + backupFile);
  } catch (error) {
    console.error('Backup process failed:', error.message);
    process.exit(1);
  }
})();