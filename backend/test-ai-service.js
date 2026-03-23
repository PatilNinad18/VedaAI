// Test the AI service directly
import { generateQuestionPaper } from './src/services/ai.service.js';
import dotenv from 'dotenv';
dotenv.config();

async function testAI() {
  console.log('=== Testing AI Service ===');
  
  const params = {
    questionTypes: [
      { type: 'Multiple Choice Questions', count: 3, marks: 1 },
      { type: 'Short Questions', count: 2, marks: 2 }
    ],
    instructions: 'All questions are compulsory',
    subject: 'Maths',
    className: 'Grade 10'
  };

  try {
    console.log('Calling generateQuestionPaper...');
    const result = await generateQuestionPaper(params);
    console.log('SUCCESS! Generated questions:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('ERROR:', error.message);
  }
}

testAI();
