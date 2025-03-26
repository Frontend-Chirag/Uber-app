import { z } from "zod";

// Define schema for environment variables
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Database
  DATABASE_URL: z.string().url(),

  // App URL
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // JWT Secrets & Expiry
  JWT_SECRET: z.string().min(32),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  ACCESS_TOKEN_SECRET: z.string().min(32),
  TOKEN_EXPIRY: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRY: z.string().default("7d"),
  ACCESS_TOKEN_EXPIRY: z.string().default("15m"),

  // Redis
  REDIS_URL: z.string(),
  REDIS_USER: z.string(),
  REDIS_PASS: z.string(),

  // Twilio SMS
  TWILIO_ACCOUNT_SID: z.string(),
  TWILIO_AUTH_TOKEN: z.string(),
  TWILIO_PHONE_NUMBER: z.string(),

  // Email
  EMAIL_USER: z.string().email(),
  EMAIL_PASS: z.string(),
});

// Validate the environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Invalid environment variables:",
    parsedEnv.error.flatten().fieldErrors
  );
  throw new Error("Invalid or missing environment variables.");
}

// Export validated config
export const ENV = parsedEnv.data;
