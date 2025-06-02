/**
 * API Gateway Service
 * Routes requests to appropriate microservices and handles cross-cutting concerns
 */

import { Request, Response, NextFunction } from 'express';
import { performanceMonitor } from './performance-monitor';
import { cacheService } from './cache-service';

interface ServiceConfig {
  name: string;
  basePath: string;
  timeout: number;
  retries: number;
  circuitBreakerThreshold: number;
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
}

export class APIGateway {
  private static instance: APIGateway;
  private services: Map<string, ServiceConfig> = new Map();
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private serviceHealth: Map<string, boolean> = new Map();

  static getInstance(): APIGateway {
    if (!APIGateway.instance) {
      APIGateway.instance = new APIGateway();
    }
    return APIGateway.instance;
  }

  constructor() {
    this.initializeServices();
    this.startHealthChecks();
  }

  private initializeServices(): void {
    // Core services configuration
    const services: ServiceConfig[] = [
      {
        name: 'user-service',
        basePath: '/api/users',
        timeout: 5000,
        retries: 3,
        circuitBreakerThreshold: 5
      },
      {
        name: 'project-service',
        basePath: '/api/projects',
        timeout: 10000,
        retries: 2,
        circuitBreakerThreshold: 5
      },
      {
        name: 'messaging-service',
        basePath: '/api/messaging',
        timeout: 3000,
        retries: 3,
        circuitBreakerThreshold: 3
      },
      {
        name: 'ai-service',
        basePath: '/api/ai',
        timeout: 30000,
        retries: 1,
        circuitBreakerThreshold: 3
      },
      {
        name: 'notification-service',
        basePath: '/api/notifications',
        timeout: 5000,
        retries: 2,
        circuitBreakerThreshold: 5
      }
    ];

    services.forEach(service => {
      this.services.set(service.name, service);
      this.circuitBreakers.set(service.name, {
        failures: 0,
        lastFailureTime: 0,
        state: 'closed'
      });
      this.serviceHealth.set(service.name, true);
    });
  }

  /**
   * Main request routing middleware
   */
  routeRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const startTime = Date.now();
    const path = req.path;
    
    // Determine target service
    const serviceName = this.getServiceForPath(path);
    
    if (!serviceName) {
      next(); // Continue to next middleware if no service match
      return;
    }

    // Check circuit breaker
    if (!this.isServiceAvailable(serviceName)) {
      res.status(503).json({
        error: 'Service temporarily unavailable',
        service: serviceName,
        retryAfter: 30
      });
      return;
    }

    try {
      // Add service context to request
      req.serviceContext = {
        serviceName,
        startTime,
        timeout: this.services.get(serviceName)?.timeout || 5000
      };

      // Continue to service handler
      next();
    } catch (error) {
      this.handleServiceError(serviceName, error);
      res.status(500).json({
        error: 'Internal service error',
        service: serviceName
      });
    } finally {
      // Record performance metrics
      const responseTime = Date.now() - startTime;
      performanceMonitor.recordRequest(responseTime);
    }
  };

  /**
   * Service health check middleware
   */
  healthCheckMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const serviceName = req.serviceContext?.serviceName;
    
    if (serviceName && !this.serviceHealth.get(serviceName)) {
      res.status(503).json({
        error: 'Service health check failed',
        service: serviceName
      });
      return;
    }
    
    next();
  };

  /**
   * Request timeout middleware
   */
  timeoutMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const timeout = req.serviceContext?.timeout || 5000;
    
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        const serviceName = req.serviceContext?.serviceName;
        this.handleServiceError(serviceName || 'unknown', new Error('Timeout'));
        res.status(504).json({
          error: 'Request timeout',
          service: serviceName
        });
      }
    }, timeout);

    res.on('finish', () => clearTimeout(timeoutId));
    next();
  };

  /**
   * Service discovery - determines which service handles a path
   */
  private getServiceForPath(path: string): string | null {
    for (const [serviceName, config] of this.services) {
      if (path.startsWith(config.basePath)) {
        return serviceName;
      }
    }
    return null;
  }

  /**
   * Circuit breaker logic
   */
  private isServiceAvailable(serviceName: string): boolean {
    const breaker = this.circuitBreakers.get(serviceName);
    if (!breaker) return true;

    const now = Date.now();
    const config = this.services.get(serviceName);
    if (!config) return true;

    switch (breaker.state) {
      case 'closed':
        return true;
        
      case 'open':
        // Check if enough time has passed to try half-open
        if (now - breaker.lastFailureTime > 30000) { // 30 seconds
          breaker.state = 'half-open';
          return true;
        }
        return false;
        
      case 'half-open':
        return true;
        
      default:
        return true;
    }
  }

  /**
   * Handle service errors and update circuit breaker
   */
  private handleServiceError(serviceName: string, error: any): void {
    const breaker = this.circuitBreakers.get(serviceName);
    const config = this.services.get(serviceName);
    
    if (!breaker || !config) return;

    breaker.failures++;
    breaker.lastFailureTime = Date.now();

    if (breaker.failures >= config.circuitBreakerThreshold) {
      breaker.state = 'open';
      console.warn(`[API Gateway] Circuit breaker opened for ${serviceName} after ${breaker.failures} failures`);
    }

    this.serviceHealth.set(serviceName, false);
    
    // Log error for monitoring
    console.error(`[API Gateway] Service error in ${serviceName}:`, error.message || error);
  }

  /**
   * Handle successful service response
   */
  handleServiceSuccess(serviceName: string): void {
    const breaker = this.circuitBreakers.get(serviceName);
    if (!breaker) return;

    if (breaker.state === 'half-open') {
      // Reset circuit breaker on successful half-open attempt
      breaker.state = 'closed';
      breaker.failures = 0;
      console.log(`[API Gateway] Circuit breaker closed for ${serviceName}`);
    } else if (breaker.state === 'closed' && breaker.failures > 0) {
      // Gradually reduce failure count on success
      breaker.failures = Math.max(0, breaker.failures - 1);
    }

    this.serviceHealth.set(serviceName, true);
  }

  /**
   * Get service health status
   */
  getServiceHealth(): Record<string, any> {
    const health: Record<string, any> = {};
    
    for (const [serviceName, isHealthy] of this.serviceHealth) {
      const breaker = this.circuitBreakers.get(serviceName);
      health[serviceName] = {
        healthy: isHealthy,
        circuitBreakerState: breaker?.state || 'unknown',
        failures: breaker?.failures || 0
      };
    }
    
    return health;
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    setInterval(() => {
      this.performHealthChecks();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Perform health checks on all services
   */
  private async performHealthChecks(): Promise<void> {
    for (const serviceName of this.services.keys()) {
      try {
        // For now, we assume all services are healthy if they're responding
        // In a real microservices setup, this would make HTTP calls to health endpoints
        const isHealthy = await this.checkServiceHealth(serviceName);
        this.serviceHealth.set(serviceName, isHealthy);
        
        if (isHealthy) {
          this.handleServiceSuccess(serviceName);
        }
      } catch (error) {
        this.handleServiceError(serviceName, error);
      }
    }
  }

  /**
   * Check individual service health
   */
  private async checkServiceHealth(serviceName: string): Promise<boolean> {
    // In monolith mode, all services are considered healthy
    // In microservices mode, this would ping individual service health endpoints
    return true;
  }
}

// Service context type extension
declare global {
  namespace Express {
    interface Request {
      serviceContext?: {
        serviceName: string;
        startTime: number;
        timeout: number;
      };
    }
  }
}

export const apiGateway = APIGateway.getInstance();