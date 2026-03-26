const http = require('http');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/health',
  method: 'GET',
  timeout: 3000
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  if (res.statusCode === 200) {
    console.log('✅ Backend is RUNNING and responding!');
    console.log('🌐 Access at: http://localhost:4000');
  } else {
    console.log('❌ Backend not responding correctly');
  }
  
  res.on('data', (data) => {
    try {
      const response = JSON.parse(data);
      console.log('📊 Health Response:', response);
    } catch (e) {
      console.log('📊 Raw Response:', data.toString());
    }
  });
});

req.on('error', (err) => {
  console.log('❌ Connection Error:', err.message);
  console.log('\n🔧 Solution:');
  console.log('1. Make sure backend is running: npm run dev');
  console.log('2. Check if port 4000 is available');
  console.log('3. Verify no firewall blocking');
});

req.on('timeout', () => {
  console.log('❌ Request timeout');
  req.destroy();
});

req.end();
