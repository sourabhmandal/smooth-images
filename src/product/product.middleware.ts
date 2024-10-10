import { NextFunction, Request, Response } from "express";
import multer, { MulterError } from "multer";

// Define the multer storage configuration
const upload = multer({ dest: "uploads/" });

// Middleware for CSV file upload
export function uploadCsvMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Wrap the multer upload in a function to handle errors
  upload.single("file")(req, res, (err: unknown) => {
    // Handle Multer errors
    if (err instanceof MulterError) {
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          error:
            'Unexpected field. Please use the field name "file" for the CSV upload.',
        });
      }
      return res.status(400).json({ error: `Multer Error: ${err.message}` });
    } else if (err) {
      // Handle other errors
      return res.status(500).json({ error: `Error uploading file: ${err}` });
    }

    // If no errors, continue to the next middleware
    next();
  });
}
