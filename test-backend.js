// Simple backend test
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/health',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  console.log(`🔍 Backend Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ Backend is working!');
      console.log('📊 Response:', response);
    } catch (e) {
      console.log('❌ Invalid JSON response:', data);
    }
  });
});

req.on('error', (err) => {
  console.log('❌ Backend not reachable:', err.message);
  console.log('\n🔧 Solution:');
  console.log('1. Make sure backend is running: npm run dev');
  console.log('2. Check if port 4000 is available');
  console.log('3. Verify no firewall blocking');
});

req.on('timeout', () => {
  console.log('❌ Backend request timeout');
  req.destroy();
});

req.end();
