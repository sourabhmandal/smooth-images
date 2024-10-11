import path from "path";
import {
  extractImageFileName,
  removeBaseUrl,
  sanitizeImagePath,
} from "./stringProcessing";

export const FILE_UPLOAD_PATH = path.join(__dirname, "../../public", "raw");
export const FILE_PUBLIC_PATH = path.join(__dirname, "../../public");
export const PROCESSED_FILE_SAVE_PATH = (
  fileId: number,
  fileName: string,
  serialNumber: string,
  imageUrl: string
) => {
  const imagePath = removeBaseUrl(imageUrl);
  const imageNameWithExt = sanitizeImagePath(imagePath);
  const imageName = extractImageFileName(imageNameWithExt);
  return path.join(
    FILE_PUBLIC_PATH,
    `compressed-${fileId}-${
      fileName.split(".")[0]
    }-${serialNumber}-${imageName}.jpeg`
  );
};
