// Mock Redis for development when Redis is not available
export class RedisMock {
  private store = new Map<string, string>();
  private keyPrefix: string = 'bull:';
  
  async set(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }
  
  async get(key: string): Promise<string | null> {
    return this.store.get(key) || null;
  }
  
  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
  
  async publish(channel: string, message: string): Promise<void> {
    console.log(`[MOCK Redis] Publish to ${channel}:`, message);
  }
  
  async subscribe(channel: string): Promise<void> {
    console.log(`[MOCK Redis] Subscribed to ${channel}`);
  }
  
  async ping(): Promise<string> {
    return "PONG";
  }
  
  async duplicate(): Promise<RedisMock> {
    return new RedisMock();
  }
  
  async disconnect(): Promise<void> {
    console.log("[MOCK Redis] Disconnected");
  }
  
  on(event: string, callback: Function): void {
    if (event === 'error') {
      // Mock error handler - never called
      return;
    }
    console.log(`[MOCK Redis] Event listener added for: ${event}`);
  }
  
  async connect(): Promise<void> {
    console.log("[MOCK Redis] Connected");
  }
  
  // BullMQ specific methods
  get options(): any {
    return {
      keyPrefix: this.keyPrefix,
      maxRetriesPerRequest: null,
    };
  }
  
  setOptions(options: any): void {
    if (options.keyPrefix !== undefined) {
      this.keyPrefix = options.keyPrefix || 'bull:';
    }
  }
}

export const redis = new RedisMock();
