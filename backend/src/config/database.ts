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
    process.exit(1);
  }
}

mongoose.connection.on("disconnected", () => {
  console.warn("[MongoDB] Disconnected. Attempting to reconnect...");
});

mongoose.connection.on("reconnected", () => {
  console.log("[MongoDB] Reconnected");
});

export default mongoose;
