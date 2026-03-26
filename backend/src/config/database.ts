import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/vedaai";

export async function connectMongoDB(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("[MongoDB] Connected to:", MONGODB_URI);
  } catch (err) {
    console.error("[MongoDB] Connection failed:", err);
    console.log("[MongoDB] Please start MongoDB server:");
    console.log("  - Option 1: docker run -d -p 27017:27017 --name veda-ai-mongo mongo:latest");
    console.log("  - Option 2: Install MongoDB locally and start service");
    console.log("  - Option 3: Use setup-dbs.bat script");
    
    // Retry connection after delay
    setTimeout(() => {
      console.log("[MongoDB] Retrying connection...");
      connectMongoDB();
    }, 5000);
  }
}

mongoose.connection.on("disconnected", () => {
  console.warn("[MongoDB] Disconnected. Attempting to reconnect...");
});

mongoose.connection.on("reconnected", () => {
  console.log("[MongoDB] Reconnected");
});

export default mongoose;
