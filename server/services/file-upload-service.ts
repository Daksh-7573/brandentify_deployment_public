import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { promisify } from 'util';
import fileType from 'file-type';
import sanitize from 'sanitize-filename';

// Convert callbacks to promises
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

// Secure upload constants
const ALLOWED_MIME_TYPES = [
  'application/pdf',                        // PDF documents
  'application/msword',                     // DOC
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'image/jpeg',                             // JPEG images
  'image/png',                              // PNG images
  'text/plain',                             // Plain text
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;    // 10MB
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

/**
 * Secure file upload service
 * Provides methods for safely uploading and managing files with security measures
 */
export class FileUploadService {
  /**
   * Ensure upload directory exists
   */
  static async ensureUploadDir(): Promise<void> {
    try {
      if (!fs.existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true });
      }
    } catch (error) {
      console.error('Failed to create upload directory:', error);
      throw new Error('Server error: Failed to initialize upload system');
    }
  }

  /**
   * Validate file security
   * Checks file size, mime type, and extension
   * @param file File object to validate
   * @param filename Original filename
   * @returns Validation result with error message if invalid
   */
  static async validateFile(file: Buffer, filename: string): Promise<{ valid: boolean; error?: string }> {
    // Check file size
    if (file.length > MAX_FILE_SIZE) {
      return { valid: false, error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` };
    }

    // Check file extension
    const ext = path.extname(filename).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return { valid: false, error: `File type ${ext} is not allowed` };
    }

    // Verify mime type using file-type library
    try {
      const typeInfo = await fileType.fromBuffer(file);
      
      // If file-type can't determine the type for text files, check extension
      if (!typeInfo && ext === '.txt') {
        // Additional validation for .txt files could be done here
        return { valid: true };
      }
      
      // If type detected, verify against allowed list
      if (typeInfo && !ALLOWED_MIME_TYPES.includes(typeInfo.mime)) {
        return { valid: false, error: `File MIME type ${typeInfo.mime} is not allowed` };
      }
      
      // Check for mime-type/extension mismatch (potential spoofing)
      if (typeInfo && !this.extensionMatchesMimeType(ext, typeInfo.mime)) {
        return { valid: false, error: 'File extension does not match detected MIME type' };
      }
    } catch (error) {
      console.error('Error detecting file type:', error);
      return { valid: false, error: 'Could not verify file type' };
    }

    return { valid: true };
  }

  /**
   * Check if file extension matches the MIME type
   * @param extension File extension (with dot)
   * @param mimeType Detected MIME type
   * @returns True if they match, false otherwise
   */
  static extensionMatchesMimeType(extension: string, mimeType: string): boolean {
    const mimeExtMap: Record<string, string[]> = {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'text/plain': ['.txt'],
    };

    return mimeExtMap[mimeType]?.includes(extension) || false;
  }

  /**
   * Generate a secure filename
   * @param originalFilename Original user-provided filename
   * @returns Secure filename with original extension
   */
  static generateSecureFilename(originalFilename: string): string {
    const sanitizedName = sanitize(originalFilename);
    const ext = path.extname(sanitizedName);
    const randomName = crypto.randomBytes(16).toString('hex');
    return `${randomName}${ext.toLowerCase()}`;
  }

  /**
   * Safely store a file with security measures
   * @param file File buffer to store
   * @param originalFilename Original filename 
   * @param userId User ID for attribution
   * @returns Stored file information
   */
  static async storeFile(file: Buffer, originalFilename: string, userId: number): Promise<{ 
    filename: string; 
    path: string;
    size: number;
  }> {
    await this.ensureUploadDir();
    
    // Generate secure filename
    const secureFilename = this.generateSecureFilename(originalFilename);
    
    // Validate file security
    const validation = await this.validateFile(file, originalFilename);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    // Create user-specific directory
    const userDir = path.join(UPLOAD_DIR, userId.toString());
    if (!fs.existsSync(userDir)) {
      await mkdir(userDir, { recursive: true });
    }
    
    // Store file securely
    const filePath = path.join(userDir, secureFilename);
    await writeFile(filePath, file);
    
    return {
      filename: secureFilename,
      path: filePath,
      size: file.length,
    };
  }

  /**
   * Retrieve a file by secure filename
   * @param filename Secure filename
   * @param userId User ID for authorization
   * @returns File buffer and metadata if found
   */
  static async getFile(filename: string, userId: number): Promise<{ 
    buffer: Buffer; 
    filename: string; 
    originalFilename?: string;
  }> {
    // Validate filename to prevent path traversal
    const sanitizedFilename = sanitize(filename);
    if (sanitizedFilename !== filename) {
      throw new Error('Invalid filename');
    }
    
    // Construct file path and check existence
    const filePath = path.join(UPLOAD_DIR, userId.toString(), sanitizedFilename);
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    
    // Read file
    const buffer = await readFile(filePath);
    
    return {
      buffer,
      filename: sanitizedFilename,
    };
  }

  /**
   * Delete a file securely
   * @param filename Secure filename to delete
   * @param userId User ID for authorization
   * @returns True if deletion successful
   */
  static async deleteFile(filename: string, userId: number): Promise<boolean> {
    // Validate filename to prevent path traversal
    const sanitizedFilename = sanitize(filename);
    if (sanitizedFilename !== filename) {
      throw new Error('Invalid filename');
    }
    
    // Construct file path and check existence
    const filePath = path.join(UPLOAD_DIR, userId.toString(), sanitizedFilename);
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    
    // Delete file
    fs.unlinkSync(filePath);
    return true;
  }
}

export default FileUploadService;