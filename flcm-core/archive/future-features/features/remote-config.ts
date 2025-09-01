/**
 * Remote Config Client
 * Fetches and manages remote feature flag configuration
 */

import { RemoteConfig, FeatureFlag } from './types';
import { Logger } from '../shared/utils/logger';
import { EventEmitter } from 'events';
import * as https from 'https';
import * as http from 'http';

export class RemoteConfigClient extends EventEmitter {
  private configUrl: string;
  private cache: RemoteConfig | null = null;
  private lastFetch: Date | null = null;
  private pollInterval: number = 60000; // 1 minute default
  private pollTimer?: NodeJS.Timeout;
  private etag?: string;
  private logger: Logger;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private retryDelay: number = 5000; // 5 seconds
  
  constructor(configUrl: string, pollInterval?: number) {
    super();
    this.configUrl = configUrl;
    this.logger = new Logger('RemoteConfigClient');
    
    if (pollInterval) {
      this.pollInterval = pollInterval;
    }
  }
  
  /**
   * Start polling for configuration updates
   */
  startPolling(): void {
    // Fetch immediately
    this.fetchConfig();
    
    // Start polling interval
    this.pollTimer = setInterval(() => {
      this.fetchConfig();
    }, this.pollInterval);
    
    this.logger.info(`Started polling ${this.configUrl} every ${this.pollInterval}ms`);
  }
  
  /**
   * Stop polling
   */
  async stopPolling(): Promise<void> {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = undefined;
    }
    
