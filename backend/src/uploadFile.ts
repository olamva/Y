import { FileUpload } from 'graphql-upload-minimal';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import sanitize from 'sanitize-filename';
import sharp from 'sharp';

const UPLOADS_PATH =
  process.env.NODE_ENV === 'production' ? '/var/www/html/uploads' : path.join(__dirname, 'uploads');

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.gif', '.png'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

export const uploadFile = async (
  file: FileUpload,
  username?: string
): Promise<{ success: boolean; message: string; url?: string }> => {
  try {
    const { createReadStream, filename, mimetype } = await file;

    const sanitizedFilename = sanitize(filename);
    if (!sanitizedFilename) {
      return { success: false, message: 'Invalid filename.' };
    }

    const fileExtension = path.extname(sanitizedFilename).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return {
        success: false,
        message: `Invalid file type. Only ${ALLOWED_EXTENSIONS.join(', ')} are allowed.`,
      };
    }

    if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
      return {
        success: false,
        message: `Invalid MIME type. Allowed types are: ${ALLOWED_MIME_TYPES.join(', ')}.`,
      };
    }

    const uniqueFilename = username
      ? `${sanitize(username)}-${uuidv4()}${fileExtension}`
      : `${uuidv4()}-${sanitizedFilename}`;

    const filepath = path.join(UPLOADS_PATH, uniqueFilename);

    fs.mkdirSync(UPLOADS_PATH, { recursive: true });

    const tempFilePath = path.join(UPLOADS_PATH, `temp-${uniqueFilename}`);

    return new Promise((resolve, reject) => {
      const stream = createReadStream();
      const out = fs.createWriteStream(tempFilePath);
      let totalBytes = 0;

      stream.on('data', (chunk: Buffer) => {
        totalBytes += chunk.length;
        if (totalBytes > MAX_SIZE) {
          stream.destroy(new Error('File size exceeds the 10MB limit.'));
        }
      });

      stream.on('error', (err) => {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        reject(err);
      });

      out.on('error', (err) => {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        reject(err);
      });

      out.on('finish', async () => {
        try {
          if (username) {
            await sharp(tempFilePath).rotate().resize(300, 300, { fit: 'cover' }).toFile(filepath);
            fs.unlinkSync(tempFilePath);
          } else {
            fs.renameSync(tempFilePath, filepath);
          }
          resolve({
            success: true,
            message: 'File uploaded successfully',
            url: `/uploads/${uniqueFilename}`,
          });
        } catch (err: any) {
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
          reject(err);
        }
      });
      stream.pipe(out);
    });
  } catch (error: any) {
    return { success: false, message: error.message || 'File upload failed.' };
  }
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
