import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

if (!GEMINI_API_KEY) {
  console.error("No GEMINI_API_KEY found");
  process.exit(1);
}

const client = new GoogleGenerativeAI(GEMINI_API_KEY);

async function testAPI() {
  const modelsToTry = ["gemini-pro", "gemini-1.0-pro", "gemini-pro-vision"];

  for (const modelName of modelsToTry) {
    try {
      console.log(`\n🧪 Testing model: ${modelName}`);

      const model = client.getGenerativeModel({
        model: modelName,
      });

      const response = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: "Say 'Hello World' in exactly 2 words." }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 10,
          temperature: 0.1,
        },
      });

      const result = response.response.text();
      console.log("✅ SUCCESS with model:", modelName);
      console.log("Response:", result.trim());

      // If successful, update the .env file
      console.log(`\n🔄 Updating .env to use model: ${modelName}`);
      const fs = require('fs');
      const envPath = '.env';
      let envContent = fs.readFileSync(envPath, 'utf8');
      envContent = envContent.replace(/GEMINI_MODEL=.*/, `GEMINI_MODEL=${modelName}`);
      fs.writeFileSync(envPath, envContent);
      console.log("✅ Updated .env file");

      return; // Exit on first success

    } catch (err) {
      console.error(`❌ Failed with ${modelName}:`, err.message);
    }
  }

  console.log("\n❌ No working models found. The API key might be invalid or have insufficient permissions.");
}

testAPI();