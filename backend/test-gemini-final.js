// Quick test for Gemini AI integration
require('dotenv').config();

console.log('=== Testing Gemini AI Integration ===');

try {
  const { generateQuestionPaper } = require('./dist/src/services/ai.service.js');
  
  console.log('\n✅ AI Service imported successfully');
  
  const testParams = {
    questionTypes: [
      { type: 'Multiple Choice Questions', count: 2, marks: 1 }
    ],
    instructions: 'Test instructions',
    subject: 'Science', 
    className: 'Grade 10'
  };
  
  console.log('\n🚀 Testing question generation...');
  
  generateQuestionPaper(testParams).then(result => {
    console.log('\n✅ SUCCESS! Generated questions:');
    
    // Check if questions are AI-generated or fallback
    const firstQ = result.sections[0]?.questions[0]?.text;
    if (firstQ?.includes('Multiple Choice Questions Q')) {
      console.log('\n❌ Still using FALLBACK questions');
    } else {
      console.log('\n🎉 Using AI-generated questions!');
      console.log('First question:', firstQ);
    }
    
    console.log('\n📊 Total sections:', result.sections.length);
    result.sections.forEach((section, i) => {
      console.log(`  Section ${i+1}: ${section.title} (${section.questions.length} questions)`);
    });
    
  }).catch(error => {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  });
  
} catch (error) {
  console.error('❌ Import error:', error.message);
}
