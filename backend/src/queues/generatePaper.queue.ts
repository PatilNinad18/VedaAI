import { Queue, QueueEvents } from "bullmq";
import type { GeneratePaperJobData } from "@veda-ai/shared";

export const QUEUE_NAME = "generate-paper";

// Default job options — enforce retry/backoff policy at queue level
const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: "exponential" as const,
    delay: 3000,
  },
  removeOnComplete: {
    count: 100,
    age: 60 * 60 * 24,
  },
  removeOnFail: {
    count: 50,
    age: 60 * 60 * 24 * 7,
  },
};

let queueInstance: Queue | null = null;

export function getGeneratePaperQueue(): Queue {
  if (!queueInstance) {
    queueInstance = new Queue(QUEUE_NAME, {
      connection: {
        host: "127.0.0.1",
        port: 6379,
        maxRetriesPerRequest: null,
      },
      prefix: "veda-ai",
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
      connection: {
        host: "127.0.0.1",
        port: 6379,
        maxRetriesPerRequest: null,
      },
      prefix: "veda-ai",
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
      jobId: `assignment-${assignmentId}`,
    }
  );

  console.log(
    `[Queue:${QUEUE_NAME}] Job added — jobId: ${job.id}, assignmentId: ${assignmentId}`
  );

  return job.id!;
}