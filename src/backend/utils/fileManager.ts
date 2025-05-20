// src/backend/utils/fileManager.ts
import fs from 'fs-extra';
import path from 'path';

const UPLOAD_DIR = path.join(__dirname, '../../../uploads');

export const deleteFile = async (filename: string | null | undefined, type: 'profile' | 'group' | 'post' | 'comment'): Promise<void> => {
  if (!filename) return;
  
  const filePath = path.join(UPLOAD_DIR, `${type}s`, filename);
  try {
    await fs.remove(filePath);
  } catch (err) {
    console.error(`Error deleting file ${filePath}:`, err);
  }
};

// Gunakan saat menghapus atau memperbarui entity dengan gambar baru
// Contoh:
// if (user.profile_pic && user.profile_pic !== newFilename) {
//   await deleteFile(user.profile_pic, 'profile');
// }