const fs = require('fs');
const FormData = require('form-data');
const http = require('http');

// Test the resume analysis endpoint
const testResumeAnalysis = async () => {
  console.log('Testing resume analysis endpoint...');
  
  // Create a simple test file content (simulating a PDF)
  const testContent = 'John Doe\nSoftware Engineer\nExperience: 5 years in web development\nSkills: JavaScript, React, Node.js\nEducation: BS Computer Science';
  
  const form = new FormData();
  form.append('file', testContent, {
    filename: 'test-resume.txt',
    contentType: 'text/plain'
  });
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/resume/analyze',
    method: 'POST',
    headers: {
      ...form.getHeaders()
    }
  };
  
  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('Response:', JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('Raw response:', data);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });
  
  form.pipe(req);
  req.end();
};

testResumeAnalysis();
