import express from "express";
import { fileUploadStatus } from "./fileMetadata.controller";

const router = express.Router();

// Define user-related routes
router.get("/status/:id", fileUploadStatus);

export default router;
