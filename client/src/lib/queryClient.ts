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
  retries: number = 2
): Promise<Response>;

/**
 * Enhanced API request function with better error handling and retries
 */
export async function apiRequest(
  optionsOrMethod: string | { url: string; method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'; data?: unknown; retries?: number },
  urlOrNothing?: string,
  dataOrNothing?: unknown,
  retriesOrNothing?: number
): Promise<Response> {
  // Handle both function signatures
  let url: string;
  let method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  let data: unknown;
  let retries: number = 2;

  if (typeof optionsOrMethod === 'string') {
    // Old signature: apiRequest(method, url, data?, retries?)
    method = optionsOrMethod as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url = urlOrNothing as string;
    data = dataOrNothing;
    if (typeof retriesOrNothing === 'number') retries = retriesOrNothing;
  } else {
    // New signature: apiRequest({ url, method, data?, retries? })
    ({ url, method, data, retries = 2 } = optionsOrMethod);
  }
  
  try {
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
    
    // Try to handle recoverable errors
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
      
      // For network errors or server errors (5xx), retry a few times
      if ((res.status >= 500 || res.status === 0) && retries > 0) {
        console.log(`Retrying request (${retries} attempts left)...`);
        return apiRequest({ url, method, data, retries: retries - 1 });
      }
    }
    
    // For authorization errors or other errors, throw normally
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    // Handle network errors (e.g., when fetch itself fails)
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error("Network error during API request:", error);
      throw new Error("Network error: Unable to connect to the server. Please check your internet connection.");
    }
    
    // Rethrow other errors
    throw error;
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
      
      // Add cache busting for GET requests
      const url = queryKey[0] as string;
      const cacheBuster = url.includes('?') ? `&t=${Date.now()}` : `?t=${Date.now()}`;
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
      staleTime: 1000 * 60 * 5, // 5 minutes instead of Infinity
      retry: 2, // Retry failed queries
      retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
    },
    mutations: {
      retry: 1, // Allow one retry for mutations
    },
  },
});
