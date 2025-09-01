/**
 * Error Collector
 * Tracks and analyzes errors for both versions
 */
import { MetricCollector } from '../types';
export declare class ErrorCollector implements MetricCollector {
    name: string;
    private errors;
    private errorPatterns;
    private logger;
    private errorCategories;
    constructor();
    /**
     * Initialize error categories
     */
    private initializeCategories;
    /**
     * Initialize error tracking for both versions
     */
    private initializeVersions;
    /**
     * Track an error occurrence
     */
    trackError(version: '1.0' | '2.0', error: Error, userId: string, context?: any): void;
    /**
     * Categorize an error
     */
    private categorizeError;
    /**
     * Track error patterns
     */
    private trackErrorPattern;
    /**
     * Normalize error message for pattern matching
     */
    private normalizeErrorMessage;
    /**
     * Get top error patterns for a version
     */
    private getTopPatterns;
    /**
     * Calculate error rate
     */
    updateErrorRate(version: '1.0' | '2.0', totalRequests: number): void;
    /**
     * Collect error metrics
     */
    collect(): Promise<Record<string, any>>;
    /**
     * Identify error patterns unique to v2
     */
    private identifyNewPatterns;
    /**
     * Reset collector
     */
    reset(): void;
    /**
     * Get error summary
     */
    getSummary(): any;
    /**
     * Check if error rate exceeds threshold
     */
    isErrorRateHigh(version: '1.0' | '2.0', threshold?: number): boolean;
}
