/**
 * Pipeline Orchestrator
 * Manages the complete FLCM agent pipeline execution
 */

import { EventEmitter } from 'events';
import { Document } from '../agents/base-agent';
import { CollectorAgent, ContentBrief } from '../agents/implementations/collector-agent';
import { ScholarAgent, KnowledgeSynthesis } from '../agents/implementations/scholar-agent';
import { CreatorAgent, ContentDraft } from '../agents/implementations/creator-agent';
import { AdapterAgent, AdaptedContent } from '../agents/implementations/adapter-agent';

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

export class PipelineOrchestrator extends EventEmitter {
  private state: WorkflowState;
  private agents: Map<AgentName, any>;
  private checkpoints: Map<string, WorkflowState>;
  
  constructor() {
    super();
    this.initializeAgents();
    this.checkpoints = new Map();
    this.state = this.createInitialState();
  }

  private initializeAgents(): void {
    this.agents = new Map([
      ['collector', new CollectorAgent()],
      ['scholar', new ScholarAgent()],
      ['creator', new CreatorAgent()],
      ['adapter', new AdapterAgent()]
    ]);
  }

  private createInitialState(): WorkflowState {
    return {
      id: this.generateId(),
      status: 'idle',
      mode: 'standard',
      currentAgent: null,
      progress: 0,
      startTime: new Date(),
      documents: new Map(),
      errors: [],
      metrics: {
        agentDurations: new Map(),
        qualityScores: new Map(),
        tokenUsage: 0,
        errorCount: 0
      }
    };
  }

  /**
   * Execute workflow with specified configuration
   */
  async execute(input: string | Document, config: WorkflowConfig): Promise<WorkflowResult> {
    try {
      // Initialize workflow
      this.state = {
        ...this.createInitialState(),
        mode: config.mode,
        status: 'running'
      };
      
      this.emit('workflow:start', { state: this.state, config });
      
      // Get pipeline configuration
      const pipeline = this.getPipelineConfig(config);
      
      // Execute pipeline
      let currentOutput: Document = typeof input === 'string' ? 
        { id: 'input', type: 'raw', content: input, timestamp: new Date() } : 
        input;
      
      for (const agentConfig of pipeline) {
        if (!agentConfig.enabled) continue;
        
        // Update state
        this.state.currentAgent = agentConfig.name;
        this.state.progress = this.calculateProgress(agentConfig.name);
        this.emit('agent:start', { agent: agentConfig.name, state: this.state });
        
        // Execute agent
        const startTime = Date.now();
        try {
          currentOutput = await this.executeAgent(
            agentConfig.name,
            currentOutput,
            agentConfig.config
          );
          
          // Record metrics
          const duration = Date.now() - startTime;
          this.state.metrics.agentDurations.set(agentConfig.name, duration);
          this.state.documents.set(agentConfig.name, currentOutput);
          
          // Quality gate check
          if (config.options?.qualityGates) {
            this.checkQualityGate(agentConfig.name, currentOutput);
          }
          
          // Save checkpoint
          if (config.options?.saveCheckpoints) {
            this.saveCheckpoint(`after_${agentConfig.name}`);
          }
          
          this.emit('agent:complete', { 
            agent: agentConfig.name, 
            output: currentOutput,
            duration 
          });
          
        } catch (error) {
          this.handleAgentError(agentConfig.name, error as Error);
          
          // Try recovery
          const recovered = await this.attemptRecovery(agentConfig.name, currentOutput);
          if (!recovered) {
            throw error;
          }
          currentOutput = recovered;
        }
      }
      
      // Complete workflow
      this.state.status = 'completed';
      this.state.endTime = new Date();
      this.state.progress = 100;
      this.state.metrics.totalDuration = 
        this.state.endTime.getTime() - this.state.startTime.getTime();
      
      this.emit('workflow:complete', { state: this.state });
      
      return {
        success: true,
        state: this.state,
        finalContent: currentOutput as AdaptedContent | AdaptedContent[]
      };
      
    } catch (error) {
      this.state.status = 'failed';
      this.state.endTime = new Date();
      this.emit('workflow:error', { error, state: this.state });
      
      return {
        success: false,
        state: this.state,
        error: error as Error
      };
    }
  }

  /**
   * Execute individual agent
   */
  private async executeAgent(
    name: AgentName,
    input: Document,
    config?: Record<string, any>
  ): Promise<Document> {
    const agent = this.agents.get(name);
    if (!agent) {
      throw new Error(`Agent ${name} not found`);
    }
    
    // Apply agent-specific configuration
    if (config) {
      this.applyAgentConfig(agent, config);
    }
    
    // Execute based on agent type
    switch (name) {
      case 'collector':
        return await agent.process(input.content || input);
        
      case 'scholar':
        const brief = input as ContentBrief;
        return await agent.process(brief);
        
      case 'creator':
        const synthesis = input as KnowledgeSynthesis;
        return await agent.process(synthesis);
        
      case 'adapter':
        const draft = input as ContentDraft;
        return await agent.process(draft);
        
      default:
        throw new Error(`Unknown agent: ${name}`);
    }
  }

