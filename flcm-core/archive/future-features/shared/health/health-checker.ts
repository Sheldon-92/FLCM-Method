/**
 * Health Check System
 * Monitors health of both FLCM versions
 */

import { HealthStatus, FLCMVersion } from '../../router/types';
import { Logger } from '../utils/logger';

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  details?: any;
  error?: string;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  uptime: number;
  versions: {
    '1.0'?: HealthCheckResult;
    '2.0'?: HealthCheckResult;
  };
  dependencies: HealthCheckResult[];
}

export class HealthChecker {
  private logger: Logger;
  private startTime: Date;
  private checks: Map<string, () => Promise<HealthCheckResult>> = new Map();
  
  constructor() {
    this.logger = new Logger('HealthChecker');
    this.startTime = new Date();
  }
  
  /**
   * Register a health check
   */
  registerCheck(name: string, check: () => Promise<HealthCheckResult>): void {
    this.checks.set(name, check);
    this.logger.info(`Health check registered: ${name}`);
  }
  
  /**
   * Perform all health checks
   */
  async checkHealth(): Promise<SystemHealth> {
    const results: SystemHealth = {
      overall: 'healthy',
      timestamp: new Date(),
      uptime: Date.now() - this.startTime.getTime(),
      versions: {},
      dependencies: []
    };
    
    // Run all checks in parallel
    const checkPromises = Array.from(this.checks.entries()).map(async ([name, check]) => {
      const startTime = Date.now();
      
      try {
        const result = await this.withTimeout(check(), 5000);
        result.responseTime = Date.now() - startTime;
        
        // Categorize results
        if (name.includes('v1') || name.includes('1.0')) {
          results.versions['1.0'] = result;
        } else if (name.includes('v2') || name.includes('2.0')) {
          results.versions['2.0'] = result;
        } else {
          results.dependencies.push(result);
        }
        
        return result;
      } catch (error) {
        const errorResult: HealthCheckResult = {
          service: name,
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          error: error.message
        };
        
        if (name.includes('v1') || name.includes('1.0')) {
          results.versions['1.0'] = errorResult;
        } else if (name.includes('v2') || name.includes('2.0')) {
          results.versions['2.0'] = errorResult;
        } else {
          results.dependencies.push(errorResult);
        }
        
        return errorResult;
      }
    });
    
    const allResults = await Promise.all(checkPromises);
    
    // Determine overall status
    results.overall = this.calculateOverallStatus(allResults);
    
    return results;
  }
  
  /**
   * Check specific version health
   */
  async checkVersionHealth(version: FLCMVersion): Promise<HealthStatus> {
    const checkName = `v${version}`;
    const check = this.checks.get(checkName);
    
    if (!check) {
      return {
        version,
        status: 'unhealthy',
        uptime: 0,
        lastCheck: new Date(),
        details: { error: 'Version check not registered' }
      };
    }
    
    try {
      const result = await this.withTimeout(check(), 5000);
      
      return {
        version,
        status: result.status,
        uptime: Date.now() - this.startTime.getTime(),
        lastCheck: new Date(),
        details: result.details
      };
    } catch (error) {
      return {
        version,
        status: 'unhealthy',
        uptime: Date.now() - this.startTime.getTime(),
        lastCheck: new Date(),
        details: { error: error.message }
      };
    }
  }
  
  /**
   * Create HTTP endpoint handler
   */
  async handleHealthEndpoint(path: string): Promise<any> {
    switch (path) {
      case '/health':
        return this.checkHealth();
      
      case '/health/v1':
        return this.checkVersionHealth('1.0');
      
      case '/health/v2':
        return this.checkVersionHealth('2.0');
      
      case '/health/ready':
        return this.checkReadiness();
      
      case '/health/live':
        return this.checkLiveness();
      
      default:
        throw new Error(`Unknown health endpoint: ${path}`);
    }
  }
  
  /**
   * Check if service is ready to accept requests
   */
  private async checkReadiness(): Promise<{ ready: boolean; checks: any }> {
    const health = await this.checkHealth();
    
    return {
      ready: health.overall !== 'unhealthy',
      checks: {
        versions: health.versions,
        dependencies: health.dependencies
      }
    };
  }
  
  /**
   * Check if service is alive (basic health)
   */
  private checkLiveness(): { alive: boolean; uptime: number } {
    return {
      alive: true,
      uptime: Date.now() - this.startTime.getTime()
    };
  }
  
  /**
   * Calculate overall health status
   */
  private calculateOverallStatus(results: HealthCheckResult[]): 'healthy' | 'degraded' | 'unhealthy' {
    const statuses = results.map(r => r.status);
    
    if (statuses.every(s => s === 'healthy')) {
      return 'healthy';
    }
    
    if (statuses.some(s => s === 'healthy')) {
      return 'degraded';
    }
    
    return 'unhealthy';
  }
  
  /**
   * Add timeout to promise
   */
  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout')), ms)
      )
    ]);
  }
  
  /**
   * Start automated health monitoring
   */
  startMonitoring(intervalMs: number = 60000): void {
    setInterval(async () => {
      const health = await this.checkHealth();
      
      if (health.overall !== 'healthy') {
        this.logger.warn('System health degraded', {
          overall: health.overall,
          versions: health.versions
        });
      }
    }, intervalMs);
    
    this.logger.info(`Health monitoring started (interval: ${intervalMs}ms)`);
  }
}