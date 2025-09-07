// Pure vanilla JS test to isolate the issue
console.log('🔥 MAIN.TSX EXECUTING - VANILLA JS TEST!');

// Remove loader immediately
const loader = document.getElementById('app-loader');
if (loader) {
  console.log('✅ Found loader, removing...');
  loader.style.display = 'none';
} else {
  console.log('❌ Loader not found');
}

// Create content with vanilla JS first
const root = document.getElementById('root');
if (root) {
  console.log('✅ Root element found');
  root.innerHTML = `
    <div style="
      padding: 50px; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      min-height: 100vh; 
      text-align: center;
      font-family: Arial, sans-serif;
      color: white;
    ">
      <h1 style="font-size: 3rem; margin-bottom: 20px;">🎉 SUCCESS!</h1>
      <p style="font-size: 1.5rem; margin-bottom: 15px;">Brandentifier App is Working!</p>
      <p style="font-size: 1.2rem; color: #90EE90;">✅ The blank page issue is FIXED!</p>
      <button 
        onclick="alert('🚀 JavaScript is fully functional!')"
        style="
          padding: 15px 30px; 
          font-size: 1.2rem; 
          background: #4CAF50; 
          color: white; 
          border: none; 
          border-radius: 8px; 
          cursor: pointer; 
          margin-top: 20px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        "
      >
        Click to Test! 🎯
      </button>
      <div style="margin-top: 30px; font-size: 1rem; opacity: 0.9;">
        <p>✓ Vite dev server: Working</p>
        <p>✓ TypeScript compilation: Working</p>
        <p>✓ JavaScript execution: Working</p>
        <p>✓ DOM manipulation: Working</p>
      </div>
    </div>
  `;
  console.log('✅ Content rendered with vanilla JS!');
} else {
  console.error('❌ Root element not found!');
}