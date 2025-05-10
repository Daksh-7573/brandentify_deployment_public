import crypto from 'crypto';

// Define types of personally identifiable information (PII)
type PiiType = 'email' | 'phone' | 'address' | 'name' | 'ssn' | 'financial' | 'other';

/**
 * Service for handling data privacy operations
 * Provides methods for masking, hashing, and encrypting sensitive data
 */
export class DataPrivacyService {
  // Encryption key and iv should be stored securely and rotated regularly
  private static encryptionKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
  private static encryptionIv = process.env.ENCRYPTION_IV || crypto.randomBytes(16).toString('hex');

  /**
   * Mask sensitive data like email or phone numbers for display
   * @param value Value to mask
   * @param type Type of PII being masked
   * @returns Masked string safe for display
   */
  static maskPii(value: string, type: PiiType): string {
    if (!value) return '';

    switch (type) {
      case 'email':
        // Format: fi**t@do**in.com
        const [username, domain] = value.split('@');
        if (!username || !domain) return '****@****.***';
        const maskedUsername = username.substring(0, 2) + '**' + (username.length > 4 ? username.substring(username.length - 1) : '');
        const [domainName, extension] = domain.split('.');
        if (!domainName || !extension) return `${maskedUsername}@****.***`;
        const maskedDomain = domainName.substring(0, 2) + '**' + (domainName.length > 4 ? domainName.substring(domainName.length - 1) : '');
        return `${maskedUsername}@${maskedDomain}.${extension}`;

      case 'phone':
        // Format: ***-***-1234
        return value.replace(/^(\d{0,3})(\d{0,3})(\d{0,4})$/, (_, p1, p2, p3) => {
          let masked = '';
          if (p1) masked += '*'.repeat(p1.length);
          if (p2) masked += '-' + '*'.repeat(p2.length);
          if (p3) masked += '-' + p3; // Keep last 4 digits visible
          return masked;
        });

      case 'name':
        // Format: J*** D**
        return value.split(' ').map(part => {
          if (part.length <= 1) return part;
          return part.substring(0, 1) + '*'.repeat(part.length - 1);
        }).join(' ');

      case 'address':
        // Format: 1*** Main St
        const parts = value.split(' ');
        if (parts.length === 0) return '****';
        // Mask house/building number but keep street name
        if (/^\d+$/.test(parts[0])) {
          parts[0] = parts[0].substring(0, 1) + '*'.repeat(parts[0].length - 1);
        }
        return parts.join(' ');

      case 'ssn':
        // Format: ***-**-1234
        return value.replace(/^(\d{0,3})(\d{0,2})(\d{0,4})$/, (_, p1, p2, p3) => {
          let masked = '';
          if (p1) masked += '*'.repeat(p1.length);
          if (p2) masked += '-' + '*'.repeat(p2.length);
          if (p3) masked += '-' + p3; // Keep last 4 digits visible
          return masked;
        });

      case 'financial':
        // Format: **** **** **** 1234
        return value.replace(/(\d{4})/g, (match, p1, offset) => {
          // Only keep the last group visible
          return offset >= value.length - 4 ? p1 : '****';
        });

      default:
        // Default masking for other PII types
        if (value.length <= 4) return '*'.repeat(value.length);
        return value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2);
    }
  }

  /**
   * One-way hash sensitive data for storage or comparison
   * @param value Value to hash
   * @param salt Optional salt (will generate one if not provided)
   * @returns Hashed value and salt
   */
  static hashSensitiveData(value: string, salt?: string): { hashedValue: string; salt: string } {
    const useSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(value, useSalt, 10000, 64, 'sha512').toString('hex');
    
    return {
      hashedValue: hash,
      salt: useSalt
    };
  }

  /**
   * Encrypt sensitive data for secure storage (reversible)
   * @param value Value to encrypt
   * @returns Encrypted value that can be decrypted later
   */
  static encryptData(value: string): string {
    const key = Buffer.from(this.encryptionKey, 'hex');
    const iv = Buffer.from(this.encryptionIv, 'hex');
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return encrypted;
  }

  /**
   * Decrypt previously encrypted data
   * @param encryptedValue Encrypted value to decrypt
   * @returns Decrypted original value
   */
  static decryptData(encryptedValue: string): string {
    try {
      const key = Buffer.from(this.encryptionKey, 'hex');
      const iv = Buffer.from(this.encryptionIv, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      
      let decrypted = decipher.update(encryptedValue, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Remove PII from logs and error messages
   * @param text Text that might contain PII
   * @returns Sanitized text with PII removed
   */
  static sanitizeLogging(text: string): string {
    // Remove email addresses
    let sanitized = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]');
    
    // Remove phone numbers (various formats)
    sanitized = sanitized.replace(/(\+\d{1,3}[\s-])?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g, '[PHONE_REDACTED]');
    
    // Remove SSNs
    sanitized = sanitized.replace(/\d{3}-\d{2}-\d{4}/g, '[SSN_REDACTED]');
    
    // Remove credit card numbers
    sanitized = sanitized.replace(/\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/g, '[CC_REDACTED]');
    
    return sanitized;
  }

  /**
   * Generate a data export for user in compliance with privacy regulations
   * @param userId User ID to export data for
   * @returns Object containing all user data
   */
  static async generateDataExport(userId: number): Promise<any> {
    // This would be implemented to gather all user data from various tables
    // For now, we'll return a placeholder implementation
    
    // In a real implementation, you would:
    // 1. Query all tables containing user data
    // 2. Format the data in a structured, readable way
    // 3. Include metadata about the export (timestamp, data categories)
    
    throw new Error('Data export not yet implemented');
  }

  /**
   * Implement the right to be forgotten
   * Deletes or anonymizes all user data
   * @param userId User ID to delete data for
   * @param hardDelete Whether to permanently delete (true) or anonymize (false)
   * @returns Success status
   */
  static async deleteUserData(userId: number, hardDelete: boolean = false): Promise<boolean> {
    // This would be implemented to delete or anonymize all user data
    // For now, we'll return a placeholder implementation
    
    // In a real implementation, you would:
    // 1. Start a transaction to ensure consistency
    // 2. Identify all tables with user data
    // 3. Either delete or anonymize the data based on hardDelete parameter
    // 4. Commit the transaction
    
    throw new Error('User data deletion not yet implemented');
  }
}

export default DataPrivacyService;