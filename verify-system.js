// Complete system verification script
const axios = require('axios');

const API_BASE = 'http://localhost:4000';

async function verifySystem() {
  console.log('🔍 VedaAI System Verification');
  console.log('================================');
  
  let allTestsPassed = true;
  
  // Test 1: Basic connectivity
  try {
    console.log('\n📍 Test 1: API Connectivity');
    const response = await axios.get(`${API_BASE}/health`, { timeout: 5000 });
    console.log('✅ API is responsive');
    console.log(`   Status: ${response.data.status}`);
  } catch (error) {
    console.log('❌ API not reachable - start backend with: npm run dev:backend');
    allTestsPassed = false;
  }
  
  // Test 2: Assignment creation
  try {
    console.log('\n📍 Test 2: Assignment Creation');
    const assignmentData = {
      title: "System Verification Test",
      dueDate: "2025-12-31",
      subject: "Computer Science",
      className: "Grade 11",
      questionTypes: [
        { type: "Multiple Choice", count: 3, marks: 1 },
        { type: "Programming", count: 2, marks: 5 }
      ],
      instructions: "Test system functionality"
    };
    
    const response = await axios.post(`${API_BASE}/api/assignments`, assignmentData);
    console.log('✅ Assignment creation working');
    console.log(`   Assignment ID: ${response.data.data?.assignment?._id || 'N/A'}`);
    console.log(`   Job ID: ${response.data.data?.jobId || 'N/A'}`);
  } catch (error) {
    console.log('❌ Assignment creation failed');
    if (error.response) {
      console.log(`   Error: ${error.response.data?.error || error.response.statusText}`);
    }
    allTestsPassed = false;
  }
  
  // Test 3: Assignment listing
  try {
    console.log('\n📍 Test 3: Assignment Listing');
    const response = await axios.get(`${API_BASE}/api/assignments`);
    console.log('✅ Assignment listing working');
    console.log(`   Found ${response.data.data?.length || 0} assignments`);
  } catch (error) {
    console.log('❌ Assignment listing failed');
    allTestsPassed = false;
  }
  
  // Test 4: Frontend accessibility
  try {
    console.log('\n📍 Test 4: Frontend Accessibility');
    const response = await axios.get('http://localhost:3000', { timeout: 5000 });
    console.log('✅ Frontend is accessible');
  } catch (error) {
    console.log('❌ Frontend not reachable - start frontend with: npm run dev:frontend');
    allTestsPassed = false;
  }
  
  // Final result
  console.log('\n📊 Verification Results');
  console.log('========================');
  
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('\n🚀 System is ready for use:');
    console.log('   • Frontend: http://localhost:3000');
    console.log('   • Backend API: http://localhost:4000');
    console.log('   • Health Check: http://localhost:4000/health');
    console.log('\n📝 Next Steps:');
    console.log('   1. Open http://localhost:3000 in your browser');
    console.log('   2. Create a new assignment');
    console.log('   3. Wait for AI generation (10-30 seconds)');
    console.log('   4. View your generated question paper');
  } else {
    console.log('❌ Some tests failed. Check the errors above.');
    console.log('\n🔧 Troubleshooting:');
    console.log('   • Ensure all services are running (3 terminals)');
    console.log('   • Check ports 3000, 4000 are available');
    console.log('   • Verify OPENROUTER_API_KEY in backend/.env');
    console.log('   • Run: npm run dev:backend, npm run dev:frontend, npm run worker');
  }
  
  console.log('\n📚 For detailed guide: See DEPLOYMENT_GUIDE.md');
}

verifySystem().catch(console.error);
