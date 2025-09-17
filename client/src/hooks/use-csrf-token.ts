import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CSRFTokenData {
  csrfToken: string;
  expiresIn: number;
  message: string;
}

interface CSRFTokenHook {
  token: string | null;
  isLoading: boolean;
  error: string | null;
  fetchToken: () => Promise<string | null>;
  refreshToken: () => Promise<string | null>;
  clearToken: () => void;
}

/**
 * Hook to manage CSRF tokens for authenticated requests
 * Automatically fetches, caches, and refreshes CSRF tokens as needed
 */
export function useCSRFToken(): CSRFTokenHook {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null);
  const { toast } = useToast();

  // Check if current token is expired
  const isTokenExpired = useCallback(() => {
    if (!token || !tokenExpiry) return true;
    return Date.now() >= tokenExpiry;
  }, [token, tokenExpiry]);

  // Fetch CSRF token from backend
  const fetchToken = useCallback(async (): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔐 [CSRF] Fetching CSRF token...');

      const response = await fetch('/api/auth/csrf-token', {
        method: 'GET',
        credentials: 'include', // Include JWT cookies
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('🔐 [CSRF] Not authenticated, cannot fetch CSRF token');
          setToken(null);
          setTokenExpiry(null);
          return null;
        }
        
        const errorData = await response.text();
        throw new Error(`CSRF token fetch failed: ${response.status} ${errorData}`);
      }

      const data: CSRFTokenData = await response.json();
      
      console.log('✅ [CSRF] CSRF token fetched successfully');
      
      // Set token and calculate expiry time (subtract 5 minutes for safety buffer)
      const expiryTime = Date.now() + data.expiresIn - (5 * 60 * 1000);
      
      setToken(data.csrfToken);
      setTokenExpiry(expiryTime);
      setError(null);
      
      return data.csrfToken;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch CSRF token';
      console.error('❌ [CSRF] Error fetching CSRF token:', errorMessage);
      
      setError(errorMessage);
      setToken(null);
      setTokenExpiry(null);
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh token (alias for fetchToken for clarity)
  const refreshToken = useCallback(() => {
    console.log('🔄 [CSRF] Refreshing CSRF token...');
    return fetchToken();
  }, [fetchToken]);

  // Clear token
  const clearToken = useCallback(() => {
    console.log('🗑️ [CSRF] Clearing CSRF token');
    setToken(null);
    setTokenExpiry(null);
    setError(null);
  }, []);

  // Get a valid token (fetch if needed or expired)
  const getValidToken = useCallback(async (): Promise<string | null> => {
    // Return existing token if valid and not expired
    if (token && !isTokenExpired()) {
      return token;
    }

    // Fetch new token if needed
    console.log('🔄 [CSRF] Token expired or missing, fetching new token...');
    return await fetchToken();
  }, [token, isTokenExpired, fetchToken]);

  // Auto-fetch token on hook initialization (only if user might be authenticated)
  useEffect(() => {
    // Check if user might be authenticated by looking for session cookies
    const cookies = document.cookie;
    const hasSessionCookie = cookies.includes('brandentifier_session') || 
                           cookies.includes('jwt') || 
                           cookies.includes('auth');

    if (hasSessionCookie && !token && !isLoading) {
      console.log('🔐 [CSRF] Session detected, fetching initial CSRF token...');
      fetchToken();
    }
  }, [token, isLoading, fetchToken]);

  // Expose getValidToken as fetchToken for external use
  return {
    token,
    isLoading,
    error,
    fetchToken: getValidToken,
    refreshToken,
    clearToken
  };
}

/**
 * Standalone function to get CSRF token for use outside of React components
 * This is useful for the API client and other non-component code
 */
let csrfTokenCache: string | null = null;
let csrfTokenExpiry: number | null = null;

export async function getCSRFToken(): Promise<string | null> {
  // Return cached token if valid
  if (csrfTokenCache && csrfTokenExpiry && Date.now() < csrfTokenExpiry) {
    return csrfTokenCache;
  }

  try {
    console.log('🔐 [CSRF] Fetching CSRF token (standalone)...');

    const response = await fetch('/api/auth/csrf-token', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('🔐 [CSRF] Not authenticated, cannot fetch CSRF token');
        csrfTokenCache = null;
        csrfTokenExpiry = null;
        return null;
      }
      
      throw new Error(`CSRF token fetch failed: ${response.status}`);
    }

    const data: CSRFTokenData = await response.json();
    
    // Cache token with 5-minute safety buffer
    csrfTokenCache = data.csrfToken;
    csrfTokenExpiry = Date.now() + data.expiresIn - (5 * 60 * 1000);
    
    console.log('✅ [CSRF] CSRF token cached successfully');
    return csrfTokenCache;
  } catch (error) {
    console.error('❌ [CSRF] Error fetching CSRF token (standalone):', error);
    csrfTokenCache = null;
    csrfTokenExpiry = null;
    return null;
  }
}

/**
 * Clear the standalone CSRF token cache
 * Useful when user logs out or authentication changes
 */
export function clearCSRFTokenCache(): void {
  console.log('🗑️ [CSRF] Clearing CSRF token cache');
  csrfTokenCache = null;
  csrfTokenExpiry = null;
}