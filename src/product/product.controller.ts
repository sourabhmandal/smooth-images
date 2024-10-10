import csv from "csv-parser";
import { Request, Response } from "express";
import fs from "fs";
import multer from "multer";
import { AppDataSource } from "../db/index";
import { ProductImages } from "./product.model";
const productImagesRepository = AppDataSource.getRepository(ProductImages);

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}
// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Define an interface for CSV row data
interface CSVRow {
  "S. No.": string;
  "Product Name": string;
  "Input Image Urls": string;
}

// Type definition for the Multer file object
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export function uploadCsv(req: MulterRequest, res: Response): void {
  const results: CSVRow[] = [];

  // Check if the file is provided
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  // Read and parse the CSV file
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data: CSVRow) => results.push(data))
    .on("end", async () => {
      // Remove the file after processing
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      let insertData: Array<ProductImages> = [];
      results.map((data) => {
        const daaa = data["Input Image Urls"]
          .split(",")
          .map((url) => url.trim());

        const insertValues = daaa.map((url) => ({
          slNo: data["S. No."],
          sku: data["Product Name"],
          imageUrl: url,
        }));

        return insertData.push(...insertValues);
      });

      // Save the data to database
      const insertResponse = await productImagesRepository
        .createQueryBuilder()
        .insert()
        .into(ProductImages)
        .values(insertData)
        .execute();
      res.json({ savedProduct: insertResponse.generatedMaps });
    })
    .on("error", (err) => {
      console.error("Error reading CSV file:", err);
      res.status(500).json({ error: "Error processing file" });
    });
}
