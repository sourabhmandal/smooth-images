import csv from "csv-parser";
import { Request, Response } from "express";
import fs from "fs-extra";
import multer from "multer";
import { createFileImageCompressionQueue } from "../queue/image-process";
import { FILE_UPLOAD_PATH } from "../utils/constants";
import { savedProductImageUrls, saveFileMetadata } from "./product.service";
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}
// Configure multer for file uploads
const upload = multer({ dest: FILE_UPLOAD_PATH });

// Type definition for the Multer file object

export function uploadCsv(req: MulterRequest, res: Response): void {
  const inputCsvFileRows: CSVRow[] = [];

  // Check if the file is provided
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  // Read and parse the CSV file
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data: CSVRow) => inputCsvFileRows.push(data))
    .on("end", async () => {
      const savedFileData = await saveFileMetadata(
        inputCsvFileRows,
        req.file?.originalname ?? ""
      );
      // Remove the file after processing
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      const savedProductImages = await savedProductImageUrls(
        inputCsvFileRows,
        savedFileData
      );

      if (savedFileData.id) {
        createFileImageCompressionQueue(
          savedFileData.id,
          savedFileData.fileName
        );

        res.json({ request_id: savedFileData.id, status: "pending" });
        return;
      }
      res.json({ request_id: null, status: "failed" });
    })
    .on("error", (err) => {
      console.error("Error reading CSV file:", err);
      res.status(500).json({ error: "Error processing file" });
    });
}
