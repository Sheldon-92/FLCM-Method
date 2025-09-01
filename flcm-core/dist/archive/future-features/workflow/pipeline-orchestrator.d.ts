/**
 * Pipeline Orchestrator
 * Manages the complete FLCM agent pipeline execution
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
import { Document } from '../agents/base-agent';
import { AdaptedContent } from '../agents/implementations/adapter-agent';
export type WorkflowMode = 'quick' | 'standard' | 'custom';
export type AgentName = 'collector' | 'scholar' | 'creator' | 'adapter';
export type WorkflowStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed';
export interface WorkflowConfig {
    mode: WorkflowMode;
    agents: AgentConfig[];
    options?: {
        saveCheckpoints?: boolean;
        parallel?: boolean;
        timeout?: number;
        qualityGates?: boolean;
    };
}
export interface AgentConfig {
    name: AgentName;
    enabled: boolean;
    config?: Record<string, any>;
}
export interface WorkflowState {
    id: string;
    status: WorkflowStatus;
    mode: WorkflowMode;
    currentAgent: AgentName | null;
    progress: number;
    startTime: Date;
    endTime?: Date;
    documents: Map<AgentName, Document>;
    errors: Error[];
    metrics: WorkflowMetrics;
}
export interface WorkflowMetrics {
    totalDuration?: number;
    agentDurations: Map<AgentName, number>;
    qualityScores: Map<AgentName, number>;
    tokenUsage: number;
    errorCount: number;
}
export interface WorkflowResult {
    success: boolean;
    state: WorkflowState;
    finalContent?: AdaptedContent | AdaptedContent[];
    error?: Error;
}
export declare class PipelineOrchestrator extends EventEmitter {
    private state;
    private agents;
    private checkpoints;
    constructor();
    private initializeAgents;
    private createInitialState;
    /**
     * Execute workflow with specified configuration
     */
    execute(input: string | Document, config: WorkflowConfig): Promise<WorkflowResult>;
    /**
     * Execute individual agent
     */
    private executeAgent;
    /**
     * Get pipeline configuration based on mode
     */
    private getPipelineConfig;
    /**
     * Apply configuration to agent
     */
    private applyAgentConfig;
    /**
     * Calculate workflow progress
     */
    private calculateProgress;
    /**
     * Check quality gate for agent output
     */
    private checkQualityGate;
    /**
     * Save checkpoint
     */
    private saveCheckpoint;
    /**
     * Load checkpoint
     */
    loadCheckpoint(name: string): WorkflowState | undefined;
    /**
     * Handle agent error
     */
    private handleAgentError;
    /**
     * Attempt recovery from error
     */
    private attemptRecovery;
    /**
     * Pause workflow
     */
    pause(): void;
    /**
     * Resume workflow
     */
    resume(): void;
    /**
     * Cancel workflow
     */
    cancel(): void;
    /**
     * Get current state
     */
    getState(): WorkflowState;
    /**
     * Get metrics
     */
    getMetrics(): WorkflowMetrics;
    /**
     * Generate unique ID
     */
    private generateId;
}
export default PipelineOrchestrator;