    this.logger.info('Stopped polling for remote config');
  }
  
  /**
   * Fetch configuration from remote
   */
  async fetchConfig(): Promise<void> {
    try {
      const config = await this.httpGet(this.configUrl);
      
      // Check if config has changed
      if (this.hasConfigChanged(config)) {
        // Validate configuration
        if (this.validateConfig(config)) {
          this.cache = config;
          this.lastFetch = new Date();
          this.retryCount = 0;
          
          // Emit update event
          this.emit('config-updated', config);
          
          this.logger.info('Remote config updated', {
            version: config.version,
            flagCount: Object.keys(config.flags || {}).length
          });
        } else {
          this.logger.error('Invalid remote config received');
          this.emit('config-error', new Error('Invalid configuration'));
        }
      }
    } catch (error) {
      this.handleFetchError(error);
    }
  }
  
  /**
   * HTTP GET request
   */
  private httpGet(url: string): Promise<RemoteConfig> {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      
      const options = {
        headers: {
          'User-Agent': 'FLCM-FeatureFlags/2.0',
          'Accept': 'application/json'
        }
      };
      
      // Add ETag if we have one
      if (this.etag) {
        options.headers['If-None-Match'] = this.etag;
      }
      
      const req = protocol.get(url, options, (res) => {
        // Handle 304 Not Modified
        if (res.statusCode === 304) {
          this.logger.debug('Config not modified (304)');
          resolve(this.cache!);
          return;
        }
        
        // Handle non-200 status
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          return;
        }
        
        // Store ETag for future requests
        if (res.headers.etag) {
          this.etag = res.headers.etag;
        }
        
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const config = JSON.parse(data);
            resolve(config);
          } catch (error) {
            reject(new Error('Invalid JSON response'));
          }
        });
      });
      
      req.on('error', reject);
      
      // Set timeout
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }
  
  /**
   * Check if configuration has changed
   */
  private hasConfigChanged(config: RemoteConfig): boolean {
    if (!this.cache) {
      return true;
    }
    
    // Compare versions
    if (config.version !== this.cache.version) {
      return true;
    }
    
    // Compare last modified
    if (config.last_modified !== this.cache.last_modified) {
      return true;
    }
    
    // Deep compare flags (simplified)
    const oldFlags = JSON.stringify(this.cache.flags);
    const newFlags = JSON.stringify(config.flags);
    
    return oldFlags !== newFlags;
  }
  
  /**
   * Validate configuration
   */
  private validateConfig(config: any): config is RemoteConfig {
    // Check required fields
    if (!config || typeof config !== 'object') {
      return false;
    }
    
    if (!config.flags || typeof config.flags !== 'object') {
      return false;
    }
    
    if (!config.version || typeof config.version !== 'string') {
      return false;
    }
    
    // Validate each flag
    for (const [name, flag] of Object.entries(config.flags)) {
      if (!this.validateFlag(flag)) {
        this.logger.warn(`Invalid flag configuration: ${name}`);
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Validate individual flag
   */
  private validateFlag(flag: any): flag is FeatureFlag {
    if (!flag || typeof flag !== 'object') {
      return false;
    }
    
    // Required fields
    if (typeof flag.name !== 'string' || !flag.name) {
      return false;
    }
    
    if (typeof flag.default !== 'boolean') {
      return false;
    }
    
    // Optional fields validation
    if (flag.rollout && typeof flag.rollout !== 'object') {
      return false;
    }
    
    if (flag.rollout?.percentage !== undefined) {
      const pct = flag.rollout.percentage;
      if (typeof pct !== 'number' || pct < 0 || pct > 100) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Handle fetch error
   */
  private handleFetchError(error: any): void {
    this.logger.error('Failed to fetch remote config', { 
      error: error.message,
      retryCount: this.retryCount 
    });
    
    this.emit('config-error', error);
    
    // Retry logic
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      
      setTimeout(() => {
        this.logger.info(`Retrying fetch (attempt ${this.retryCount}/${this.maxRetries})`);
        this.fetchConfig();
      }, this.retryDelay * this.retryCount);
    } else {
      this.logger.error('Max retries exceeded for remote config');
      this.emit('config-fetch-failed', { 
        error,
        retries: this.retryCount 
      });
    }
  }
  
  /**
   * Get cached configuration
   */
  getConfig(): RemoteConfig | null {
    return this.cache;
  }
  
  /**
   * Get specific flag from cache
   */
  getFlag(name: string): FeatureFlag | undefined {
    return this.cache?.flags[name];
  }
  
  /**
   * Force refresh configuration
   */
  async refresh(): Promise<void> {
    this.etag = undefined; // Clear ETag to force fresh fetch
    await this.fetchConfig();
  }
  
  /**
   * Update polling interval
   */
  updatePollInterval(intervalMs: number): void {
    this.pollInterval = intervalMs;
    
    // Restart polling with new interval
    if (this.pollTimer) {
      this.stopPolling();
      this.startPolling();
    }
    
    this.logger.info(`Updated poll interval to ${intervalMs}ms`);
  }
  
  /**
   * Get status
   */
  getStatus(): any {
    return {
      url: this.configUrl,
      lastFetch: this.lastFetch,
      cacheVersion: this.cache?.version,
      pollInterval: this.pollInterval,
      isPolling: !!this.pollTimer,
      retryCount: this.retryCount,
      hasCache: !!this.cache
    };
  }
  
  /**
   * Create mock server for testing
   */
  static createMockServer(port: number = 3000): http.Server {
    const mockConfig: RemoteConfig = {
      version: '1.0.0',
      last_modified: new Date().toISOString(),
      flags: {
        'test_flag': {
          name: 'test_flag',
          description: 'Test flag for development',
          default: false,
          rollout: {
            percentage: 50
          }
        },
        'v2_features': {
          name: 'v2_features',
          description: 'Enable v2 features',
          default: true,
          rollout: {
            percentage: 100
          }
        }
      }
    };
    
    const server = http.createServer((req, res) => {
      if (req.url === '/config') {
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'ETag': `"${Date.now()}"`,
          'Cache-Control': 'no-cache'
        });
        res.end(JSON.stringify(mockConfig));
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });
    
    server.listen(port, () => {
      console.log(`Mock config server running on port ${port}`);
    });
    
    return server;
  }
}