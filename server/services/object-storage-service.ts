import { Storage } from '@google-cloud/storage';
import { Readable } from 'stream';

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.REPLIT_CLUSTER_PROJECT || 'replit',
  keyFilename: undefined, // Uses Application Default Credentials (already set in Replit)
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
        console.error('[ObjectStorageService] Bucket not initialized - falling back to local storage');
        return `/uploads/${folder}/${fileName}`;
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
      console.error('[ObjectStorageService] Error uploading media:', error);
      throw error;
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
