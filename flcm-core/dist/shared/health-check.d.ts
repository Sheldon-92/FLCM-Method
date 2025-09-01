/**
 * FLCM 2.0 Health Check System
 * Provides comprehensive health monitoring and system diagnostics
 */
interface HealthCheckResult {
    status: 'healthy' | 'warning' | 'critical';
    timestamp: string;
    checks: {
        [key: string]: {
            status: 'pass' | 'fail' | 'warn';
            message: string;
            metrics?: any;
            duration?: number;
        };
    };
    system: SystemInfo;
    summary: {
        total: number;
        passed: number;
        failed: number;
        warnings: number;
        score: number;
    };
}
interface SystemInfo {
    platform: string;
    arch: string;
    nodeVersion: string;
    uptime: number;
    memory: {
        total: number;
        free: number;
        used: number;
        percentage: number;
    };
    cpu: {
        cores: number;
        model: string;
        load: number[];
    };
    disk: {
        available: number;
        used: number;
        total: number;
        percentage: number;
    };
}
export declare class HealthChecker {
    private readonly configPath;
    private readonly requiredDirectories;
    private readonly requiredFiles;
    constructor();
    /**
     * Run comprehensive health check
     */
    runHealthCheck(): Promise<HealthCheckResult>;
    /**
     * Check file system structure
     */
    private checkFileSystem;
    /**
     * Check configuration validity
     */
    private checkConfiguration;
    /**
     * Check dependencies
     */
    private checkDependencies;
    /**
     * Check agent availability
     */
    private checkAgents;
    /**
     * Check methodologies
     */
    private checkMethodologies;
    /**
     * Check pipeline components
     */
    private checkPipeline;
    /**
     * Check disk space
     */
    private checkDiskSpace;
    /**
     * Check memory usage
     */
    private checkMemoryUsage;
    /**
     * Check running processes
     */
    private checkProcesses;
    /**
     * Get system information
     */
    private getSystemInfo;
    /**
     * Print formatted health report
     */
    private printHealthReport;
}
export default HealthChecker;
