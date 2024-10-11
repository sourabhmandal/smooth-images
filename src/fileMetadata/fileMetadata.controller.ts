import { Request, Response } from "express";
import { AppDataSource } from "../db";
import { FileMetadata } from "./fileMetadata.model";

const fileMetadataRepository = AppDataSource.getRepository(FileMetadata);

export async function fileUploadStatus(req: Request, res: Response) {
  const fileId = parseInt(req.params.id);

  try {
    if (fileId > 0) {
      const fileResponse = await fileMetadataRepository.findOneByOrFail({
        id: fileId,
      });
      res.json({
        request_id: fileId,
        status: fileResponse.status,
      });
      return;
    }

    res.json({
      request_id: null,
      status: "error",
    });
    return;
  } catch (err) {
    console.error(err);
    res.json({
      request_id: null,
      status: "error",
    });
  }
}
