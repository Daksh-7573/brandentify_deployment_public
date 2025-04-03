import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { Request } from 'express';

// Ensure upload directories exist
const projectUploadsDir = path.join(process.cwd(), 'public', 'uploads', 'projects');
if (!fs.existsSync(projectUploadsDir)) {
  fs.mkdirSync(projectUploadsDir, { recursive: true });
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

// Create multer upload instance for project thumbnails
export const projectThumbnailUpload = multer({
  storage: projectStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: imageFileFilter,
}).single('thumbnail');

// Helper function to get the public URL for an uploaded file
export const getFileUrl = (fileName: string, type: 'project' = 'project'): string => {
  // Use either the BASE_URL env var or construct one based on host/protocol from the replit environment
  const baseUrl = process.env.BASE_URL || '';
  
  switch (type) {
    case 'project':
      return `${baseUrl}/uploads/projects/${fileName}`;
    default:
      return `${baseUrl}/uploads/${fileName}`;
  }
};