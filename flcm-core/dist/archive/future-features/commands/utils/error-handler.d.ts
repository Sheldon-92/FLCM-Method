/**
 * FLCM Error Handler
 * Provides user-friendly error messages and recovery suggestions
 */
export declare class FLCMError extends Error {
    code: string;
    suggestion?: string;
    documentation?: string;
    constructor(message: string, code?: string, suggestion?: string, documentation?: string);
    /**
     * Display formatted error message
     */
    display(): void;
    /**
     * Convert to JSON for logging
     */
    toJSON(): Record<string, any>;
}
/**
 * Common error factory functions
 */
export declare class ErrorFactory {
    static configurationError(details: string): FLCMError;
    static initializationError(details: string): FLCMError;
    static agentError(agent: string, details: string): FLCMError;
    static workflowError(workflow: string, details: string): FLCMError;
    static validationError(field: string, value: any, expected: string): FLCMError;
    static fileNotFoundError(path: string): FLCMError;
    static networkError(url: string, details: string): FLCMError;
    static methodologyError(methodology: string, details: string): FLCMError;
    static permissionError(path: string): FLCMError;
    static timeoutError(operation: string, timeout: number): FLCMError;
}
/**
 * Error recovery strategies
 */
export declare class ErrorRecovery {
    /**
     * Attempt to recover from configuration errors
     */
    static recoverConfiguration(): Promise<boolean>;
    /**
     * Log error for debugging
     */
    static logError(error: Error | FLCMError): Promise<void>;
}
/**
 * Global error handler
 */
export declare function handleError(error: Error | FLCMError): Promise<void>;
