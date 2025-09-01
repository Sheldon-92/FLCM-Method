/**
 * Remote Config Client
 * Fetches and manages remote feature flag configuration
 */
/// <reference types="node" />
/// <reference types="node" />
import { RemoteConfig, FeatureFlag } from './types';
import { EventEmitter } from 'events';
import * as http from 'http';
export declare class RemoteConfigClient extends EventEmitter {
    private configUrl;
    private cache;
    private lastFetch;
    private pollInterval;
    private pollTimer?;
    private etag?;
    private logger;
    private retryCount;
    private maxRetries;
    private retryDelay;
    constructor(configUrl: string, pollInterval?: number);
    /**
     * Start polling for configuration updates
     */
    startPolling(): void;
    /**
     * Stop polling
     */
    stopPolling(): Promise<void>;
    /**
     * Fetch configuration from remote
     */
    fetchConfig(): Promise<void>;
    /**
     * HTTP GET request
     */
    private httpGet;
    /**
     * Check if configuration has changed
     */
    private hasConfigChanged;
    /**
     * Validate configuration
     */
    private validateConfig;
    /**
     * Validate individual flag
     */
    private validateFlag;
    /**
     * Handle fetch error
     */
    private handleFetchError;
    /**
     * Get cached configuration
     */
    getConfig(): RemoteConfig | null;
    /**
     * Get specific flag from cache
     */
    getFlag(name: string): FeatureFlag | undefined;
    /**
     * Force refresh configuration
     */
    refresh(): Promise<void>;
    /**
     * Update polling interval
     */
    updatePollInterval(intervalMs: number): void;
    /**
     * Get status
     */
    getStatus(): any;
    /**
     * Create mock server for testing
     */
    static createMockServer(port?: number): http.Server;
}
