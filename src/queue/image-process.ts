import axios from "axios";
import Queue, { Job } from "bull";
import fs from "fs-extra";
import path from "path";
import sharp from "sharp";

// Create a Bull queue named 'image-processing'
export const imageQueue = new Queue("image-processing", {
  redis: "redis://localhost:6379",
});

// Define the processing function for each image job
imageQueue.process(async (job: Job) => {
  const { imageUrl, serialNumber, sku } = job.data;

  // Download the image, compress it, and save it locally
  const compressedImagePath = await compressImage(imageUrl, serialNumber, sku);

  // Update job progress (e.g., 50% done, etc.)
  job.progress(100);

  return {
    message: "Image processed successfully",
    compressedImagePath,
  };
});

// Utility function to download and compress the image
async function compressImage(
  imageUrl: string,
  serialNumber: number,
  sku: string
): Promise<string> {
  try {
    const outputDir = path.join(__dirname, "../../uploads/processed_images");
    await fs.ensureDir(outputDir);
    const imageName = imageUrl.split("/").pop()?.split(".")[0] || "image";

    const outputFilePath = path.join(
      outputDir,
      `compressed-${serialNumber}-${imageName}.jpeg`
    );

    // Download the image and compress it using `sharp`
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "binary");
    await sharp(buffer)
      .jpeg({ quality: 50 }) // TODO: add variable quality environment variable
      .toFile(outputFilePath);

    return outputFilePath;
  } catch (error) {
    console.error("Error compressing image:", error);
    throw new Error("Image compression failed");
  }
}
