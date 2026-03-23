const http = require('http');
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();
form.append('title', 'PDF Upload Test');
form.append('dueDate', '2030-01-01');
form.append('subject', 'Science');
form.append('className', 'Class 9');
form.append('questionTypes', JSON.stringify([{ type: 'Multiple Choice Questions', count: 5, marks: 1 }]));
form.append('pdf', fs.createReadStream('S:/VedaAI/veda-ai/README.md'), { filename: 'test.pdf', contentType: 'application/pdf' });

const options = {
  method: 'POST',
  host: 'localhost',
  port: 4000,
  path: '/api/assignments',
  headers: form.getHeaders(),
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    console.log('status', res.statusCode);
    console.log(data);
  });
});

req.on('error', (err) => console.error('ERROR', err));
form.pipe(req);
