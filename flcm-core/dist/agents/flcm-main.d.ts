/**
 * FLCM Main Agent
 * Orchestrates the 3-layer agent system (Scholar → Creator → Publisher)
 */
import { BaseAgent, Document } from './base-agent';
import { AgentRequest, AgentResponse, CircuitState } from './types';
export declare class FLCMAgent extends BaseAgent {
    private agents;
    private logger;
    private flcmConfig;
    private retryConfig;
    private circuitBreakers;
    private circuitBreakerConfig;
    constructor(configPath?: string);
    /**
     * Initialize Winston logger
     */
    private initializeLogger;
    /**
     * Load FLCM configuration
     */
    private loadFLCMConfig;
    /**
     * Create default configuration file
     */
    private createDefaultConfig;
    /**
     * Get default FLCM configuration
     */
    private getDefaultFLCMConfig;
    /**
     * Initialize retry configuration
     */
    private initializeRetryConfig;
    /**
     * Initialize circuit breakers for all agents
     */
    private initializeCircuitBreakers;
    /**
     * Register an agent
     */
    registerAgent(agent: BaseAgent): void;
    /**
     * Route request to appropriate agent
     */
    route(request: AgentRequest): Promise<AgentResponse>;
    /**
     * Determine target agent based on request type
     */
    private determineTargetAgent;
    /**
     * Process request with retry logic
     */
    private processWithRetry;
    /**
     * Check if error is retryable
     */
    private isRetryableError;
    /**
     * Handle fallback strategies
     */
    private handleFallback;
    /**
     * Generate basic insights as fallback
     */
    private generateBasicInsights;
    /**
     * Use content template as fallback
     */
    private useContentTemplate;
    /**
     * Queue for retry as fallback
     */
    private queueForRetry;
    /**
     * Circuit breaker methods
     */
    private isCircuitOpen;
    private recordFailure;
    private resetCircuitBreaker;
    /**
     * Health check for all agents
     */
    healthCheck(): Promise<{
        [agentId: string]: boolean;
    }>;
    /**
     * Get metrics for all agents
     */
    getMetrics(): {
        main: {
            uptime: number;
            registeredAgents: number;
            circuitBreakers: {
                [k: string]: {
                    state: CircuitState;
                    failures: number;
                };
            };
        };
        agents: any;
    };
    protected onInit(): Promise<void>;
    protected onExecute(input: Document): Promise<Document>;
    protected onCleanup(): Promise<void>;
    protected validateInput(input: Document): void;
    private sleep;
}
