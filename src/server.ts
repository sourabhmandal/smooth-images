import express, { Application, Request, Response } from "express";
import path from "path";
import { env } from "./config/env";
import fileRouter from "./fileMetadata/fileMetadata.route";
import { requestLogger } from "./middlewares";
import productRouter from "./product/product.route";

// Extending the Request interface to include Multer's file property

async function main() {
  const app: Application = express();
  app.use(express.json());
  app.use("/public", express.static(path.join(__dirname, "../public")));
  app.use("/public/raw", express.static(path.join(__dirname, "../public/raw")));
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
