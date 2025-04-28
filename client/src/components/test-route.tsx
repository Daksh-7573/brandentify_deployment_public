import React from 'react';

interface TestRouteProps {
  username: string;
}

const TestRoute: React.FC<TestRouteProps> = ({ username }) => {
  return (
    <div style={{ 
      position: 'fixed',
      left: 0,
      top: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'white',
      zIndex: 9999,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Route Parameter Test</h1>
      <div style={{ padding: '20px', border: '2px solid blue', borderRadius: '8px', backgroundColor: '#f0f8ff' }}>
        <h2>Username parameter received:</h2>
        <pre style={{ 
          padding: '10px', 
          backgroundColor: '#eee', 
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontFamily: 'monospace',
          marginTop: '10px'
        }}>
          {username || 'No username received'}
        </pre>
      </div>
      <div style={{ marginTop: '20px' }}>
        <p>URL Path: <code>{window.location.pathname}</code></p>
        <p>Full URL: <code>{window.location.href}</code></p>
      </div>
      <div style={{ marginTop: '30px' }}>
        <h3>Test other URL formats:</h3>
        <ul style={{ textAlign: 'left' }}>
          <li><a href="/test-username" style={{ color: 'blue' }}>/test-username</a> - Direct username format</li>
          <li><a href="/@test-username" style={{ color: 'blue' }}>/@test-username</a> - With @ symbol</li>
          <li><a href="/profile/test-username" style={{ color: 'blue' }}>/profile/test-username</a> - Profile path format</li>
        </ul>
      </div>
    </div>
  );
};

export default TestRoute;