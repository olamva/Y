import { FileUpload } from 'graphql-upload-minimal';
import path from 'path';
import fs from 'fs';

export const uploadFile = async (
  file: FileUpload
): Promise<{ success: boolean; message: string; url: string }> => {
  const { createReadStream, filename } = await file;

  const uploadsDir = path.join(__dirname, 'uploads');
  const uniqueFilename = `${Date.now()}-${filename}`;
  const filepath = path.join(uploadsDir, uniqueFilename);

  fs.mkdirSync(uploadsDir, { recursive: true });

  return new Promise((resolve, reject) => {
    const stream = createReadStream();
    const out = fs.createWriteStream(filepath);
    stream.pipe(out);
    out.on('finish', () =>
      resolve({
        success: true,
        message: 'File uploaded successfully',
        url: `/uploads/${uniqueFilename}`,
      })
    );
    out.on('error', (err) => reject(err));
  });
};

export const deleteFile = async (url: string): Promise<{ success: boolean; message: string }> => {
  try {
    const filename = path.basename(url);

    const uploadsDir = path.join(__dirname, 'uploads');

    const filepath = path.join(uploadsDir, filename);
    if (!fs.existsSync(filepath)) {
      return { success: false, message: 'File does not exist' };
    }

    await new Promise<void>((resolve, reject) => {
      fs.unlink(filepath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    return { success: true, message: 'File deleted successfully' };
  } catch (err) {
    console.error('Error deleting file:', err);
    return { success: false, message: 'Error deleting file' };
  }
};
