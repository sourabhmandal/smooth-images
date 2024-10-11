import axios from "axios";
import Queue, { Job } from "bull";
import fs from "fs-extra";
import path from "path";
import sharp from "sharp";
import { AppDataSource } from "../db";
import { FileMetadata } from "../fileMetadata/fileMetadata.model";
import { ImageProcessingStatus, ProductImages } from "../product/product.model";
import { removeBaseUrl } from "../utils/url";

const productImagesRepository = AppDataSource.getRepository(ProductImages);
const fileMetadataRepository = AppDataSource.getRepository(FileMetadata);

// Create a Bull queue named 'image-processing'
export const imageQueue = new Queue("image-processing", {
  redis: "redis://localhost:6379",
});

// Define the processing function for each image job
imageQueue.process(async (job: Job) => {
  const { imageUrl, serialNumber, fileId, fileName } = job.data;

  // Download the image, compress it, and save it locally
  const compressedImagePath = await compressImage(
    serialNumber,
    imageUrl,
    fileId,
    fileName
  );

  // Update job progress (e.g., 50% done, etc.)
  job.progress(100);

  return {
    message: "Image processed successfully",
    compressedImagePath,
  };
});

// Utility function to download and compress the image
async function compressImage(
  serialNumber: string,
  imageUrl: string,
  fileId: number,
  fileName: string
): Promise<string> {
  try {
    const outputDir = path.join(__dirname, "../../public");
    await fs.ensureDir(outputDir);
    const imageName = removeBaseUrl(imageUrl).replace(/[/\s]/g, "-");

    const outputFilePath = path.join(
      outputDir,
      `compressed-${fileId}-${
        fileName.split(".")[0]
      }-${serialNumber}-${imageName.split(".").pop()}.jpeg`
    );

    productImagesRepository.update(
      { slNo: serialNumber, status: ImageProcessingStatus.PENDING },
      {
        status: ImageProcessingStatus.PROCESSING,
      }
    );

    // Download the image and compress it using `sharp`
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "binary");
    const responseAfterCompress = await sharp(buffer)
      .jpeg({ quality: 50 }) // TODO: add variable quality environment variable
      .toFile(outputFilePath);

    fileMetadataRepository.increment({ id: fileId }, "imageProcessed", 1);

    console.log(
      "Image compressed successfully:",
      outputDir,
      outputFilePath.replace(outputDir, "http://localhost:8000/public")
    );

    productImagesRepository.update(
      { slNo: serialNumber, status: ImageProcessingStatus.PROCESSING },
      {
        processedImageUrl: `${outputFilePath.replace(
          outputDir,
          "http://localhost:8000/public"
        )}`,
        rawImageSize: buffer.length,
        processedImageSize: responseAfterCompress.size,
        status: ImageProcessingStatus.COMPLETED,
      }
    );
    return outputFilePath;
  } catch (error) {
    console.error("Error compressing image:", error);
    throw new Error("Image compression failed");
  }
}
