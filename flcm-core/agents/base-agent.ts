/**
 * Base Agent Framework for FLCM
 * Provides the foundation for all FLCM agents
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
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
export class AgentError extends Error {
  constructor(
    public agentId: string,
    public code: string,
    message: string,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

/**
 * Base Agent Class
 * All FLCM agents extend this class
 */
export abstract class BaseAgent extends EventEmitter {
  protected config: AgentConfig;
  protected persona: AgentPersona;
  protected state: AgentState;
  protected basePath: string;
  protected performanceTracker: Map<string, number>;

  constructor(configPath?: string) {
    super();
    this.basePath = path.join(process.cwd(), '.flcm-core');
    this.performanceTracker = new Map();
    
    // Initialize state
    this.state = {
      status: 'idle',
      executionCount: 0,
      sessionData: new Map(),
      history: []
    };

    // Load configuration if path provided
    if (configPath) {
      this.loadConfiguration(configPath);
    }
  }

  /**
   * Load agent configuration from YAML file
   */
  protected loadConfiguration(configPath: string): void {
    try {
      const fullPath = path.isAbsolute(configPath) 
        ? configPath 
        : path.join(this.basePath, 'agents', configPath);
      
      const configContent = fs.readFileSync(fullPath, 'utf8');
      const parsedConfig = yaml.load(configContent) as any;
      
      this.config = parsedConfig.agent;
      this.persona = parsedConfig.persona;
      
    } catch (error: any) {
      throw new AgentError(
        this.config?.id || 'unknown',
        'CONFIG_LOAD_ERROR',
        `Failed to load configuration: ${error.message}`,
        false
      );
    }
  }

  /**
   * Initialize the agent
   */
  async init(config?: Partial<AgentConfig>): Promise<void> {
    try {
      this.updateState('initializing');
      
      // Merge provided config with loaded config
      if (config) {
        this.config = { ...this.config, ...config };
      }
      
      // Validate configuration
      this.validateConfig();
      
      // Load methodologies
      await this.loadMethodologies();
      
      // Perform agent-specific initialization
      await this.onInit();
      
      this.updateState('ready');
      this.emit('initialized', { agentId: this.config.id });
      
    } catch (error: any) {
      this.updateState('error', error);
      throw new AgentError(
        this.config?.id || 'unknown',
        'INIT_ERROR',
        `Initialization failed: ${error.message}`,
        true
      );
    }
  }

  /**
   * Execute agent's main processing logic
   */
  async execute(input: Document): Promise<Document> {
    const executionId = this.generateExecutionId();
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;
    
    try {
      this.updateState('processing', `Execution ${executionId}`);
      
      // Create execution record
      const record: ExecutionRecord = {
        id: executionId,
        startTime: new Date(),
        input,
        methodologiesUsed: [],
        status: 'success'
      };
      
      // Emit execution start event
      this.emit('executionStart', { agentId: this.config.id, executionId, input });
      
      // Validate input
      this.validateInput(input);
      
      // Execute pre-processing hook
      const preprocessed = await this.beforeExecute(input);
      
      // Main execution logic (implemented by concrete agents)
      const output = await this.onExecute(preprocessed);
      
      // Execute post-processing hook
      const postprocessed = await this.afterExecute(output);
      
      // Update execution record
      record.output = postprocessed;
      record.endTime = new Date();
      record.methodologiesUsed = Array.from(this.performanceTracker.keys());
      
      // Calculate metrics
      record.metrics = {
        executionTime: Date.now() - startTime,
        memoryUsed: process.memoryUsage().heapUsed - startMemory,
        methodologyInvocations: new Map(this.performanceTracker),
        documentsProcessed: 1
      };
      
      // Add to history
      this.state.history.push(record);
      this.state.executionCount++;
      this.state.lastExecution = new Date();
      
      // Emit execution complete event
      this.emit('executionComplete', { 
        agentId: this.config.id, 
        executionId, 
        output: postprocessed,
        metrics: record.metrics 
      });
      
      this.updateState('ready');
      return postprocessed;
      
    } catch (error: any) {
      // Handle execution error
      const agentError = error instanceof AgentError 
        ? error 
        : new AgentError(
            this.config.id,
            'EXECUTION_ERROR',
            error.message,
            true
          );
      
      // Update execution record with error
      const record = this.state.history.find(r => r.id === executionId);
      if (record) {
        record.status = 'failure';
        record.error = agentError.message;
        record.endTime = new Date();
      }
      
      // Emit error event
      this.emit('executionError', { 
        agentId: this.config.id, 
        executionId, 
        error: agentError 
      });
      
      this.updateState('error', agentError);
      throw agentError;
      
    } finally {
      // Clear performance tracker for next execution
      this.performanceTracker.clear();
    }
  }

