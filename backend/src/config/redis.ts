import IORedis from "ioredis";

let redis: IORedis | null = null;

export const getRedisConnection = (): IORedis => {
  if (!redis) {
    redis = new IORedis({
      host: "127.0.0.1",
      port: 6379,
      maxRetriesPerRequest: null, // REQUIRED for BullMQ
      lazyConnect: true,
    });

    redis.on("connect", () => {
      console.log("[Redis] Connected");
    });

    redis.on("error", (err) => {
      console.error("[Redis] Error:", err.message);
      if (err.message.includes('ECONNREFUSED')) {
        console.log("[Redis] Redis server is not running. Starting Redis...");
        startRedisServer();
      }
    });

    // Try to connect
    redis.connect().catch((err) => {
      console.error("[Redis] Connection failed:", err.message);
      if (err.message.includes('ECONNREFUSED')) {
        console.log("[Redis] Starting Redis server...");
        startRedisServer();
      }
    });
  }

  return redis;
};

function startRedisServer(): void {
  console.log("[Redis] Attempting to start Redis server...");
  const { spawn } = require('child_process');
  
  // Try to start Redis using Docker
  const redisProcess = spawn('docker', ['run', '-d', '-p', '6379:6379', '--name', 'veda-ai-redis', 'redis:latest'], {
    stdio: 'inherit'
  });

  redisProcess.on('close', (code: number) => {
    if (code === 0) {
      console.log("[Redis] Redis server started successfully via Docker");
      setTimeout(() => {
        console.log("[Redis] Retrying connection...");
        if (redis) {
          redis.connect().catch(console.error);
        }
      }, 3000);
    } else {
      console.log("[Redis] Failed to start Redis via Docker. Please start Redis manually:");
      console.log("  - Option 1: docker run -d -p 6379:6379 --name veda-ai-redis redis:latest");
      console.log("  - Option 2: Install Redis locally and run 'redis-server'");
      console.log("  - Option 3: Use setup-dbs.bat script");
    }
  });
}