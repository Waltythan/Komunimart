// src/backend/utils/fileUpload.ts
import fs from 'fs-extra';
import path from 'path';
import multer from 'multer';
import { Request } from 'express';

// Membuat folder uploads jika belum ada
const UPLOAD_DIR = path.join(__dirname, '../../../uploads');

// Subfolder untuk setiap jenis gambar
const PROFILE_PICS = path.join(UPLOAD_DIR, 'profiles');
const GROUP_IMAGES = path.join(UPLOAD_DIR, 'groups');
const POST_IMAGES = path.join(UPLOAD_DIR, 'posts');
const COMMENT_IMAGES = path.join(UPLOAD_DIR, 'comments');

// Buat semua direktori jika belum ada
fs.ensureDirSync(UPLOAD_DIR);
fs.ensureDirSync(PROFILE_PICS);
fs.ensureDirSync(GROUP_IMAGES);
fs.ensureDirSync(POST_IMAGES);
fs.ensureDirSync(COMMENT_IMAGES);

// Konfigurasi storage untuk Multer
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Tentukan folder berdasarkan route
    const url = req.originalUrl;
    
    if (url.includes('/profile')) {
      cb(null, PROFILE_PICS);
    } else if (url.includes('/groups') && !url.includes('/posts')) {
      cb(null, GROUP_IMAGES);
    } else if (url.includes('/posts') && !url.includes('/comments')) {
      cb(null, POST_IMAGES);
    } else if (url.includes('/comments')) {
      cb(null, COMMENT_IMAGES);
    } else {
      cb(null, UPLOAD_DIR);
    }
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Buat filename unik dengan timestamp + original name
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

// Filter file untuk hanya menerima gambar
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Hanya terima gambar: jpeg, jpg, png, gif
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Export multer middleware
export const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit: 5MB
});

// Helpers untuk URL gambar
export const getImageUrl = (filename: string | undefined, type: 'profile' | 'group' | 'post' | 'comment'): string => {
  if (!filename) return '';
  
  // URL relatif ke image
  return `/uploads/${type}s/${filename}`;
};