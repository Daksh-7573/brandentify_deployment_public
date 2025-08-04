import { createRoot } from "react-dom/client";

// Remove HTML loader immediately when React app starts
const loader = document.getElementById('app-loader');
if (loader) {
  loader.style.display = 'none';
}

// Console log to verify main.tsx loads
console.log('🚀 Main.tsx loaded - Brandentifier app starting');

// Simple test render to ensure React is working
const MinimalTest = () => {
  console.log('MinimalTest component rendering');
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.backgroundColor = '#ff0000'; // Red background to see if anything renders
  document.body.style.minHeight = '100vh';
  
  return (
    <div id="minimal-test" style={{
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#4CAF50', // Bright green
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      zIndex: 99999,
      border: '5px solid red'
    }}>
      <div>
        <h1>REACT IS WORKING!</h1>
        <p>If you see this green screen, React is rendering.</p>
        <p>Time: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

// Use test app to verify rendering
const useTestApp = true; // Change to true to see if React works

// Force clear any existing styles
document.head.innerHTML = '';
document.body.innerHTML = '<div id="root"></div>';

const root = document.getElementById("root");
if (root) {
  console.log('Root element found, creating React root');
  createRoot(root).render(<MinimalTest />);
} else {
  console.error('Root element not found!');
  document.body.innerHTML = '<h1 style="color: red; font-size: 48px;">ROOT ELEMENT NOT FOUND</h1>';
}
