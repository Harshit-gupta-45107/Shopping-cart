const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Define storage for the uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    'video': ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'],
    'pdf': ['application/pdf']
  };

  const type = req.body.attachmentType;
  
  // Allow URL attachments without file upload
  if (type === 'url') {
    if (!req.body.attachmentUrl) {
      cb(new Error('URL attachment requires attachmentUrl parameter'), false);
      return;
    }
    cb(null, false); // Skip file upload for URL type
    return;
  }

  // Validate attachment type
  if (!type || !allowedTypes[type]) {
    cb(new Error('Invalid attachment type. Must be one of: image, video, pdf, url'), false);
    return;
  }

  // Validate file mimetype
  if (!allowedTypes[type].includes(file.mimetype)) {
    cb(new Error(`Invalid file type for ${type}. Allowed types: ${allowedTypes[type].join(', ')}`), false);
    return;
  }

  cb(null, true);
};

// Setup multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

// module.exports = upload;
export default upload;
