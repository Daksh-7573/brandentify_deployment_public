import { useEffect, useState } from 'react';
import { handleRedirectResult } from '@/lib/firebase-auth';

export default function AuthCallback() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log('Auth callback page loaded, processing redirect result...');
        
        // Process the redirect result from Google
        const user = await handleRedirectResult();
        
        if (user) {
          console.log('Authentication successful:', user.email);
          setStatus('success');
          setMessage('Authentication successful! Redirecting to Industry Pulse...');
          
          // Redirect will be handled by handleRedirectResult
          // Add a fallback timeout just in case
          setTimeout(() => {
            window.location.href = '/industry-pulse';
          }, 2000);
        } else {
          console.log('No user found in redirect result');
          setStatus('error');
          setMessage('Authentication failed. Redirecting back to login...');
          
          setTimeout(() => {
            window.location.href = '/auth';
          }, 2000);
        }
      } catch (error) {
        console.error('Error processing auth callback:', error);
        setStatus('error');
        setMessage('Authentication error occurred. Redirecting back to login...');
        
        setTimeout(() => {
          window.location.href = '/auth';
        }, 2000);
      }
    };

    processCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6">
          {status === 'processing' && (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          )}
          {status === 'success' && (
            <div className="text-green-500 text-6xl">✓</div>
          )}
          {status === 'error' && (
            <div className="text-red-500 text-6xl">✗</div>
          )}
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">
          {status === 'processing' && 'Authenticating...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Authentication Failed'}
        </h1>
        
        <p className="text-gray-300">
          {message}
        </p>
      </div>
    </div>
  );
}