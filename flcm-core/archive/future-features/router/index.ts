/**
 * Version Router Main Module
 * Central routing system for FLCM dual architecture
 */

import { 
  VersionRequest, 
  VersionResponse, 
  RouterConfig, 
  VersionHandler,
  FLCMVersion 
} from './types';
import { VersionDetector } from './version-detector';
import { VersionMiddleware, versionValidationMiddleware, metricsMiddleware } from './middleware';
import { VersionRouterErrorHandler } from './error-handler';
import { Logger } from '../shared/utils/logger';
import { ConfigManager } from '../shared/config/config-manager';

export class VersionRouter {
  private config: RouterConfig;
  private detector: VersionDetector;
  private middleware: VersionMiddleware;
  private errorHandler: VersionRouterErrorHandler;
  private logger: Logger;
  private v1Handler?: VersionHandler;
  private v2Handler?: VersionHandler;
  private configManager: ConfigManager;
  
  constructor(configPath?: string) {
    // Initialize logger
    this.logger = new Logger('VersionRouter');
    
    // Load configuration
    this.configManager = new ConfigManager(configPath);
    this.config = this.configManager.getRouterConfig();
    
    // Initialize components
    this.detector = new VersionDetector(this.config);
    this.middleware = new VersionMiddleware(this.detector, this.logger);
    this.errorHandler = new VersionRouterErrorHandler(this.logger);
    
    // Setup default middleware
    this.setupDefaultMiddleware();
    
    this.logger.info('Version router initialized', {
      defaultVersion: this.config.defaultVersion,
      userOverrides: this.config.userOverridesEnabled,
      v2Enabled: this.detector.isV2Enabled()
    });
  }
  
  private setupDefaultMiddleware(): void {
    this.middleware.use(versionValidationMiddleware);
    this.middleware.use(metricsMiddleware);
  }
  
  /**
   * Register version handlers
   */
  registerV1Handler(handler: VersionHandler): void {
    this.v1Handler = handler;
    this.logger.info('V1 handler registered');
  }
  
  registerV2Handler(handler: VersionHandler): void {
    this.v2Handler = handler;
    this.logger.info('V2 handler registered');
  }
  
  /**
   * Main routing method
   */
  async route(request: VersionRequest): Promise<VersionResponse> {
    try {
      // Validate handlers are registered
      if (!this.v1Handler || !this.v2Handler) {
        throw new Error('Version handlers not properly initialized');
      }
      
      // Process through middleware chain
      return await this.middleware.process(
        request,
        (req) => this.v1Handler!.handle(req),
        (req) => this.v2Handler!.handle(req)
      );
    } catch (error) {
      return this.errorHandler.handleError(error, request);
    }
  }
  
  /**
   * Health check for both versions
   */
  async healthCheck(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    versions: Record<FLCMVersion, any>;
  }> {
    const results = {
      overall: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
      versions: {} as Record<FLCMVersion, any>
    };
    
    // Check V1
    if (this.v1Handler) {
      try {
        results.versions['1.0'] = await this.v1Handler.healthCheck();
      } catch (error) {
        results.versions['1.0'] = {
          status: 'unhealthy',
          error: error.message
        };
        results.overall = 'degraded';
      }
    }
    
    // Check V2
    if (this.v2Handler) {
      try {
        results.versions['2.0'] = await this.v2Handler.healthCheck();
      } catch (error) {
        results.versions['2.0'] = {
          status: 'unhealthy',
          error: error.message
        };
        results.overall = 'degraded';
      }
    }
    
    // Set overall status
    const statuses = Object.values(results.versions).map(v => v.status);
    if (statuses.every(s => s === 'unhealthy')) {
      results.overall = 'unhealthy';
    } else if (statuses.some(s => s === 'unhealthy')) {
      results.overall = 'degraded';
    }
    
    return results;
  }
  
  /**
   * Update configuration dynamically
   */
  updateConfig(newConfig: Partial<RouterConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.detector = new VersionDetector(this.config);
    this.logger.info('Router configuration updated', newConfig);
  }
  
  /**
   * Get current configuration
   */
  getConfig(): RouterConfig {
    return this.config;
  }
}

// Export all types and classes
export * from './types';
export { VersionDetector } from './version-detector';
export { VersionMiddleware } from './middleware';
export { VersionRouterErrorHandler, VersionError } from './error-handler';