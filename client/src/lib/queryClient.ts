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
 * Enhanced API request function with better error handling and retries
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  retries = 2
): Promise<Response> {
  try {
    // Support for passing FormData objects
    const isFormData = data instanceof FormData;
    
    // Setup headers and body based on content type
    const options: RequestInit = {
      method,
      headers: !isFormData && data ? { "Content-Type": "application/json" } : {},
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
      credentials: "include",
    };
    
    const res = await fetch(url, options);
    
    // Try to handle recoverable errors
    if (!res.ok) {
      // Log error details for debugging
      console.warn(`API request failed: ${method} ${url} - Status: ${res.status}`);
      
      // For network errors or server errors (5xx), retry a few times
      if ((res.status >= 500 || res.status === 0) && retries > 0) {
        console.log(`Retrying request (${retries} attempts left)...`);
        return apiRequest(method, url, data, retries - 1);
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
 * Enhanced query function with better error handling
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });

      // Special handling for auth errors
      if (res.status === 401) {
        console.warn("Unauthorized request to", queryKey[0]);
        if (unauthorizedBehavior === "returnNull") {
          return null;
        }
        throw new Error("You must be logged in to view this content");
      }
      
      // For other error responses
      if (!res.ok) {
        const errorDetails = await res.text().catch(() => res.statusText);
        throw new Error(`${res.status}: ${errorDetails || 'Unknown error'}`);
      }

      // Handle successful empty responses
      if (res.status === 204 || res.headers.get('content-length') === '0') {
        return null;
      }

      // Parse JSON response
      try {
        return await res.json();
      } catch (parseError) {
        console.error("Error parsing response as JSON:", parseError);
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      // Log the error and rethrow
      if (error instanceof Error) {
        // Handle network errors specifically
        if (error.message.includes('Failed to fetch')) {
          console.error("Network error in query:", error);
          throw new Error(`Failed to load data: Network error`);
        }
        
        // Other errors
        console.error(`Query error for ${queryKey[0]}:`, error);
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
