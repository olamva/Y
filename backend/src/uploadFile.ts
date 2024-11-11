import { FileUpload } from 'graphql-upload-minimal';
import path from 'path';
import fs from 'fs';

const UPLOADS_PATH =
  process.env.NODE_ENV === 'production' ? '/var/www/html/uploads' : path.join(__dirname, 'uploads');

export const uploadFile = async (
  file: FileUpload,
  username?: string
): Promise<{ success: boolean; message: string; url: string }> => {
  const { createReadStream, filename } = await file;

  const fileExtension = path.extname(filename);
  let uniqueFilename = '';

  if (username) {
    uniqueFilename = `${username}${fileExtension}`;
  } else {
    uniqueFilename = `${Date.now()}-${filename}`;
  }

  const filepath = path.join(UPLOADS_PATH, uniqueFilename);

  fs.mkdirSync(UPLOADS_PATH, { recursive: true });

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

    const filepath = path.join(UPLOADS_PATH, filename);
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
