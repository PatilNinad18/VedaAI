import IORedis from "ioredis";

let redis: IORedis | null = null;

export const getRedisConnection = (): IORedis => {
  if (!redis) {
    redis = new IORedis({
      host: "127.0.0.1",
      port: 6379,
      maxRetriesPerRequest: null, // REQUIRED for BullMQ
    });

    redis.on("connect", () => {
      console.log("[Redis] Connected");
    });

    redis.on("error", (err) => {
      console.error("[Redis] Error:", err.message);
    });
  }

  return redis;
};