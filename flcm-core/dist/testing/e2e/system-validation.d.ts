/**
 * FLCM 2.0 Complete System Validation
 * Comprehensive validation of all Phase 1-5 components
 */
/**
 * System health check utilities
 */
export declare class SystemHealthChecker {
    static performHealthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        components: Record<string, boolean>;
        performance: {
            responseTime: number;
            memoryUsage: number;
            errorRate: number;
        };
        recommendations: string[];
    }>;
    static validateCompleteSystem(): Promise<{
        isValid: boolean;
        missingComponents: string[];
        configurationIssues: string[];
        performanceIssues: string[];
    }>;
}
