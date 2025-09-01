/**
 * Version Router Middleware
 * Handles request routing to appropriate version
 */

import { VersionRequest, VersionResponse, RouterMiddleware, FLCMVersion } from './types';
import { VersionDetector } from './version-detector';
import { Logger } from '../shared/utils/logger';

export class VersionMiddleware {
  private detector: VersionDetector;
  private logger: Logger;
  private middlewares: RouterMiddleware[] = [];

  constructor(detector: VersionDetector, logger: Logger) {
    this.detector = detector;
    this.logger = logger;
  }

  use(middleware: RouterMiddleware): void {
    this.middlewares.push(middleware);
  }

  async process(
    request: VersionRequest,
    v1Handler: (req: VersionRequest) => Promise<VersionResponse>,
    v2Handler: (req: VersionRequest) => Promise<VersionResponse>
  ): Promise<VersionResponse> {
    const startTime = Date.now();
    
    try {
      // Detect version
      const version = this.detector.detectVersion(request);
      
      // Add version to request context
      request.headers['x-routed-version'] = version;
      
      // Log routing decision
      this.logger.info(`Routing request to FLCM ${version}`, {
        path: request.path,
        method: request.method,
        version
      });

      // Apply middleware chain
      const handler = version === '2.0' ? v2Handler : v1Handler;
      const response = await this.applyMiddlewares(request, handler);
      
      // Add version and timing to response
      response.version = version;
      response.processingTime = Date.now() - startTime;
      
      return response;
    } catch (error) {
      this.logger.error('Version routing failed', {
        error: error.message,
        path: request.path,
        method: request.method
      });
      
      throw error;
    }
  }

  private async applyMiddlewares(
    request: VersionRequest,
    finalHandler: (req: VersionRequest) => Promise<VersionResponse>
  ): Promise<VersionResponse> {
    let index = 0;
    
    const next = async (): Promise<VersionResponse> => {
      if (index >= this.middlewares.length) {
        return finalHandler(request);
      }
      
      const middleware = this.middlewares[index++];
      return middleware(request, next);
    };
    
    return next();
  }
}

/**
 * Rate limiting middleware
 */
export const rateLimitMiddleware: RouterMiddleware = async (req, next) => {
  // Simple in-memory rate limiting (production would use Redis)
  const key = `${req.user?.id || req.headers['x-forwarded-for'] || 'anonymous'}`;
  const limit = 100; // requests per minute
  
  // Check rate limit (simplified)
  // In production, implement proper rate limiting
  
  return next();
};

/**
 * Version validation middleware
 */
export const versionValidationMiddleware: RouterMiddleware = async (req, next) => {
  const version = req.headers['x-flcm-version'];
  
  if (version && !['1.0', '2.0'].includes(version)) {
    return {
      status: 400,
      body: { error: `Invalid version: ${version}` },
      version: '1.0' // default
    };
  }
  
  return next();
};

/**
 * Metrics collection middleware
 */
export const metricsMiddleware: RouterMiddleware = async (req, next) => {
  const startTime = Date.now();
  
  const response = await next();
  
  // Collect metrics (simplified)
  const duration = Date.now() - startTime;
  const version = response.version;
  
  // In production, send to metrics service
  console.log(`[METRICS] ${req.method} ${req.path} - ${version} - ${duration}ms`);
  
  return response;
};