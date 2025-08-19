import { useState } from 'react';
import { useLocation } from 'wouter';

export default function AuthSimple() {
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleDemoLogin = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/demo-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@brandentifier.com',
          name: 'Demo User',
          authProvider: 'demo'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        setLocation('/industry-pulse');
      } else {
        console.error('Demo login failed:', data.message);
      }
      
    } catch (error) {
      console.error('Demo login error:', error);
    }
    
    setIsLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(0, 0, 0, 0.8) 50%, rgba(31, 41, 55, 0.9) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '400px',
        width: '100%',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Welcome to Brandentifier
        </h1>
        <p style={{ color: '#rgb(209 213 219)', marginBottom: '2rem' }}>
          AI-powered career development platform
        </p>
        
        <button
          onClick={handleDemoLogin}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px 24px',
            background: isLoading ? '#4ade80' : '#16a34a',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isLoading ? 'Setting up your account...' : 'Enter Brandentifier Now'}
        </button>
      </div>
    </div>
  );
}