  /**
   * Cleanup agent resources
   */
  async cleanup(): Promise<void> {
    try {
      // Perform agent-specific cleanup
      await this.onCleanup();
      
      // Save state if needed
      await this.saveState();
      
      // Clear session data
      this.state.sessionData.clear();
      
      // Emit cleanup event
      this.emit('cleanup', { agentId: this.config.id });
      
      this.updateState('terminated');
      
    } catch (error: any) {
      throw new AgentError(
        this.config.id,
        'CLEANUP_ERROR',
        `Cleanup failed: ${error.message}`,
        true
      );
    }
  }

  /**
   * Send message to another agent
   */
  send(message: Omit<AgentMessage, 'from' | 'timestamp'>): void {
    const fullMessage: AgentMessage = {
      ...message,
      from: this.config.id,
      timestamp: new Date()
    };
    
    this.emit('messageSent', fullMessage);
  }

  /**
   * Receive message from another agent
   */
  receive(message: AgentMessage): void {
    this.emit('messageReceived', message);
    
    // Handle message based on type
    switch (message.type) {
      case 'request':
        this.handleRequest(message);
        break;
      case 'response':
        this.handleResponse(message);
        break;
      case 'event':
        this.handleEvent(message);
        break;
      case 'error':
        this.handleError(message);
        break;
    }
  }

  /**
   * Get current agent state
   */
  getState(): AgentState {
    return { ...this.state };
  }

  /**
   * Execute a methodology
   */
  protected async executeMethodology(name: string, input: any): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Track methodology usage
      const count = this.performanceTracker.get(name) || 0;
      this.performanceTracker.set(name, count + 1);
      
      // Load and execute methodology
      const methodology = await this.loadMethodology(name);
      const result = await methodology.execute(input);
      
      // Emit methodology execution event
      this.emit('methodologyExecuted', {
        agentId: this.config.id,
        methodology: name,
        executionTime: Date.now() - startTime
      });
      
      return result;
      
    } catch (error: any) {
      throw new AgentError(
        this.config.id,
        'METHODOLOGY_ERROR',
        `Methodology '${name}' failed: ${error.message}`,
        true
      );
    }
  }

  // Abstract methods to be implemented by concrete agents
  protected abstract onInit(): Promise<void>;
  protected abstract onExecute(input: Document): Promise<Document>;
  protected abstract onCleanup(): Promise<void>;
  protected abstract validateInput(input: Document): void;

  // Hook methods (can be overridden)
  protected async beforeExecute(input: Document): Promise<Document> {
    return input;
  }

  protected async afterExecute(output: Document): Promise<Document> {
    return output;
  }

  // Protected helper methods
  protected updateState(status: AgentState['status'], currentTask?: string | Error): void {
    this.state.status = status;
    
    if (typeof currentTask === 'string') {
      this.state.currentTask = currentTask;
    } else if (currentTask instanceof Error) {
      this.state.error = currentTask;
    }
    
    this.emit('stateChanged', { agentId: this.config.id, state: this.state });
  }

  protected validateConfig(): void {
    if (!this.config) {
      throw new Error('Agent configuration not loaded');
    }
    
    const required = ['id', 'name', 'title'];
    for (const field of required) {
      if (!this.config[field]) {
        throw new Error(`Required configuration field missing: ${field}`);
      }
    }
  }

  protected async loadMethodologies(): Promise<void> {
    if (!this.config.methodologies) return;
    
    // Methodology loading will be implemented in Story 2.5
    // For now, just validate they exist
    for (const methodology of this.config.methodologies) {
      const methodPath = path.join(
        this.basePath, 
        'methodologies', 
        this.config.id,
        `${methodology}.yaml`
      );
      
      if (!fs.existsSync(methodPath)) {
        console.warn(`Methodology not found: ${methodology}`);
      }
    }
  }

  protected async loadMethodology(name: string): Promise<any> {
    // Placeholder - will be implemented with methodology system
    return {
      execute: async (input: any) => input
    };
  }

  protected generateExecutionId(): string {
    return `${this.config.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  protected async saveState(): Promise<void> {
    // State persistence will be implemented if needed
    const statePath = path.join(
      this.basePath,
      'data',
      'agent-states',
      `${this.config.id}.json`
    );
    
    // Ensure directory exists
    const dir = path.dirname(statePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Save state
    const stateToSave = {
      ...this.state,
      sessionData: Array.from(this.state.sessionData.entries())
    };
    
    fs.writeFileSync(statePath, JSON.stringify(stateToSave, null, 2));
  }

  // Message handling methods
  protected handleRequest(message: AgentMessage): void {
    // Override in concrete agents
  }

  protected handleResponse(message: AgentMessage): void {
    // Override in concrete agents
  }

  protected handleEvent(message: AgentMessage): void {
    // Override in concrete agents
  }

  protected handleError(message: AgentMessage): void {
    // Override in concrete agents
  }
}