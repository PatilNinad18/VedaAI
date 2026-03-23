// Comprehensive test to debug the AI service
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('=== Comprehensive AI Service Debug ===');
console.log('Current directory:', __dirname);
console.log('Env file path:', path.join(__dirname, '.env'));
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0);
console.log('GEMINI_API_KEY starts with AIza:', process.env.GEMINI_API_KEY?.startsWith('AIza'));

// Try to import and test the AI service
async function testAIService() {
  try {
    console.log('\n=== Testing AI Service Import ===');
    
    // Import the compiled JS version
    const { generateQuestionPaper } = require('./dist/src/services/ai.service.js');
    console.log('✓ AI service imported successfully');
    
    console.log('\n=== Testing Question Generation ===');
    const params = {
      questionTypes: [
        { type: 'Multiple Choice Questions', count: 2, marks: 1 }
      ],
      instructions: 'Test instructions',
      subject: 'Maths',
      className: 'Grade 10'
    };
    
    console.log('Calling generateQuestionPaper with params:', JSON.stringify(params, null, 2));
    
    const result = await generateQuestionPaper(params);
    console.log('\n✅ SUCCESS! Generated result:');
    console.log(JSON.stringify(result, null, 2));
    
    // Check if it's using fallback or AI
    const firstQuestion = result.sections[0]?.questions[0]?.text;
    if (firstQuestion?.includes('Multiple Choice Questions Q')) {
      console.log('\n⚠️  WARNING: Using FALLBACK questions (hardcoded)');
    } else {
      console.log('\n✅ Using AI-generated questions');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  }
}

// First build the TypeScript
const { exec } = require('child_process');
console.log('\n=== Building TypeScript ===');
exec('npm run build', (error, stdout, stderr) => {
  if (error) {
    console.error('Build error:', error);
    return;
  }
  console.log('✓ Build completed');
  console.log(stdout);
  if (stderr) console.log('Build warnings:', stderr);
  
  // Test after build
  testAIService();
});
