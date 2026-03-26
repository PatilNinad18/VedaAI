// Mock BullMQ for development when Redis is not available
export interface JobData {
  assignmentId: string;
}

export interface MockJob {
  id: string;
  data: JobData;
  updateProgress: (progress: number) => Promise<void>;
}

export class MockQueue {
  private jobs: MockJob[] = [];
  private processor?: (job: MockJob) => Promise<void>;
  private jobIdCounter = 1;

  async add(name: string, data: JobData): Promise<MockJob> {
    const job: MockJob = {
      id: `job_${this.jobIdCounter++}`,
      data,
      updateProgress: async (progress: number) => {
        console.log(`[MockQueue] Job ${job.id} progress: ${progress}%`);
      }
    };
    
    this.jobs.push(job);
    console.log(`[MockQueue] Job added: ${job.id} for assignment: ${data.assignmentId}`);
    
    // Process job immediately in mock
    if (this.processor) {
      setTimeout(() => this.processor!(job), 100);
    }
    
    return job;
  }

  process(callback: (job: MockJob) => Promise<void>): void {
    this.processor = callback;
    console.log("[MockQueue] Worker processor registered");
  }

  async getJob(jobId: string): Promise<MockJob | undefined> {
    return this.jobs.find(job => job.id === jobId);
  }
}

export const generatePaperQueue = new MockQueue();
