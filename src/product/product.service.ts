import axios from "axios";
import { AppDataSource } from "../db";
import { FileMetadata } from "../fileMetadata/fileMetadata.model";
import { ProductImages } from "./product.model";

const fileMetadataRepository = AppDataSource.getRepository(FileMetadata);
const productImagesRepository = AppDataSource.getRepository(ProductImages);

export async function saveFileMetadata(
  inputCsv: Array<CSVRow>,
  originalname: string
): Promise<FileMetadata> {
  const allImagesCount = inputCsv.reduce(
    (acc, curr) =>
      curr["Input Image Urls"].split(",").map((url) => url.trim()).length + acc,
    0
  );
  const fileMetadata: FileMetadata = {
    fileName: originalname,
    totalImages: allImagesCount,
    images: [],
  };

  const reqFile = await fileMetadataRepository
    .createQueryBuilder()
    .insert()
    .into(FileMetadata) // Ensure you specify the correct entity here
    .values(fileMetadata)
    .orUpdate(["totalImages", "fileName"], ["fileName"])
    .returning("*") // This will return all columns of the affected rows
    .execute();

  return reqFile.raw[0] as FileMetadata;
}

export async function savedProductImageUrls(
  inputCsvFileRows: Array<CSVRow>,
  fileMetadata: FileMetadata
): Promise<Array<ProductImages>> {
  let insertData: Array<ProductImages> = [];
  // create file image list
  await Promise.allSettled(
    inputCsvFileRows.map(async (data) => {
      const daaa = data["Input Image Urls"].split(",").map((url) => url.trim());

      const insertValues: ProductImages[] = (
        await Promise.allSettled(
          daaa.map(async (url) => {
            const response = await axios.get(url, {
              responseType: "arraybuffer",
            });
            const buffer = Buffer.from(response.data, "binary");

            return {
              slNo: data["S. No."],
              sku: data["Product Name"],
              rawImageUrl: url,
              rawImageSize: buffer.length,
              fileMetadata: fileMetadata,
            } as ProductImages;
          })
        )
      )
        .map((r) => (r.status == "fulfilled" ? r.value : undefined))
        .filter((r): r is ProductImages => r !== undefined);

      insertData.push(...insertValues);
    })
  );

  const query = productImagesRepository
    .createQueryBuilder()
    .insert()
    .into(ProductImages)
    .values(insertData)
    .orIgnore();

  // Save the data to database
  const insertResponse = await query.execute();

  return insertResponse.raw as Array<ProductImages>;
}
