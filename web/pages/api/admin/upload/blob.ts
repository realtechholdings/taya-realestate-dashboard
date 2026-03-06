import { NextApiRequest, NextApiResponse } from 'next';
import { put } from '@vercel/blob';
import multer from 'multer';

// Configure multer for file upload (smaller limit for blob upload)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB limit (under Vercel's 4.5MB limit)
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      cb(null, true);
    } else {
      cb(new Error('Only XLSX files are allowed'));
    }
  }
});

// Helper to promisify multer
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

interface UploadResponse {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<UploadResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Process file upload
    await runMiddleware(req, res, upload.single('file'));
    
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    console.log(`Uploading file to Vercel Blob: ${file.originalname} (${file.size} bytes)`);

    // Upload to Vercel Blob with a unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `rpdata-import-${timestamp}-${file.originalname}`;
    
    const blob = await put(filename, file.buffer, {
      access: 'public', // Make it publicly accessible for the import endpoint
      addRandomSuffix: false, // We already have timestamp
    });

    console.log(`File uploaded to blob storage: ${blob.url}`);

    res.status(200).json({
      success: true,
      fileUrl: blob.url,
      fileName: file.originalname,
      fileSize: file.size
    });

  } catch (error) {
    console.error('Blob upload error:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error' 
    });
  }
}

// Configure Next.js to handle file uploads (but keep under 4MB)
export const config = {
  api: {
    bodyParser: false,
  },
};