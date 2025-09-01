/**
 * Claude API Mock for Testing
 * Provides comprehensive mocking capabilities for Claude API interactions
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
export interface MockClaudeResponse {
    id: string;
    type: 'message';
    role: 'assistant';
    content: Array<{
        type: 'text';
        text: string;
    }>;
    model: string;
    stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence';
    stop_sequence?: string;
    usage: {
        input_tokens: number;
        output_tokens: number;
    };
}
export interface MockClaudeRequest {
    model: string;
    messages: Array<{
        role: 'user' | 'assistant';
        content: string;
    }>;
    max_tokens: number;
    temperature?: number;
    system?: string;
    stop_sequences?: string[];
}
export interface ClaudeAPIMockConfig {
    apiKey?: string;
    baseURL?: string;
    defaultModel?: string;
    rateLimitPerMinute?: number;
    enableLatencySimulation?: boolean;
    averageLatency?: number;
    errorRate?: number;
    enableUsageTracking?: boolean;
}
export interface MockScenario {
    name: string;
    condition: (request: MockClaudeRequest) => boolean;
    response: MockClaudeResponse | Error;
    delay?: number;
    probability?: number;
}
/**
 * Claude API Mock Class
 */
export declare class ClaudeAPIMock extends EventEmitter {
    private config;
    private requestHistory;
    private scenarios;
    private usageStats;
    private rateLimitTracker;
    private isRecording;
    constructor(config?: Partial<ClaudeAPIMockConfig>);
    /**
     * Mock a Claude API message request
     */
    messages(request: MockClaudeRequest): Promise<MockClaudeResponse>;
    /**
     * Add a custom scenario
     */
    addScenario(scenario: MockScenario): void;
    /**
     * Add multiple scenarios
     */
    addScenarios(scenarios: MockScenario[]): void;
    /**
     * Clear all custom scenarios
     */
    clearScenarios(): void;
    /**
     * Start recording interactions
     */
    startRecording(): void;
    /**
     * Stop recording and return history
     */
    stopRecording(): typeof this.requestHistory;
    /**
     * Get usage statistics
     */
    getUsageStats(): {
        totalRequests: number;
        totalInputTokens: number;
        totalOutputTokens: number;
        errorCount: number;
        rateLimitHits: number;
    };
    /**
     * Get request history
     */
    getRequestHistory(): {
        request: MockClaudeRequest;
        response: Error | MockClaudeResponse;
        timestamp: Date;
        latency: number;
    }[];
    /**
     * Reset all statistics and history
     */
    reset(): void;
    /**
     * Simulate network error
     */
    simulateNetworkError(): void;
    /**
     * Simulate rate limiting
     */
    simulateRateLimit(): void;
    /**
     * Create a mock for specific agent responses
     */
    mockAgentResponse(agentType: 'scholar' | 'creator' | 'publisher', content: string): void;
    /**
     * Mock methodology-specific responses
     */
    mockMethodologyResponse(methodology: string, analysisResult: any): void;
    /**
     * Create a mock response with specific structure
     */
    private createMockResponse;
    /**
     * Setup default scenarios for common patterns
     */
    private setupDefaultScenarios;
    /**
     * Find matching scenario for request
     */
    private findMatchingScenario;
    /**
     * Generate default response when no scenario matches
     */
    private generateDefaultResponse;
    /**
     * Estimate token count (rough approximation)
     */
    private estimateTokens;
    /**
     * Check if rate limited
     */
    private isRateLimited;
    /**
     * Calculate simulated latency
     */
    private calculateLatency;
    /**
     * Delay utility
     */
    private delay;
    /**
     * Record interaction for history
     */
    private recordInteraction;
}
/**
 * Get or create global Claude API mock instance
 */
export declare function getClaudeAPIMock(config?: Partial<ClaudeAPIMockConfig>): ClaudeAPIMock;
/**
 * Reset global mock instance
 */
export declare function resetClaudeAPIMock(): void;
/**
 * Mock factory for common test scenarios
 */
export declare class ClaudeMockFactory {
    /**
     * Create mock for successful analysis
     */
    static createSuccessfulAnalysisMock(): ClaudeAPIMock;
    /**
     * Create mock for content creation
     */
    static createContentCreationMock(): ClaudeAPIMock;
    /**
     * Create mock that simulates network errors
     */
    static createErrorMock(): ClaudeAPIMock;
    /**
     * Create mock with high latency
     */
    static createHighLatencyMock(): ClaudeAPIMock;
}
/**
 * Jest mock setup helper
 */
export declare function setupClaudeMockForJest(mock: ClaudeAPIMock): void;
