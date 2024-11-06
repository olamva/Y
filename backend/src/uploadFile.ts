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
