// Force domain refresh by creating a simple health endpoint
import express from 'express';

const testApp = express();

testApp.get('/domain-test', (req, res) => {
  res.json({
    status: 'DOMAIN_TEST_SUCCESS',
    timestamp: new Date().toISOString(),
    headers: req.headers,
    domain: process.env.REPLIT_DOMAINS,
    message: 'If you see this, the domain is working!'
  });
});

testApp.get('/force-refresh', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Domain Refresh Test</title></head>
    <body>
      <h1>🚀 Domain Connection Test</h1>
      <p>✅ External domain is working!</p>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      <p><a href="/">← Go to Brandentifier</a></p>
      <script>
        console.log('Domain test successful - redirecting to main app in 3 seconds');
        setTimeout(() => window.location.href = '/', 3000);
      </script>
    </body>
    </html>
  `);
});

// Try binding to a different port temporarily for testing
const testPort = 5001;
testApp.listen(testPort, '0.0.0.0', () => {
  console.log(`🔧 Domain test server running on port ${testPort}`);
  console.log(`   Test URL: https://${process.env.REPLIT_DOMAINS}:${testPort}/force-refresh`);
});