import { generateQuestionPaper } from './src/services/ai.service';

async function test() {
  const start = Date.now();
  const result = await generateQuestionPaper({
    questionTypes: [{ type: 'Multiple Choice Questions', count: 5, marks: 1 }],
    instructions: 'Generate questions for class 8 mathematics',
    subject: 'Mathematics',
    className: 'Class 8'
  });
  const end = Date.now();
  console.log('Time taken:', end - start, 'ms');
  console.log('Generated', result.sections[0].questions.length, 'questions');
  console.log('Sample question:', result.sections[0].questions[0].text);
}

test().catch(console.error);