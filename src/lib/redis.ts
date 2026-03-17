import Redis from "ioredis";

const redisUrl = process.env.KV_REDIS_URL;

if (!redisUrl) {
  throw new Error("KV_REDIS_URL is not defined in environment variables");
}

export const kv = new Redis(redisUrl);
