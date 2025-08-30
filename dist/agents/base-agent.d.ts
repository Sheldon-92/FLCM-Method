/**
 * Base Agent Framework for FLCM
 * Provides the foundation for all FLCM agents
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
/**
 * Agent configuration structure
 */
export interface AgentConfig {
    id: string;
    name: string;
    title: string;
    icon: string;
    whenToUse: string;
    enabled: boolean;
    timeout?: number;
    methodologies?: string[];
}
/**
 * Agent persona definition
 */
export interface AgentPersona {
    role: string;
    style: string;
    focus: string;
    identity?: string;
}
/**
 * Document structure for agent processing
 */
export interface Document {
    id: string;
    type: string;
    content: string;
    metadata: Record<string, any>;
    timestamp: Date;
}
/**
 * Agent message for inter-agent communication
 */
export interface AgentMessage {
    from: string;
    to: string;
    type: 'request' | 'response' | 'event' | 'error';
    payload: any;
    timestamp: Date;
    correlationId?: string;
}
/**
 * Agent state management
 */
export interface AgentState {
    status: 'idle' | 'initializing' | 'ready' | 'processing' | 'error' | 'terminated';
    currentTask?: string;
    lastExecution?: Date;
    executionCount: number;
    sessionData: Map<string, any>;
    history: ExecutionRecord[];
    error?: Error;
}
/**
 * Execution record for history tracking
 */
export interface ExecutionRecord {
    id: string;
    startTime: Date;
    endTime?: Date;
    input: Document;
    output?: Document;
    methodologiesUsed: string[];
    status: 'success' | 'failure' | 'timeout';
    error?: string;
    metrics?: PerformanceMetrics;
}
/**
 * Performance metrics
 */
export interface PerformanceMetrics {
    executionTime: number;
    memoryUsed: number;
    methodologyInvocations: Map<string, number>;
    documentsProcessed: number;
}
/**
 * Agent error class
 */
export declare class AgentError extends Error {
    agentId: string;
    code: string;
    recoverable: boolean;
    constructor(agentId: string, code: string, message: string, recoverable?: boolean);
}
/**
 * Base Agent Class
 * All FLCM agents extend this class
 */
export declare abstract class BaseAgent extends EventEmitter {
    protected config: AgentConfig;
    protected persona: AgentPersona;
    protected state: AgentState;
    protected basePath: string;
    protected performanceTracker: Map<string, number>;
    constructor(configPath?: string);
    /**
     * Load agent configuration from YAML file
     */
    protected loadConfiguration(configPath: string): void;
    /**
     * Initialize the agent
     */
    init(config?: Partial<AgentConfig>): Promise<void>;
    /**
     * Execute agent's main processing logic
     */
    execute(input: Document): Promise<Document>;
    /**
     * Cleanup agent resources
     */
    cleanup(): Promise<void>;
    /**
     * Send message to another agent
     */
    send(message: Omit<AgentMessage, 'from' | 'timestamp'>): void;
    /**
     * Receive message from another agent
     */
    receive(message: AgentMessage): void;
    /**
     * Get current agent state
     */
    getState(): AgentState;
    /**
     * Execute a methodology
     */
    protected executeMethodology(name: string, input: any): Promise<any>;
    protected abstract onInit(): Promise<void>;
    protected abstract onExecute(input: Document): Promise<Document>;
    protected abstract onCleanup(): Promise<void>;
    protected abstract validateInput(input: Document): void;
    protected beforeExecute(input: Document): Promise<Document>;
    protected afterExecute(output: Document): Promise<Document>;
    protected updateState(status: AgentState['status'], currentTask?: string | Error): void;
    protected validateConfig(): void;
    protected loadMethodologies(): Promise<void>;
    protected loadMethodology(name: string): Promise<any>;
    protected generateExecutionId(): string;
    protected saveState(): Promise<void>;
    protected handleRequest(message: AgentMessage): void;
    protected handleResponse(message: AgentMessage): void;
    protected handleEvent(message: AgentMessage): void;
    protected handleError(message: AgentMessage): void;
}
//# sourceMappingURL=base-agent.d.ts.map