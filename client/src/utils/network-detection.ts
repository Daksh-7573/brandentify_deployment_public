/**
 * Network Detection and Adaptive Configuration Utility
 * Detects connection speed and provides adaptive timeouts for better reliability
 */

export type ConnectionType = '2g' | 'slow-2g' | '3g' | '4g' | 'wifi' | 'unknown';

export interface NetworkConfig {
  connectionType: ConnectionType;
  requestTimeout: number;
  failsafeTimeout: number;
  maxRetries: number;
  retryDelayMultiplier: number;
  maxRetryDelay: number;
}

export interface ConnectionInfo {
  effectiveType?: '2g' | 'slow-2g' | '3g' | '4g';
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

/**
 * Detect network connection type using Navigator Connection API
 * Falls back to conservative defaults if API unavailable
 */
export function detectConnection(): ConnectionInfo {
  // Check if Navigator Connection API is available
  const nav = navigator as any;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
  
  if (connection) {
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }
  
  // Fallback detection for browsers without Connection API
  // Use User-Agent hints for mobile detection
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  return {
    effectiveType: isMobile ? '3g' : '4g', // Conservative mobile assumption
    downlink: isMobile ? 1.5 : 10, // Mbps estimate
    rtt: isMobile ? 200 : 50, // ms estimate
    saveData: false
  };
}

/**
 * Get network configuration based on connection type
 * Provides adaptive timeouts and retry strategies
 */
export function getNetworkConfig(connectionInfo?: ConnectionInfo): NetworkConfig {
  const info = connectionInfo || detectConnection();
  const effectiveType = info.effectiveType || 'unknown';
  
  // Adaptive configuration based on connection speed
  switch (effectiveType) {
    case 'slow-2g':
    case '2g':
      return {
        connectionType: effectiveType,
        requestTimeout: 25000, // 25 seconds for very slow connections
        failsafeTimeout: 45000, // 45 seconds total
        maxRetries: 6, // More retries for unreliable connections
        retryDelayMultiplier: 2.5, // Aggressive backoff
        maxRetryDelay: 15000 // 15 second max delay
      };
    
    case '3g':
      return {
        connectionType: '3g',
        requestTimeout: 15000, // 15 seconds for moderate connections
        failsafeTimeout: 30000, // 30 seconds total
        maxRetries: 4, // Balanced retry strategy
        retryDelayMultiplier: 2.0, // Standard backoff
        maxRetryDelay: 8000 // 8 second max delay
      };
    
    case '4g':
      return {
        connectionType: '4g',
        requestTimeout: 8000, // 8 seconds for fast connections
        failsafeTimeout: 15000, // 15 seconds total
        maxRetries: 3, // Fewer retries needed
        retryDelayMultiplier: 1.5, // Mild backoff
        maxRetryDelay: 5000 // 5 second max delay
      };
    
    default:
      // Unknown connection - use conservative mobile-friendly defaults
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        return {
          connectionType: 'unknown',
          requestTimeout: 20000, // 20 seconds for unknown mobile
          failsafeTimeout: 35000, // 35 seconds total
          maxRetries: 5, // Conservative retry strategy
          retryDelayMultiplier: 2.0,
          maxRetryDelay: 10000 // 10 second max delay
        };
      } else {
        return {
          connectionType: 'wifi',
          requestTimeout: 10000, // 10 seconds for desktop/wifi
          failsafeTimeout: 20000, // 20 seconds total
          maxRetries: 3, // Standard retry strategy
          retryDelayMultiplier: 1.8,
          maxRetryDelay: 6000 // 6 second max delay
        };
      }
  }
}

/**
 * Calculate retry delay with exponential backoff
 * Adapts to connection type for optimal timing
 */
export function calculateRetryDelay(
  retryCount: number, 
  config: NetworkConfig
): number {
  const baseDelay = 1000; // Start with 1 second
  const exponentialDelay = baseDelay * Math.pow(config.retryDelayMultiplier, retryCount);
  return Math.min(exponentialDelay, config.maxRetryDelay);
}

/**
 * Get user-friendly error message based on connection type
 */
export function getConnectionErrorMessage(
  connectionType: ConnectionType,
  isRetrying = false
): string {
  const messages = {
    'slow-2g': isRetrying 
      ? 'Slow connection detected. Retrying with extended timeout...'
      : 'Very slow connection detected. This may take longer than usual.',
    
    '2g': isRetrying
      ? 'Slow mobile connection detected. Retrying...'
      : 'Slow mobile connection. Please be patient while we connect.',
    
    '3g': isRetrying
      ? 'Retrying connection on mobile network...'
      : 'Mobile connection detected. Optimizing for your network speed.',
    
    '4g': isRetrying
      ? 'Retrying connection...'
      : 'Fast connection detected.',
    
    'wifi': isRetrying
      ? 'Retrying connection...'
      : 'WiFi connection detected.',
    
    'unknown': isRetrying
      ? 'Retrying with optimized settings for your connection...'
      : 'Optimizing connection settings for your network.'
  };
  
  return messages[connectionType] || messages['unknown'];
}

/**
 * Log network performance for debugging
 */
export function logNetworkPerformance(
  operation: string,
  startTime: number,
  config: NetworkConfig,
  success: boolean,
  error?: Error
): void {
  const duration = Date.now() - startTime;
  
  console.log(`🌐 [NETWORK-PERF] ${operation}:`, {
    connectionType: config.connectionType,
    duration: `${duration}ms`,
    timeout: `${config.requestTimeout}ms`,
    success,
    error: error?.message,
    performance: duration < config.requestTimeout ? 'within-timeout' : 'exceeded-timeout'
  });
}