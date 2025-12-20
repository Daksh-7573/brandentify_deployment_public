import { Storage } from '@google-cloud/storage';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Google Cloud Storage with Replit sidecar endpoint (production) or fallback to ADC
const storage = new Storage({
  projectId: process.env.REPLIT_CLUSTER_PROJECT || 'replit',
  // Use sidecar auth on Replit, ADC as fallback
  credentials: process.env.REPLIT_CLUSTER_PROJECT ? {
    audience: 'replit',
    subject_token_type: 'access_token',
    token_url: 'http://127.0.0.1:1106/token',
    type: 'external_account',
    credential_source: {
      url: 'http://127.0.0.1:1106/credential',
      format: {
        type: 'json',
        subject_token_field_name: 'access_token',
      },
    },
    universe_domain: 'googleapis.com',
  } : undefined,
});

const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
if (!bucketId) {
  console.warn('[ObjectStorageService] DEFAULT_OBJECT_STORAGE_BUCKET_ID not set');
}

export class ObjectStorageService {
  private bucket = bucketId ? storage.bucket(bucketId) : null;

  /**
   * Upload media file to object storage
   * @param fileName - Name of the file
   * @param fileBuffer - File buffer
   * @param mimeType - MIME type of the file
   * @param folder - Folder path (e.g., 'media', 'projects')
   * @returns Public CDN URL or relative path
   */
  async uploadMedia(
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string,
    folder: string = 'media'
  ): Promise<string> {
    try {
      if (!this.bucket) {
        console.warn('[ObjectStorageService] Bucket not initialized - falling back to local storage');
        return this.fallbackToLocalStorage(fileName, fileBuffer, folder);
      }

      // Create a readable stream from buffer
      const stream = Readable.from([fileBuffer]);

      // Generate object path
      const objectPath = `${folder}/${fileName}`;
      const file = this.bucket.file(objectPath);

      console.log(`[ObjectStorageService] Uploading ${objectPath} to GCS`);

      // Upload with CDN public visibility
      await new Promise<void>((resolve, reject) => {
        stream
          .pipe(
            file.createWriteStream({
              metadata: {
                contentType: mimeType,
                cacheControl: 'public, max-age=31536000', // Cache for 1 year
              },
              public: true,
              resumable: false,
            })
          )
          .on('error', (error) => {
            console.error(`[ObjectStorageService] Upload error:`, error);
            reject(error);
          })
          .on('finish', () => {
            console.log(`[ObjectStorageService] Successfully uploaded: ${objectPath}`);
            resolve();
          });
      });

      // Make file publicly accessible (idempotent operation)
      try {
        await file.makePublic();
      } catch (aclError) {
        console.warn(`[ObjectStorageService] Could not set public ACL (may already be public):`, aclError);
      }

      // Return public CDN URL
      const publicUrl = `https://storage.googleapis.com/${bucketId}/${objectPath}`;
      console.log(`[ObjectStorageService] Public URL: ${publicUrl}`);
      return publicUrl;
    } catch (error) {
      console.error('[ObjectStorageService] GCS upload failed, falling back to local storage:', error);
      // Gracefully fall back to local storage on error
      return this.fallbackToLocalStorage(fileName, fileBuffer, folder);
    }
  }

  /**
   * Fallback to local storage when GCS is not available
   */
  private fallbackToLocalStorage(
    fileName: string,
    fileBuffer: Buffer,
    folder: string = 'media'
  ): string {
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, fileBuffer);

      const relativeUrl = `/uploads/${folder}/${fileName}`;
      console.log(`[ObjectStorageService] Fallback: Saved to local storage: ${relativeUrl}`);
      return relativeUrl;
    } catch (localError) {
      console.error('[ObjectStorageService] Local fallback also failed:', localError);
      throw new Error(`Upload failed: ${localError instanceof Error ? localError.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete media file from object storage
   */
  async deleteMedia(fileName: string, folder: string = 'media'): Promise<boolean> {
    try {
      if (!this.bucket) {
        console.warn('[ObjectStorageService] Bucket not initialized - cannot delete');
        return false;
      }

      const objectPath = `${folder}/${fileName}`;
      const file = this.bucket.file(objectPath);

      console.log(`[ObjectStorageService] Deleting ${objectPath}`);
      await file.delete();
      console.log(`[ObjectStorageService] Successfully deleted: ${objectPath}`);
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Not Found')) {
        console.warn(`[ObjectStorageService] File not found: ${fileName}`);
        return true; // Treat as success
      }
      console.error('[ObjectStorageService] Error deleting media:', error);
      throw error;
    }
  }

  /**
   * Check if object storage is available
   */
  isAvailable(): boolean {
    return !!this.bucket;
  }
}

// Export singleton instance
export const objectStorageService = new ObjectStorageService();
