import express, { Application, Request, Response } from "express";
import path from "path";
import productRouter from "./product/product.route";

// Extending the Request interface to include Multer's file property

async function main() {
  const PORT = 8000;

  const app: Application = express();
  app.use(express.json());
  app.use("/public", express.static(path.join(__dirname, "../public")));

  app.use("/product", productRouter);
  app.get("/health", (req: Request, res: Response): void => {
    res.json({ status: "SUCCESS", message: "server is live!" });
  });

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

main();
