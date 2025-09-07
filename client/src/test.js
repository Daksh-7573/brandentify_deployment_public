// Pure JavaScript file to test execution
console.log('🧪 TEST.JS IS EXECUTING!');

// Remove loader
const loader = document.getElementById('app-loader');
if (loader) {
  loader.style.display = 'none';
}

// Show success message
const root = document.getElementById('root');
if (root) {
  root.innerHTML = `
    <div style="padding: 40px; background: #28a745; color: white; text-align: center; min-height: 100vh;">
      <h1>🎉 JAVASCRIPT IS WORKING!</h1>
      <p>The blank page issue is fixed!</p>
      <p>Pure .js file execution successful</p>
    </div>
  `;
}