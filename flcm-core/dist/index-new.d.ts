/**
 * FLCM 2.0 Main Entry Point with Command Integration
 * Updated to include Phase 3 Claude Integration functionality
 */
export { executeFLCMCommand, getAvailableCommands, getCommandSuggestions, getCommandHistory, CommandRouter, router, ScholarHandler, CreatorHandler, PublisherHandler, WorkflowHandler, CommandResult, FLCMCommandError } from './commands';
export { CollectorAgent } from './agents/implementations/collector-agent';
export { ScholarAgent } from './agents/implementations/scholar-agent';
export { CreatorAgent } from './agents/implementations/creator-agent';
export { AdapterAgent } from './agents/implementations/adapter-agent';
export { FLCMAgent } from './agents/flcm-main';
export { BaseAgent, Document, AgentError } from './agents/base-agent';
export { AgentManager } from './agents/agent-manager';
/**
 * Main FLCM Class - Primary Interface
 */
export declare class FLCM {
    private static instance;
    private flcmAgent;
    private initialized;
    private constructor();
    static getInstance(): FLCM;
    /**
     * Initialize FLCM system
     */
    init(): Promise<void>;
    /**
     * Execute FLCM command
     */
    executeCommand(command: string, args?: string[], options?: Record<string, any>, user?: any): Promise<import("./commands").CommandResult>;
    /**
     * Get system status
     */
    getStatus(): {
        initialized: boolean;
        version: string;
        agents: {
            collector: string;
            scholar: string;
            creator: string;
            publisher: string;
        };
        commands: string[];
    };
    /**
     * Health check
     */
    healthCheck(): Promise<{
        initialized: boolean;
        version: string;
        agents: {
            collector: string;
            scholar: string;
            creator: string;
            publisher: string;
        };
        commands: string[];
        healthy: boolean;
        timestamp: string;
        error?: undefined;
    } | {
        healthy: boolean;
        error: any;
        timestamp: string;
    }>;
}
declare const app: any;
export { app, FLCM };
export default FLCM;
