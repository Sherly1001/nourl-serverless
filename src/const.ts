import { config } from "dotenv";
config();

export const MONGO_URL = process.env.MONGO_URL;
export const PORT = parseInt(process.env.PORT || "9669");
export const NOTFOUND_FALLBACK_URL =
  process.env.NOTFOUND_FALLBACK_URL || "https://google.com";
export const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
