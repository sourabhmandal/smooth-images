// src/config/env.ts
import dotenv from "dotenv";
import { z } from "zod";

// Define a Zod schema for your environment variables
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string().url().startsWith("postgres://"),
  REDIS_URL: z.string().url().startsWith("redis://"),
  PORT: z.coerce.number().min(1).max(65535).default(8000),
  COMPRESSION_QUALITY: z.coerce.number().min(1).max(100).default(50),
});

// Parse the environment variables
dotenv.config();
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:", parsedEnv.error.format());
  process.exit(1); // Exit the process with an error code
}

// Extract validated environment variables
export const env = parsedEnv.data;
