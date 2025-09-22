import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export default function AuthCleaner() {
  const [, navigate] = useLocation();
  const [logs, setLogs] = useState<string[]>([]);
  const [cleared, setCleared] = useState(0);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearAuthData = () => {
    addLog("Starting authentication cleanup...");
    let clearedCount = 0;
    
    // Clear specific problematic keys
    const specificKeys = [
      'redirect_auth_attempt', 
      'redirect_auth_time', 
      'redirect_auth_success',
      'authSuccess', 
      'firebase_user', 
      'emergency_access', 
      'bypass_auth',
      'auth_return_url'
    ];
    
    addLog("Clearing specific auth keys...");
    specificKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        clearedCount++;
        addLog(`✅ Cleared localStorage: ${key}`);
      }
      if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key);
        clearedCount++;
        addLog(`✅ Cleared sessionStorage: ${key}`);
      }
    });
    
    // Clear all Firebase-related items
    addLog("Clearing Firebase-related items...");
    const allLocalKeys = Object.keys(localStorage);
    const allSessionKeys = Object.keys(sessionStorage);
    
    [...allLocalKeys, ...allSessionKeys].forEach(key => {
      if (key.includes('firebase') || key.includes('auth') || key.includes('redirect') || key.includes('google')) {
        try {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
          clearedCount++;
          addLog(`✅ Cleared auth-related: ${key}`);
        } catch (e) {
          // Ignore errors for keys that don't exist in both storages
        }
      }
    });
    
    // Clear cookies
    addLog("Clearing cookies...");
    document.cookie.split(";").forEach(function(c) { 
      const cookieName = c.split("=")[0].trim();
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      if (cookieName && cookieName.length > 0) {
        addLog(`✅ Cleared cookie: ${cookieName}`);
        clearedCount++;
      }
    });
    
    setCleared(clearedCount);
    addLog(`🎉 Auth cleanup complete! ${clearedCount} items removed`);
    addLog("✅ All redirect attempt flags cleared");
    addLog("✅ All Firebase auth data cleared");
    addLog("You can now try the Google login button again");
  };

  const directAccess = () => {
    addLog("Setting up direct access...");
    clearAuthData();
    localStorage.setItem('emergency_access', 'true');
    sessionStorage.setItem('bypass_auth', 'true');
    addLog("Redirecting to Industry Pulse...");
    setTimeout(() => {
      navigate('/industry-pulse');
    }, 1000);
  };

  const goHome = () => {
    addLog("Clearing auth data and returning to home...");
    clearAuthData();
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  // Auto-run cleanup on component mount
  useEffect(() => {
    addLog("Auth Cleaner loaded");
    addLog("Ready to clear problematic authentication flags");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="glass-morphism p-8 rounded-xl">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            🔧 Authentication Cleaner
          </h1>
          
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-6">
            <p className="text-blue-200">
              <strong>Issue:</strong> Old authentication flags are preventing Google login from working properly.
              This tool will clear all problematic data.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={clearAuthData}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Clear Auth Data Now
            </button>

            <button
              onClick={directAccess}
              className="w-full py-3 px-6 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-200"
            >
              Direct Access to App
            </button>

            <button
              onClick={goHome}
              className="w-full py-3 px-6 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200"
            >
              Back to Login
            </button>
          </div>

          {logs.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">Activity Log:</h3>
              <div className="bg-black/30 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
                {logs.map((log, index) => (
                  <div key={index} className="text-green-300 mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {cleared > 0 && (
            <div className="mt-4 bg-green-900/30 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-200 text-center">
                ✅ Successfully cleared {cleared} authentication items!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}