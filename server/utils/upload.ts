import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { Request } from 'express';

// Ensure upload directories exist
const projectUploadsDir = path.join(process.cwd(), 'public', 'uploads', 'projects');
const mediaUploadsDir = path.join(process.cwd(), 'public', 'uploads', 'media');

if (!fs.existsSync(projectUploadsDir)) {
  fs.mkdirSync(projectUploadsDir, { recursive: true });
}

if (!fs.existsSync(mediaUploadsDir)) {
  fs.mkdirSync(mediaUploadsDir, { recursive: true });
}

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