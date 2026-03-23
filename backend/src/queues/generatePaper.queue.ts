import { Queue, QueueEvents } from "bullmq";
import { getRedisConnection } from "../config/redis";
import type { GeneratePaperJobData } from "@veda-ai/shared";

export const QUEUE_NAME = "generate-paper";

// Default job options — enforce retry/backoff policy at queue level
const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: "exponential" as const,
    delay: 3000, // 3s, 6s, 12s
  },
  removeOnComplete: {
    count: 100, // Keep last 100 completed jobs
    age: 60 * 60 * 24, // 24 hours
  },
  removeOnFail: {
    count: 50,
    age: 60 * 60 * 24 * 7, // 7 days
  },
};

let queueInstance: Queue | null = null;

export function getGeneratePaperQueue(): Queue {
  if (!queueInstance) {
    queueInstance = new Queue(QUEUE_NAME, {
      connection: getRedisConnection() as any,
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    });

    queueInstance.on("error", (err) => {
      console.error(`[Queue:${QUEUE_NAME}] Queue error:`, err.message);
    });

    console.log(`[Queue:${QUEUE_NAME}] Queue initialized`);
  }

  return queueInstance;
}

// QueueEvents for monitoring job lifecycle (used by the API to track jobs)
let queueEventsInstance: QueueEvents | null = null;

export function getQueueEvents(): QueueEvents {
  if (!queueEventsInstance) {
    queueEventsInstance = new QueueEvents(QUEUE_NAME, {
      connection: getRedisConnection() as any,
    });
  }
  return queueEventsInstance;
}

export async function addGeneratePaperJob(
  assignmentId: string
): Promise<string> {
  const queue = getGeneratePaperQueue();

  const job = await queue.add(
    "generate-paper",
    { assignmentId },
    {
      jobId: `assignment-${assignmentId}`, // Deduplicate: one job per assignment
    }
  );

  console.log(
    `[Queue:${QUEUE_NAME}] Job added — jobId: ${job.id}, assignmentId: ${assignmentId}`
  );

  return job.id!;
}
