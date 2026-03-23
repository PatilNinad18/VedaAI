// Direct test of the updated AI service
require('dotenv').config();

console.log('=== Direct AI Service Test ===');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET');

try {
  // Import the updated AI service
  const { generateQuestionPaper } = require('./dist/src/services/ai.service.js');
  
  const testParams = {
    questionTypes: [
      { type: 'Multiple Choice Questions', count: 2, marks: 1 }
    ],
    instructions: 'Test instructions',
    subject: 'Maths', 
    className: 'Grade 10'
  };
  
  console.log('\nCalling generateQuestionPaper...');
  
  generateQuestionPaper(testParams).then(result => {
    console.log('\n✅ SUCCESS! Result:');
    console.log(JSON.stringify(result, null, 2));
    
    // Check if questions are AI-generated or fallback
    const firstQ = result.sections[0]?.questions[0]?.text;
    if (firstQ?.includes('Multiple Choice Questions Q')) {
      console.log('\n⚠️  Still using FALLBACK questions');
    } else {
      console.log('\n🎉 Using AI-generated questions!');
    }
  }).catch(error => {
    console.error('\n❌ ERROR:', error.message);
  });
  
} catch (error) {
  console.error('Import error:', error.message);
}
