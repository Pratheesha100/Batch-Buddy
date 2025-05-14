import multer from 'multer';
// Removed imports: spawn, fs, path, mongoose, and specific models for mapping

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the uploads directory exists
    const uploadPath = 'uploads/';
    // Use fs from the standard library if needed elsewhere, or remove if not.
    // For now, assuming fs might be needed by multer or other logic.
    // If fs is ONLY for the python script logic, this mkdirSync might need adjustment
    // or removal if no files should be saved temporarily.
    // Re-adding fs import just for mkdirSync for now.
    const fs = require('fs');
    try {
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (err) { 
      console.error("Error creating upload directory:", err);
      cb(err);
     } 
  },
  filename: (req, file, cb) => {
    // Re-adding path import just for extname for now.
    const path = require('path');
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    // Allow PDF and common Excel/CSV formats for flexibility, Python script should handle specifics
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, XLSX, XLS, or CSV are allowed.'));
    }
  }
}).single('timetableFile');

// --- REMOVED Helper Function mapRawEntryToTimetableData --- 

export const processTimetableFile = async (req, res) => {
  console.warn('processTimetableFile called, but Python script integration has been removed.');
  
  // Clean up uploaded file if it exists, as it won't be processed
  if (req.file && req.file.path) {
      const fs = require('fs'); // Re-import fs locally if needed
      try {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
            console.log('Cleaned up unprocessed uploaded file:', req.file.path);
          }
      } catch (unlinkErr) {
          console.error('Error cleaning up unprocessed uploaded file:', unlinkErr);
      }
  }

  // Return empty preview or an error message to frontend
  // Option 1: Empty preview (might be less confusing for user than an error)
  // res.status(200).json({ preview: [], message: 'File upload processing via script is currently disabled.' });
  
  // Option 2: Send an error status indicating the feature is non-functional
  res.status(501).json({ message: 'File processing via Python script is not implemented or has been disabled.', preview: [] });
};