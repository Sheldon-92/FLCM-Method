/**
 * Recovery Manager for Agent Error Handling
 * Implements error recovery and system resilience strategies
 */
export interface RecoveryOptions {
    errorType: string;
    strategy: string;
    data?: any;
    retryCount?: number;
    fallbackStrategy?: string;
}
export interface RecoveryResult {
    success: boolean;
    strategy?: string;
    recoveredData?: any;
    error?: string;
}
export interface AgentCrashOptions {
    agentId: string;
    error: Error;
    retryCount: number;
    fallbackStrategy: string;
}
export interface AgentCrashResult {
    recovered: boolean;
    strategy: string;
    error?: string;
}
export interface ResourceExhaustionOptions {
    resourceType: string;
    availableAmount: number;
    requestedAmount: number;
    degradationStrategy: string;
}
export interface ResourceExhaustionResult {
    applied: boolean;
    degradationLevel: number;
    strategy: string;
}
export declare class RecoveryManager {
    private recoveryStrategies;
    constructor();
    private initializeStrategies;
    recover(options: RecoveryOptions): Promise<RecoveryResult>;
    handleAgentCrash(options: AgentCrashOptions): Promise<AgentCrashResult>;
    handleResourceExhaustion(options: ResourceExhaustionOptions): Promise<ResourceExhaustionResult>;
    testRecoveryCapability(): Promise<{
        operational: boolean;
    }>;
    private retryWithDefaults;
    private fallbackToCache;
    private useMinimalData;
    private requestUserIntervention;
    private testRetryMechanism;
    private testFallbackMechanism;
    private testDegradationMechanism;
}
