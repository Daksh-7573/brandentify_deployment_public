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
  
  // Try to get from cache for GET requests during retries
  const tryGetFromCache = (attemptNumber: number): Response | null => {
    if (method === 'GET' && attemptNumber > 0) {
      try {
        const cacheKey = `api_cache_${url}`;
        const cachedData = localStorage.getItem(cacheKey);
        
        if (cachedData) {
          console.log(`Using cached data for ${url} (attempt ${attemptNumber})...`);
          
          // Create a fake Response from the cached data
          return new Response(cachedData, {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'X-Cache': 'HIT'
            }
          });
        }
      } catch (e) {
        // Ignore localStorage access errors
        console.warn('Error accessing localStorage cache:', e);
      }
    }
    return null;
  };
  
  // Try to save successful GET response to cache
  const trySaveToCache = async (response: Response): Promise<void> => {
    if (method === 'GET' && response.ok) {
      try {
        const cacheKey = `api_cache_${url}`;
        const clonedResponse = response.clone();
        const responseText = await clonedResponse.text();
        
        // Only save valid JSON
        try {
          JSON.parse(responseText); // Verify it's valid JSON  
          localStorage.setItem(cacheKey, responseText);
          console.log(`Cached response for ${url}`);
        } catch (e) {
          // Not valid JSON, don't cache
          console.warn(`Not caching non-JSON response for ${url}`);
        }
      } catch (e) {
        // Ignore cache errors
        console.warn('Error saving to cache:', e);
      }
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
      
      // Setup headers and body based on content type
      const requestOptions: RequestInit = {
        method: method,
        headers: !isFormData && data ? { "Content-Type": "application/json" } : {},
        body: isFormData ? data : data ? JSON.stringify(data) : undefined,
        credentials: "include",
      };
      
      const res = await fetch(url, requestOptions);
      
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
      
      // Add cache busting for GET requests, but with reduced frequency for profile data
      const url = queryKey[0] as string;
      
      // Reduce cache busting frequency for profile-related endpoints to prevent network congestion
      // Use a timestamp that changes less frequently (once per minute) for these endpoints
      const isProfileEndpoint = url.includes('/api/users') || 
                                url.includes('/enhanced-user') || 
                                url.includes('/what-i-offer');
                                
      const cacheBusterTimestamp = isProfileEndpoint 
        ? Math.floor(Date.now() / 60000) // Only changes once per minute for profile endpoints
        : Date.now(); // Regular timestamp for other endpoints
        
      const cacheBuster = url.includes('?') 
        ? `&t=${cacheBusterTimestamp}` 
        : `?t=${cacheBusterTimestamp}`;
        
      const fetchUrl = `${url}${cacheBuster}`;
      
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
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
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
          
          // Try to recover from localStorage cache if available
          try {
            const cacheKey = `query_cache_${queryKey[0]}`;
            const cachedData = localStorage.getItem(cacheKey);
            if (cachedData) {
              console.log("Recovering data from localStorage cache for:", queryKey[0]);
              return JSON.parse(cachedData) as T;
            }
          } catch (cacheError) {
            console.error("Error reading from cache:", cacheError);
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
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 15, // 15 minutes instead of 5 minutes
      retry: 1, // Only retry once to avoid cascading failures
      retryDelay: attempt => Math.min(1000 * 3 ** attempt, 30000), // Slower exponential backoff
      // Add network mode to avoid multiple simultaneous requests
      networkMode: 'always', // Keep trying even if browser is offline
      // Reduce query cache size to avoid memory issues
      gcTime: 1000 * 60 * 30, // 30 minutes before garbage collection
    },
    mutations: {
      retry: 1, // Allow one retry for mutations
    },
  },
});
