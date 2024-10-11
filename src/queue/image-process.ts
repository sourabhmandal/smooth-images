import axios from "axios";
import Queue, { Job } from "bull";
import fs from "fs-extra";
import sharp from "sharp";
import { env } from "../config/env";
import { AppDataSource } from "../db";
import {
  FileMetadata,
  FileProcessingStatus,
} from "../fileMetadata/fileMetadata.model";
import { ImageProcessingStatus, ProductImages } from "../product/product.model";
import { FILE_PUBLIC_PATH, PROCESSED_FILE_SAVE_PATH } from "../utils/constants";

const productImagesRepository = AppDataSource.getRepository(ProductImages);
const fileMetadataRepository = AppDataSource.getRepository(FileMetadata);

export async function createFileImageCompressionQueue(
  fileId: number,
  fileName: string
) {
  const productImages = await productImagesRepository.find({
    where: { fileMetadata: { id: fileId } },
  });

  const pendingImages = productImages.filter(
    (prImg) => prImg.status === ImageProcessingStatus.PENDING
  );

  // Create a Bull queue named 'image-processing'
  const imageQueue = new Queue(`image-processing-${fileId}-${fileName}`, {
    redis: env.REDIS_URL,
  });

  await fileMetadataRepository.update(
    { id: fileId },
    { status: FileProcessingStatus.PROCESSING }
  );

  if (pendingImages.length === 0) {
    await fileMetadataRepository.update(
      { id: fileId },
      { status: FileProcessingStatus.COMPLETED }
    );
  } else {
    // Create image processing jobs
    imageQueue.addBulk(
      pendingImages.map((data) => ({
        data: {
          serialNumber: data.slNo,
          sku: data.sku,
          imageUrl: data.rawImageUrl,
          fileId: fileId,
          fileName: fileName,
        },
      }))
    );
  }

  imageQueue.on("completed", async (job: Job) => {
    console.log(`Image job ${job.id} : ${job.name} completed`);
    await fileMetadataRepository.update(
      { id: fileId },
      { status: FileProcessingStatus.COMPLETED }
    );
  });

  // Define the processing function for each image job
  imageQueue.process(async (job: Job) => {
    const { imageUrl, sku, serialNumber, fileId, fileName } = job.data;

    productImagesRepository.update(
      {
        slNo: serialNumber,
        sku: sku,
        status: ImageProcessingStatus.PENDING,
        fileMetadata: { id: fileId, fileName: fileName },
      },
      {
        status: ImageProcessingStatus.PROCESSING,
      }
    );

    // Download the image, compress it, and save it locally
    const compressedImagePath = await compressImage(
      serialNumber,
      imageUrl,
      fileId,
      fileName
    );

    job.progress(100);
    productImagesRepository.update(
      {
        slNo: serialNumber,
        sku: sku,
        fileMetadata: { id: fileId, fileName: fileName },
      },
      {
        status: ImageProcessingStatus.COMPLETED,
      }
    );

    return {
      message: "Image processed successfully",
      compressedImagePath,
    };
  });
}

// Utility function to download and compress the image
async function compressImage(
  serialNumber: string,
  imageUrl: string,
  fileId: number,
  fileName: string
): Promise<string> {
  try {
    await fs.ensureDir(FILE_PUBLIC_PATH);
    const outputFilePath = PROCESSED_FILE_SAVE_PATH(
      fileId,
      fileName.split(".")[0],
      serialNumber,
      imageUrl
    );

    // Download the image and compress it using `sharp`
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "binary");
    const responseAfterCompress = await sharp(buffer)
      .jpeg({ quality: 50 }) // TODO: add variable quality environment variable
      .toFile(outputFilePath);
    productImagesRepository.update(
      { slNo: serialNumber, status: ImageProcessingStatus.PROCESSING },
      {
        processedImageUrl: `${outputFilePath.replace(
          FILE_PUBLIC_PATH,
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
