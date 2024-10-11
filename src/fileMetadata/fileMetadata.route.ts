import express from "express";
// Import user controllers if available
import { uploadCsv } from "./product.controller";
import { uploadCsvMiddleware } from "./product.middleware";

const router = express.Router();

// Define user-related routes
router.post("/upload-csv", uploadCsvMiddleware, uploadCsv);

export default router;
