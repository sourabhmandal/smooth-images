import csv from 'csv-parser';
import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import multer, { MulterError } from 'multer';

// Extending the Request interface to include Multer's file property
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const app = express();
const PORT = 8000;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Define an interface for CSV row data
interface CSVRow {
  'S. No.': string;
  'Product Name': string;
  'Input Image Urls': string;
}

// Type definition for the Multer file object
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

app.get('/health', (req: Request, res: Response): void => {
  res.json({status: "SUCCESS", message: 'server is live!'});
})

// Middleware to handle CSV upload and parsing
app.post('/upload-csv', (req: Request, res: Response, next: NextFunction) => {
  // Wrap multer upload in a custom function to handle errors
  upload.single('file')(req, res, (err: any) => {
    // Handle Multer errors
    if (err instanceof MulterError) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: 'Unexpected field. Please use the field name "file" for the CSV upload.' });
      }
      return res.status(400).json({ error: `Multer Error: ${err.message}` });
    } else if (err) {
      // Handle other errors
      return res.status(500).json({ error: 'Error uploading file' });
    }

    // Continue to the next middleware if no error
    next();
  });
}, (req: MulterRequest, res: Response): void => {
  const results: CSVRow[] = [];

  // Check if the file is provided
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  // Read and parse the CSV file
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data: CSVRow) => {
      const imageList = data['Input Image Urls'].split(',').map((url) => url.trim());
      results.push({
        
      })
    }) // Push each row to the results array
    .on('end', () => {
      // Remove the file after processing
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      // Save the data to database


      // Send the parsed data as response
      res.json(results);
    })
    .on('error', (err) => {
      console.error('Error reading CSV file:', err);
      res.status(500).json({ error: 'Error processing file' });
    });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