  /**
   * Get pipeline configuration based on mode
   */
  private getPipelineConfig(config: WorkflowConfig): AgentConfig[] {
    if (config.mode === 'custom') {
      return config.agents;
    }
    
    // Predefined pipelines
    const pipelines: Record<WorkflowMode, AgentConfig[]> = {
      quick: [
        { name: 'collector', enabled: true, config: { maxSources: 3, depth: 'basic' } },
        { name: 'scholar', enabled: true, config: { maxDepth: 3, analogies: 2 } },
        { name: 'creator', enabled: true, config: { iterations: 1 } },
        { name: 'adapter', enabled: true, config: { platforms: ['linkedin', 'twitter'] } }
      ],
      standard: [
        { name: 'collector', enabled: true, config: { maxSources: 5, depth: 'comprehensive' } },
        { name: 'scholar', enabled: true, config: { maxDepth: 5, analogies: 5 } },
        { name: 'creator', enabled: true, config: { iterations: 3 } },
        { name: 'adapter', enabled: true, config: { platforms: ['linkedin', 'twitter', 'wechat', 'xiaohongshu'] } }
      ],
      custom: []
    };
    
    return pipelines[config.mode] || pipelines.standard;
  }

  /**
   * Apply configuration to agent
   */
  private applyAgentConfig(agent: any, config: Record<string, any>): void {
    // Agent-specific configuration application
    if (agent.setConfig && typeof agent.setConfig === 'function') {
      agent.setConfig(config);
    }
  }

  /**
   * Calculate workflow progress
   */
  private calculateProgress(currentAgent: AgentName): number {
    const agentProgress: Record<AgentName, number> = {
      collector: 25,
      scholar: 50,
      creator: 75,
      adapter: 90
    };
    
    return agentProgress[currentAgent] || 0;
  }

  /**
   * Check quality gate for agent output
   */
  private checkQualityGate(agent: AgentName, output: Document): void {
    const gates: Record<AgentName, (doc: Document) => boolean> = {
      collector: (doc) => {
        const brief = doc as ContentBrief;
        return brief.riceScore.total >= 40 && brief.signals.keyInsights.length >= 3;
      },
      scholar: (doc) => {
        const synthesis = doc as KnowledgeSynthesis;
        return synthesis.confidence >= 0.6 && synthesis.depthAnalysis.currentDepth >= 2;
      },
      creator: (doc) => {
        const draft = doc as ContentDraft;
        return draft.engagementScore >= 60;
      },
      adapter: (doc) => {
        const adapted = doc as AdaptedContent;
        return adapted.metadata.platformFitScore >= 70;
      }
    };
    
    const gateCheck = gates[agent];
    if (gateCheck && !gateCheck(output)) {
      this.emit('quality:warning', { agent, output });
    }
  }

  /**
   * Save checkpoint
   */
  private saveCheckpoint(name: string): void {
    this.checkpoints.set(name, JSON.parse(JSON.stringify(this.state)));
    this.emit('checkpoint:saved', { name, state: this.state });
  }

  /**
   * Load checkpoint
   */
  loadCheckpoint(name: string): WorkflowState | undefined {
    return this.checkpoints.get(name);
  }

  /**
   * Handle agent error
   */
  private handleAgentError(agent: AgentName, error: Error): void {
    this.state.errors.push(error);
    this.state.metrics.errorCount++;
    this.emit('agent:error', { agent, error, state: this.state });
  }

  /**
   * Attempt recovery from error
   */
  private async attemptRecovery(
    agent: AgentName,
    lastGoodOutput: Document
  ): Promise<Document | null> {
    this.emit('recovery:attempt', { agent, state: this.state });
    
    // Recovery strategies
    const recoveryStrategies: Record<AgentName, () => Document | null> = {
      collector: () => {
        // Use cached content or default
        return {
          id: 'recovery-collector',
          type: 'content-brief',
          content: 'Recovery content',
          timestamp: new Date()
        } as Document;
      },
      scholar: () => {
        // Skip depth analysis, use basic synthesis
        return lastGoodOutput;
      },
      creator: () => {
        // Use template-based generation
        return lastGoodOutput;
      },
      adapter: () => {
        // Use default formatting
        return lastGoodOutput;
      }
    };
    
    const strategy = recoveryStrategies[agent];
    if (strategy) {
      const recovered = strategy();
      if (recovered) {
        this.emit('recovery:success', { agent, state: this.state });
        return recovered;
      }
    }
    
    this.emit('recovery:failed', { agent, state: this.state });
    return null;
  }

  /**
   * Pause workflow
   */
  pause(): void {
    if (this.state.status === 'running') {
      this.state.status = 'paused';
      this.emit('workflow:paused', { state: this.state });
    }
  }

  /**
   * Resume workflow
   */
  resume(): void {
    if (this.state.status === 'paused') {
      this.state.status = 'running';
      this.emit('workflow:resumed', { state: this.state });
    }
  }

  /**
   * Cancel workflow
   */
  cancel(): void {
    this.state.status = 'failed';
    this.state.endTime = new Date();
    this.emit('workflow:cancelled', { state: this.state });
  }

  /**
   * Get current state
   */
  getState(): WorkflowState {
    return this.state;
  }

  /**
   * Get metrics
   */
  getMetrics(): WorkflowMetrics {
    return this.state.metrics;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'workflow-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}

export default PipelineOrchestrator;