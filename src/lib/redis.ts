import { Redis } from "@upstash/redis";

/**
 * Switch from ioredis to @upstash/redis REST SDK to prevent connection 
 * pooling issues on serverless platforms like Vercel.
 */
export const kv = new Redis({
  url: process.env.UPSTASH_REDIS_KV_REST_API_URL!,
  token: process.env.UPSTASH_REDIS_KV_REST_API_TOKEN!,
});
