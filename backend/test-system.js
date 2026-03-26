// Simple test to verify the system works
const axios = require('axios');

async function testSystem() {
  console.log('🧪 Testing VedaAI System...');
  
  try {
    // Test 1: Health check
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:4000/health');
    console.log('✅ Health check:', healthResponse.data);
    
    // Test 2: Create assignment
    console.log('\n2. Testing assignment creation...');
    const assignmentData = {
      title: "Test Mathematics Paper",
      dueDate: "2025-06-15",
      subject: "Mathematics",
      className: "Grade 10",
      questionTypes: [
        { type: "Multiple Choice", count: 5, marks: 1 },
        { type: "Short Answer", count: 3, marks: 2 }
      ],
      instructions: "Focus on algebra and geometry"
    };
    
    const createResponse = await axios.post('http://localhost:4000/api/assignments', assignmentData);
    console.log('✅ Assignment created:', createResponse.data);
    
    // Test 3: List assignments
    console.log('\n3. Testing assignment list...');
    const listResponse = await axios.get('http://localhost:4000/api/assignments');
    console.log('✅ Assignments list:', listResponse.data);
    
    console.log('\n🎉 All tests passed! System is working.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testSystem();
