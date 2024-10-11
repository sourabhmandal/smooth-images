import { NextFunction, Request, Response } from "express";
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { method, url, headers } = req;
  const logMessage = `${new Date().toISOString()} - ${method} ${url}`;
  console.log(logMessage); // Log to the console
  next(); // Pass control to the next middleware/route handler
};
