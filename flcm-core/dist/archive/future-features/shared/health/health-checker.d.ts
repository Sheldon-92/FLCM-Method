/**
 * Health Check System
 * Monitors health of both FLCM versions
 */
import { HealthStatus, FLCMVersion } from '../../router/types';
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
export declare class HealthChecker {
    private logger;
    private startTime;
    private checks;
    constructor();
    /**
     * Register a health check
     */
    registerCheck(name: string, check: () => Promise<HealthCheckResult>): void;
    /**
     * Perform all health checks
     */
    checkHealth(): Promise<SystemHealth>;
    /**
     * Check specific version health
     */
    checkVersionHealth(version: FLCMVersion): Promise<HealthStatus>;
    /**
     * Create HTTP endpoint handler
     */
    handleHealthEndpoint(path: string): Promise<any>;
    /**
     * Check if service is ready to accept requests
     */
    private checkReadiness;
    /**
     * Check if service is alive (basic health)
     */
    private checkLiveness;
    /**
     * Calculate overall health status
     */
    private calculateOverallStatus;
    /**
     * Add timeout to promise
     */
    private withTimeout;
    /**
     * Start automated health monitoring
     */
    startMonitoring(intervalMs?: number): void;
}
