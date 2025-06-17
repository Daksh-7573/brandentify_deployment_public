// Minimal test for quest API issue
import http from 'http';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/quest-definitions',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('Testing quest definitions API...');

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    try {
      const json = JSON.parse(data);
      if (json.length > 0) {
        console.log('SUCCESS: Quest definitions returned');
      } else {
        console.log('API returned empty array');
      }
    } catch (e) {
      console.log('Failed - not valid JSON');
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.end();