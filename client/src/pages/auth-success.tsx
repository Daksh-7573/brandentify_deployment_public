import { useEffect, useState } from 'react';
import { handleRedirectResult, getCurrentUser } from '@/lib/firebase-auth';

export default function AuthSuccessPage() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const processAuth = async () => {
      try {
        console.log('Auth Success Page: Processing redirect result...');
        
        // Handle the redirect result
        const user = await handleRedirectResult();
        
        if (user) {
          console.log('Authentication successful:', user.email);
          setMessage(`Welcome ${user.displayName || user.email}! Redirecting to Industry Pulse...`);
          
          // Wait a moment then redirect
          setTimeout(() => {
            window.location.href = '/industry-pulse?from=auth';
          }, 1500);
        } else {
          // Check if user is already authenticated
          const currentUser = getCurrentUser();
          if (currentUser) {
            console.log('User already authenticated:', currentUser.email);
            setMessage('Already authenticated. Redirecting...');
            setTimeout(() => {
              window.location.href = '/industry-pulse?from=auth';
            }, 1000);
          } else {
            console.log('No authentication found, redirecting to auth page');
            setMessage('Authentication failed. Redirecting to login...');
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error processing authentication:', error);
        setMessage('Authentication error. Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    processAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
        <h1 className="text-2xl font-bold text-white mb-4">Authentication Success</h1>
        <p className="text-gray-300 text-lg">{message}</p>
      </div>
    </div>
  );
}