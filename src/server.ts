import express, { Application, Request, Response } from "express";
import { env } from "./config/env";
import fileRouter from "./fileMetadata/fileMetadata.route";
import { requestLogger } from "./middlewares";
import productRouter from "./product/product.route";
import { FILE_PUBLIC_PATH } from "./utils/constants";

// Extending the Request interface to include Multer's file property

async function main() {
  const app: Application = express();
  app.use(express.json());
  app.use("/public", express.static(FILE_PUBLIC_PATH));
  app.use(requestLogger);
  app.use("/file", fileRouter);
  app.use("/product", productRouter);
  app.get("/health", (req: Request, res: Response): void => {
    res.json({ status: "SUCCESS", message: "server is live!" });
  });

  // Start the server
  app.listen(env.PORT, () => {
    console.log(`Server is running on http://localhost:${env.PORT}`);
  });
}

main();
