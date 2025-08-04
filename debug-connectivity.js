// Emergency connectivity test
import http from 'http';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/',
  method: 'GET'
};

console.log('Testing internal server connectivity...');

const req = http.request(options, (res) => {
  console.log(`✅ Server responding: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`Content length: ${data.length} bytes`);
    console.log('First 200 characters:', data.substring(0, 200));
    process.exit(0);
  });
});

req.on('error', (err) => {
  console.error(`❌ Connection error: ${err.message}`);
  process.exit(1);
});

req.setTimeout(5000, () => {
  console.error('❌ Request timeout');
  req.destroy();
  process.exit(1);
});

req.end();