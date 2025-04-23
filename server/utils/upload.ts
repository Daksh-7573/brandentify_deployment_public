import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { Request } from 'express';

// Create directories helper function with better error handling
const ensureDirectoryExists = (dirPath: string): boolean => {
  try {
    if (!fs.existsSync(dirPath)) {
      console.log(`Creating directory: ${dirPath}`);
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Directory created successfully: ${dirPath}`);
    } else {
      console.log(`Directory already exists: ${dirPath}`);
    }
    
    // Double-check the directory exists
    const exists = fs.existsSync(dirPath);
    if (!exists) {
      console.error(`Failed to create directory: ${dirPath}`);
      return false;
    }
    
    // Also check write permissions
    try {
      const testFile = path.join(dirPath, '.test-write-access');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
    } catch (error) {
      console.error(`Directory exists but not writable: ${dirPath}`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error ensuring directory exists: ${dirPath}`, error);
    return false;
  }
};

// Define upload directories
const publicDir = path.join(process.cwd(), 'public');
const uploadsDir = path.join(publicDir, 'uploads');
const projectUploadsDir = path.join(uploadsDir, 'projects');
const mediaUploadsDir = path.join(uploadsDir, 'media');

// Create directory structure with better error handling
console.log('Setting up upload directories...');
ensureDirectoryExists(publicDir);
ensureDirectoryExists(uploadsDir);
ensureDirectoryExists(projectUploadsDir);
ensureDirectoryExists(mediaUploadsDir);

// Configure storage for project thumbnails
const projectStorage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, projectUploadsDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate a unique filename with userId and timestamp
    const userId = req.body.userId || 'unknown';
    const timestamp = Date.now();
    const fileExtension = path.extname(file.originalname);
    cb(null, `project_${userId}_${timestamp}${fileExtension}`);
  },
});

// File filter to accept only images
const imageFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Configure storage for media uploads
const mediaStorage = multer.diskStorage({
  destination: (_req: Request, file: Express.Multer.File, cb) => {
    cb(null, mediaUploadsDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate a unique filename with userId and timestamp
    const userId = req.body.userId || 'unknown';
    const timestamp = Date.now();
    const fileExtension = path.extname(file.originalname);
    cb(null, `media_${userId}_${timestamp}${fileExtension}`);
  },
});

// File filter to accept images and videos
const mediaFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept image and video files
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'));
  }
};

// Create multer upload instance for project thumbnails
export const projectThumbnailUpload = multer({
  storage: projectStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: imageFileFilter,
}).single('thumbnail');

// Create multer upload instance for pulse media
export const pulseMediaUpload = multer({
  storage: mediaStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit for videos
  },
  fileFilter: mediaFileFilter,
}).array('media', 5); // Allow up to 5 files

// Helper function to get the public URL for an uploaded file
export const getFileUrl = (fileName: string, type: 'project' | 'media' = 'project'): string => {
  // Use either the BASE_URL env var or construct one based on host/protocol from the replit environment
  const baseUrl = process.env.BASE_URL || '';
  
  // If fileName is null or undefined, return empty string to avoid errors
  if (!fileName) {
    console.warn('getFileUrl called with null or undefined fileName');
    return '';
  }
  
  switch (type) {
    case 'project':
      return `${baseUrl}/uploads/projects/${fileName}`;
    case 'media':
      return `${baseUrl}/uploads/media/${fileName}`;
    default:
      return `${baseUrl}/uploads/${fileName}`;
  }
};