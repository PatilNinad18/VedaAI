// Temporary test - delete this file after testing
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

console.log('=== Gemini Direct Test ===');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET');

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ No API key found');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function test() {
  try {
    console.log('🚀 Testing Gemini API...');
    const result = await model.generateContent('Return JSON: {"test": "hello", "timestamp": "' + Date.now() + '"}');
    const response = result.response.text();
    console.log('✅ Raw response:', response);
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Parsed JSON:', parsed);
      console.log('🎉 Gemini API is working!');
    } else {
      console.log('⚠️  No JSON found in response');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
