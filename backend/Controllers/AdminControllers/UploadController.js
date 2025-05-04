import multer from 'multer';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDFs and images are allowed.'));
    }
  }
}).single('timetableFile');

export const processTimetableFile = async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file uploaded!');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    console.log('Received file:', req.file);
    console.log('Body:', req.body);
    console.log('File path to process:', req.file.path);

    // Call Python script for table extraction
    const python = spawn('python', [
      'Python/extractTimetable.py',
      req.file.path,
      req.file.mimetype
    ]);

    let dataString = '';
    python.stdout.on('data', (data) => { dataString += data.toString(); });

    python.stderr.on('data', (data) => { console.error(`stderr: ${data}`); });

    python.on('close', (code) => {
      fs.unlinkSync(req.file.path); // Clean up
      if (code !== 0) return res.status(500).json({ message: 'Extraction failed' });

      // Send extracted data for preview (do not save yet)
      const extracted = JSON.parse(dataString);
      res.status(200).json({ preview: extracted });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing file' });
  }
};

// This function would need to be customized based on your timetable format
function parseTimetableText(text) {
  // Example parsing logic (highly simplified)
  const entries = [];
  
  // Split text into lines and look for patterns
  const lines = text.split('\n');
  
  // Regex patterns to extract information (customize these)
  const modulePattern = /([A-Z]{2}\d{4})/;
  const dayPattern = /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i;
  const timePattern = /(\d{1,2}:\d{2})\s*(?:AM|PM)?-(\d{1,2}:\d{2})\s*(?:AM|PM)?/i;
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines
    if (!line.trim()) continue;
    
    // Try to extract module code, day, times, etc.
    const moduleMatch = line.match(modulePattern);
    const dayMatch = line.match(dayPattern);
    const timeMatch = line.match(timePattern);
    
    if (moduleMatch && dayMatch && timeMatch) {
      entries.push({
        module: moduleMatch[1],
        day: dayMatch[1],
        startTime: timeMatch[1],
        endTime: timeMatch[2],
        // Other fields would need to be populated or defaulted
      });
    }
  }
  
  return entries;
}