interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Define an interface for CSV row data
interface CSVRow {
  "S. No.": string;
  "Product Name": string;
  "Input Image Urls": string;
}
