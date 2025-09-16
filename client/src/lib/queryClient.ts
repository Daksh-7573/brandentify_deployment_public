import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * Utility function to check response and throw error with better formatting
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // Try to get text content first for better error messages
      const text = await res.text();
      console.error(`API Error ${res.status} from ${res.url}:`, text || res.statusText);
      throw new Error(`${res.status}: ${text || res.statusText}`);
    } catch (error) {
      // If we can't get text (e.g., network error when reading response body)
      if (error instanceof Error && error.message.includes(`${res.status}:`)) {
        throw error; // Rethrow our formatted error
      }
      // Otherwise it's a different error while trying to read the response
      console.error("Error processing response:", error);
      throw new Error(`${res.status}: ${res.statusText} (Failed to read error details)`);
    }
  }
}

/**
 * Enhanced API request function (legacy version for backward compatibility)
 * @deprecated Use the options-based version instead
 */
export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  data?: unknown,
  retries?: number
): Promise<Response>;

/**
 * Enhanced API request function with better error handling and retries
 */
export async function apiRequest(
  optionsOrMethod: string | { url: string; method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'; data?: unknown; retries?: number; backoffDelay?: number },
  urlOrNothing?: string,
  dataOrNothing?: unknown,
  retriesOrNothing?: number
): Promise<Response> {
  // Handle both function signatures
  let url: string;
  let method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  let data: unknown;
  let retries: number = 3; // Increased default retries
  let backoffDelay: number = 300; // Default initial backoff delay in ms

  if (typeof optionsOrMethod === 'string') {
    // Old signature: apiRequest(method, url, data?, retries?)
    method = optionsOrMethod as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url = urlOrNothing as string;
    data = dataOrNothing;
    if (typeof retriesOrNothing === 'number') retries = retriesOrNothing;
  } else {
    // New signature: apiRequest({ url, method, data?, retries?, backoffDelay? })
    ({ url, method, data, retries = 3, backoffDelay = 300 } = optionsOrMethod);
  }
  
  // Helper for sleeping between retries
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  // 🚨 CRITICAL: CACHE ELIMINATION - NO CLIENT-SIDE API CACHING
  const tryGetFromCache = (attemptNumber: number): Response | null => {
    // COMPLETE CACHE BYPASS - Never return cached data for API requests
    console.log(`🚨 [CACHE ELIMINATION] Bypassing cache for ${url} (attempt ${attemptNumber}) - Direct server request only`);
    return null;
  };
  
  // 🚨 CRITICAL: CACHE ELIMINATION - NO CLIENT-SIDE API CACHING ALLOWED
  const trySaveToCache = async (response: Response): Promise<void> => {
    // COMPLETE CACHE BYPASS - Never save API responses to localStorage
    console.log(`🚨 [CACHE ELIMINATION] NOT caching response for ${url} - Cache elimination active`);
    
    // EMERGENCY: Clear any existing API cache entries on successful request
    try {
      // Remove any existing cache entries for this URL
      const cacheKey = `api_cache_${url}`;
      localStorage.removeItem(cacheKey);
      
      // Clear any legacy cache entries
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('api_cache_') || key.startsWith('query_cache_')) {
          localStorage.removeItem(key);
          console.log(`🗑️ [CACHE PURGE] Removed legacy cache key: ${key}`);
        }
      });
    } catch (e) {
      // Ignore localStorage errors
    }
  };
  
  // Execute the request with retries and exponential backoff
  let attempt = 0;
  let currentBackoff = backoffDelay;
  
  while (true) {
    try {
      // Check cache on retry attempts
      if (attempt > 0) {
        const cachedResponse = tryGetFromCache(attempt);
        if (cachedResponse) return cachedResponse;
        
        // If we're retrying, apply backoff delay
        console.log(`Waiting ${currentBackoff}ms before retry ${attempt}...`);
        await sleep(currentBackoff);
        
        // Increase backoff for next attempt (exponential)
        currentBackoff = Math.min(currentBackoff * 2, 10000); // Max 10 seconds
      }
      
      // Support for passing FormData objects
      const isFormData = data instanceof FormData;
      
      // NUCLEAR cache busting for API requests
      const nuclearUrl = url.includes('?') 
        ? `${url}&__nuclear=${Date.now()}&__cb=${Math.random().toString(36).substring(2)}` 
        : `${url}?__nuclear=${Date.now()}&__cb=${Math.random().toString(36).substring(2)}`;
      
      // Setup headers and body based on content type
      const requestOptions: RequestInit = {
        method: method,
        cache: 'no-store', // Force no browser cache
        headers: {
          ...(!isFormData && data ? { "Content-Type": "application/json" } : {}),
          'Cache-Control': 'no-cache, no-store, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: isFormData ? (data as FormData) : 
              data ? JSON.stringify(data) : 
              undefined,
        credentials: "include",
      };
      
      console.log(`🚨 [NUCLEAR API] Cache-busted request: ${nuclearUrl}`);
      
      // Special debugging for profile picture updates
      if (url.includes('/users/') && method === 'PUT') {
        console.log(`[API CLIENT DEBUG] === PROFILE PICTURE PUT REQUEST ===`);
        console.log(`[API CLIENT DEBUG] URL: ${url}`);
        console.log(`[API CLIENT DEBUG] Method: ${method}`);
        console.log(`[API CLIENT DEBUG] Request options:`, requestOptions);
        console.log(`[API CLIENT DEBUG] Data keys:`, data ? Object.keys(data as any) : 'NO DATA');
        if (data && (data as any).photoURL) {
          console.log(`[API CLIENT DEBUG] photoURL length:`, (data as any).photoURL.length);
          console.log(`[API CLIENT DEBUG] photoURL preview:`, (data as any).photoURL.substring(0, 100));
        }
        console.log(`[API CLIENT DEBUG] About to send fetch request...`);
      }
      
      const res = await fetch(nuclearUrl, requestOptions);
      
      // Log response for profile picture updates
      if (url.includes('/users/') && method === 'PUT') {
        console.log(`[API CLIENT DEBUG] === RESPONSE RECEIVED ===`);
        console.log(`[API CLIENT DEBUG] Status:`, res.status);
        console.log(`[API CLIENT DEBUG] Status text:`, res.statusText);
        console.log(`[API CLIENT DEBUG] Response headers:`, Object.fromEntries(res.headers.entries()));
      }
      
      // Handle response status codes
      if (!res.ok) {
        // Log error details for debugging
        console.warn(`API request failed: ${method} ${url} - Status: ${res.status}`);
        
        // For specific API errors, maintain the response object with the error data
        if (res.status === 413 || res.status === 429) {
          // Parse and attach error data to response
          try {
            const errorData = await res.json();
            // Attach the error data to the response object for error handlers
            (res as any).data = errorData;
            
            // Return the response with the error data
            return res;
          } catch (jsonError) {
            // If we couldn't parse JSON, just continue with normal flow
            console.error("Failed to parse error response:", jsonError);
          }
        }
        
        // For network errors or server errors (5xx), retry if we have attempts left
        if ((res.status >= 500 || res.status === 0) && attempt < retries) {
          console.log(`Server error ${res.status}, retry ${attempt + 1}/${retries} for: ${url}`);
          attempt++;
          continue; // Continue to next retry attempt
        }
      }
      
      // Save successful responses to cache
      await trySaveToCache(res);
      
      // For authorization errors or other errors, throw normally
      await throwIfResNotOk(res);
      return res;
    } catch (error) {
      // Handle network errors (e.g., when fetch itself fails)
      if (error instanceof TypeError && 
          (error.message.includes('Failed to fetch') || 
           error.message.includes('Network request failed') ||
           error.message.includes('network') ||
           error.message.includes('timeout'))) {
        if (attempt < retries) {
          console.log(`Network error, retry ${attempt + 1}/${retries} for: ${url}`);
          attempt++;
          continue; // Continue to next retry attempt
        }
        
        console.error("Network error during API request after all retries:", error);
        
        // Last attempt - check if we can serve from cache as a last resort
        const cachedResponse = tryGetFromCache(999); // Special last-resort attempt
        if (cachedResponse) {
          console.warn(`All retries failed for ${url}, serving stale data from cache as fallback`);
          return cachedResponse;
        }
        
        // For specific endpoints that should return arrays when empty
        if (url.includes('/projects') || 
            url.includes('/experiences') || 
            url.includes('/educations') || 
            url.includes('/skills') ||
            url.includes('/services')) {
          console.warn(`Network error fetching array endpoint ${url}, returning empty array`);
          
          // Create a fake Response with an empty array
          return new Response('[]', {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'X-Cache-Status': 'FALLBACK-EMPTY'
            }
          });
        }
        
        throw new Error("Network error: Unable to connect to the server after multiple attempts. Please check your internet connection.");
      }
      
      // Rethrow other errors
      throw error;
    }
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Enhanced query function with better error handling and robust fault tolerance
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      // Validate the queryKey to prevent fetch errors
      if (!queryKey || !queryKey[0] || typeof queryKey[0] !== 'string') {
        console.error("Invalid queryKey:", queryKey);
        
        // For endpoints that should return arrays when empty, return empty array
        if (queryKey && Array.isArray(queryKey) && queryKey[0]) {
          const keyStr = String(queryKey[0]);
          if (keyStr.includes('/projects') || 
              keyStr.includes('/experiences') || 
              keyStr.includes('/educations') || 
              keyStr.includes('/skills') ||
              keyStr.includes('/services')) {
            console.log("Returning empty array for array endpoint:", keyStr);
            return [] as unknown as T;
          }
        }
        
        return null as unknown as T;
      }
      
      console.log("Fetching data from:", queryKey[0]);
      
      // 🚨 NUCLEAR CACHE ELIMINATION - AGGRESSIVE CACHE BUSTING FOR ALL REQUESTS
      const url = queryKey[0] as string;
      
      // NUCLEAR cache busting with multiple parameters to defeat ALL caching layers
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2);
      const nuclear = `__nuclear=${timestamp}&__cb=${random}&__bypass=${Date.now()}`;
      
      const cacheBuster = url.includes('?') 
        ? `&${nuclear}` 
        : `?${nuclear}`;
        
      const fetchUrl = `${url}${cacheBuster}`;
      
      console.log(`🚨 [NUCLEAR CACHE ELIMINATION] Force fresh request with multi-layer cache busting: ${timestamp}`);
      
      // Add timeout protection (only for slow endpoints)
      const controller = new AbortController();
      
      // Check if this is a slow endpoint that needs timeout protection
      // Skip timeout for frequently polled endpoints (like /api/users)
      const isFrequentlyPolledEndpoint = url.includes('/api/users') && !url.includes('/projects') && 
                                        !url.includes('/experiences') && !url.includes('/educations') && 
                                        !url.includes('/services') && !url.includes('/skills');
      
      // Only set timeout for non-frequently polled endpoints
      const timeoutId = !isFrequentlyPolledEndpoint ? setTimeout(() => {
        console.warn("Request timeout for:", url);
        controller.abort('Request timeout after 10 seconds');
      }, 10000) : null; // 10 second timeout
      
      try {
        const res = await fetch(fetchUrl, {
          credentials: "include",
          cache: 'no-store', // Force no browser cache
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'If-Modified-Since': 'Mon, 26 Jul 1997 05:00:00 GMT',
            'If-None-Match': '*'
          },
          signal: controller.signal
        });
        
        // Clear timeout since request completed (if it exists)
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }

        // Special handling for auth errors
        if (res.status === 401) {
          console.warn("Unauthorized request to", queryKey[0]);
          if (unauthorizedBehavior === "returnNull") {
            return null as unknown as T;
          }
          throw new Error("You must be logged in to view this content");
        }
        
        // Handle expected 404s for poll votes (user hasn't voted yet) - return null instead of throwing
        if (res.status === 404 && url.includes('/poll-votes/user/')) {
          console.log("No poll vote found (expected):", url);
          return null as unknown as T;
        }
        
        // For other error responses
        if (!res.ok) {
          console.error(`API Error ${res.status} for ${url}`);
          
          // For specific endpoints that should return arrays when empty
          if (url.includes('/projects') || 
              url.includes('/experiences') || 
              url.includes('/educations') || 
              url.includes('/skills') ||
              url.includes('/services')) {
            console.log("Returning empty array for failed array endpoint:", url);
            return [] as unknown as T;
          }
          
          const errorDetails = await res.text().catch(() => res.statusText);
          throw new Error(`${res.status}: ${errorDetails || 'Unknown error'}`);
        }

        // Handle successful empty responses
        if (res.status === 204 || res.headers.get('content-length') === '0') {
          // For endpoints that should return arrays when empty
          if (url.includes('/projects') || 
              url.includes('/experiences') || 
              url.includes('/educations') || 
              url.includes('/skills') ||
              url.includes('/services')) {
            return [] as unknown as T;
          }
          
          return null as unknown as T;
        }

        // Parse JSON response
        try {
          const data = await res.json();
          
          // Ensure array endpoints return arrays
          if ((url.includes('/projects') || 
              url.includes('/experiences') || 
              url.includes('/educations') || 
              url.includes('/skills') ||
              url.includes('/services')) && 
              !Array.isArray(data)) {
            console.warn(`Expected array but got ${typeof data} for ${url}`);
            return [] as unknown as T;
          }
          
          return data as T;
        } catch (parseError) {
          console.error("Error parsing response as JSON:", parseError);
          
          // For endpoints that should return arrays when empty
          if (url.includes('/projects') || 
              url.includes('/experiences') || 
              url.includes('/educations') || 
              url.includes('/skills') ||
              url.includes('/services')) {
            console.log("Returning empty array for JSON parse error on array endpoint:", url);
            return [] as unknown as T;
          }
          
          throw new Error("Invalid response format from server");
        }
      } finally {
        // Ensure timeout is cleared in all cases (if timeoutId is set)
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    } catch (error) {
      // Handle specific error types
      if (error instanceof Error) {
        // Handle network errors specifically
        if (error.message.includes('Failed to fetch') || error.name === 'AbortError') {
          console.error("Network error in query:", error.message);
          
          // For specific endpoints that should return arrays when empty
          const url = queryKey[0] as string;
          if (url.includes('/projects') || 
              url.includes('/experiences') || 
              url.includes('/educations') || 
              url.includes('/skills') ||
              url.includes('/services')) {
            console.log("Returning empty array for network error on array endpoint:", url);
            return [] as unknown as T;
          }
          
          // 🚨 CRITICAL: NO CACHE RECOVERY - Force server requests only
          console.log(`🚨 [CACHE ELIMINATION] NOT recovering from localStorage cache for: ${queryKey[0]} - Force server request`);
          
          // EMERGENCY: Clear any existing query cache entries
          try {
            const cacheKey = `query_cache_${queryKey[0]}`;
            localStorage.removeItem(cacheKey);
            console.log(`🗑️ [CACHE PURGE] Cleared query cache for: ${queryKey[0]}`);
          } catch (cacheError) {
            // Ignore errors
          }
          
          throw new Error(`Failed to load data: Network error`);
        }
        
        // Other errors
        console.error(`Query error for ${queryKey[0]}:`, error);
      }
      
      // Handle array endpoints
      const url = queryKey[0] as string;
      if (url && (
          url.includes('/projects') || 
          url.includes('/experiences') || 
          url.includes('/educations') || 
          url.includes('/skills') ||
          url.includes('/services'))) {
        console.log("Returning empty array for generic error on array endpoint:", url);
        return [] as unknown as T;
      }
      
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true, // Force refetch on window focus
      // 🚨 CRITICAL: ZERO STALE TIME - FORCE FRESH REQUESTS ALWAYS
      staleTime: 0, // NEVER consider queries stale - always fetch fresh data
      cacheTime: 0, // Don't keep any cache data
      gcTime: 0, // Immediate garbage collection
      retry: (failureCount, error) => {
        // Don't retry 404s for poll-votes (expected when user hasn't voted)
        if (error && error.message && error.message.includes('404') && error.message.includes('poll-votes')) {
          return false;
        }
        // Only retry once for other errors to avoid cascading failures
        return failureCount < 1;
      },
      retryDelay: attempt => Math.min(1000 * 2 ** attempt, 10000), // Faster, shorter exponential backoff
      // Add network mode to avoid multiple simultaneous requests
      networkMode: 'always', // Keep trying even if browser is offline
      // 🚨 CRITICAL: FORCE REFETCH ON EVERY MOUNT
      refetchOnMount: 'always',
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1, // Allow one retry for mutations
    },
  },
});
