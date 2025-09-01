/**
 * Version Router Main Module
 * Central routing system for FLCM dual architecture
 */
import { VersionRequest, VersionResponse, RouterConfig, VersionHandler, FLCMVersion } from './types';
export declare class VersionRouter {
    private config;
    private detector;
    private middleware;
    private errorHandler;
    private logger;
    private v1Handler?;
    private v2Handler?;
    private configManager;
    constructor(configPath?: string);
    private setupDefaultMiddleware;
    /**
     * Register version handlers
     */
    registerV1Handler(handler: VersionHandler): void;
    registerV2Handler(handler: VersionHandler): void;
    /**
     * Main routing method
     */
    route(request: VersionRequest): Promise<VersionResponse>;
    /**
     * Health check for both versions
     */
    healthCheck(): Promise<{
        overall: 'healthy' | 'degraded' | 'unhealthy';
        versions: Record<FLCMVersion, any>;
    }>;
    /**
     * Update configuration dynamically
     */
    updateConfig(newConfig: Partial<RouterConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): RouterConfig;
}
export * from './types';
export { VersionDetector } from './version-detector';
export { VersionMiddleware } from './middleware';
export { VersionRouterErrorHandler, VersionError } from './error-handler';
