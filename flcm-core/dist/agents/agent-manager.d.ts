/**
 * Agent Manager for FLCM
 * Coordinates agent lifecycle and communication
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
import { BaseAgent, AgentMessage, AgentState, Document } from './base-agent';
/**
 * Agent Manager Configuration
 */
interface ManagerConfig {
    maxConcurrentAgents: number;
    messageQueueSize: number;
    enableMonitoring: boolean;
    monitoringInterval: number;
}
/**
 * Agent Manager Class
 * Manages all agents in the FLCM system
 */
export declare class AgentManager extends EventEmitter {
    private agents;
    private messageQueue;
    private config;
    private monitoringTimer?;
    constructor(config?: Partial<ManagerConfig>);
    /**
     * Initialize the agent manager
     */
    initialize(): Promise<void>;
    /**
     * Register an agent
     */
    registerAgent(id: string, AgentClass: typeof BaseAgent, configPath?: string): Promise<void>;
    /**
     * Unregister an agent
     */
    unregisterAgent(id: string): Promise<void>;
    /**
     * Get an agent instance
     */
    getAgent(id: string): BaseAgent | undefined;
    /**
     * Execute an agent
     */
    executeAgent(id: string, input: Document): Promise<Document>;
    /**
     * Send message between agents
     */
    sendMessage(message: Omit<AgentMessage, 'timestamp'>): void;
    /**
     * Get agent states
     */
    getAgentStates(): Map<string, AgentState>;
    /**
     * Get system health
     */
    getSystemHealth(): any;
    /**
     * Shutdown agent manager
     */
    shutdown(): Promise<void>;
    private loadAgentConfigurations;
    private setupAgentListeners;
    private setupMessageRouting;
    private startMonitoring;
    private attemptRecovery;
}
export declare const agentManager: AgentManager;
export {};
