const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

console.log('=== Gemini API Test ===');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET');
console.log('Key length:', process.env.GEMINI_API_KEY?.length || 0);

if (!process.env.GEMINI_API_KEY) {
  console.error('ERROR: No GEMINI_API_KEY found in environment');
  process.exit(1);
}

async function testGemini() {
  try {
    console.log('Initializing Gemini...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✓ GenAI initialized');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('✓ Model created: gemini-1.5-flash');
    
    const testPrompt = 'Return only valid JSON: {"test": "working", "timestamp": "' + Date.now() + '"}';
    console.log('Testing API call...');
    
    const result = await model.generateContent(testPrompt);
    const response = result.response.text();
    console.log('Raw response:', response);
    
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(response);
      console.log('✅ SUCCESS - Valid JSON received:', parsed);
    } catch (e) {
      console.log('⚠️  Response received but not valid JSON');
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Full error:', error);
  }
}

testGemini();
