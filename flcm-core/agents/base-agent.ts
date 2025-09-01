/**
 * Base Agent Framework for FLCM
 * Provides the foundation for all FLCM agents
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { EventEmitter } from 'events';
import { 
  EnhancedErrorHandler, 
  getErrorHandler, 
  ErrorCategory, 
  ErrorSeverity,
  EnhancedError
} from '../shared/error-handler';
import { 
  PerformanceMonitor, 
  getPerformanceMonitor, 
  MetricType 
} from '../shared/performance-monitor';

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
  protected errorHandler: EnhancedErrorHandler;
  protected performanceMonitor: PerformanceMonitor;

  constructor(configPath?: string) {
    super();
    this.basePath = path.join(process.cwd(), '.flcm-core');
    this.performanceTracker = new Map();
    this.errorHandler = getErrorHandler();
    this.performanceMonitor = getPerformanceMonitor();
    
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

    // Setup error and performance monitoring
    this.setupMonitoring();
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
      // Enhanced error handling with categorization
      const errorCategory = this.categorizeError(error);
      const errorSeverity = this.assessErrorSeverity(error);
      
      const enhancedError = this.errorHandler.handleError(
        this.config.id,
        error,
        { 
          executionId, 
          input: typeof input === 'object' ? JSON.stringify(input) : String(input),
          processingTime: Date.now() - startTime 
        },
        errorCategory,
        errorSeverity,
        executionId
      );

      // Record error metrics
      this.performanceMonitor.recordErrorRate(
        this.config.id,
        1,
        1,
        { error: error.message, category: errorCategory }
      );
      
      // Update execution record with enhanced error info
      const record = this.state.history.find(r => r.id === executionId);
      if (record) {
        record.status = 'failure';
        record.error = enhancedError.message;
        record.endTime = new Date();
      }
      
      // Emit enhanced error event
      this.emit('executionError', { 
        agentId: this.config.id, 
        executionId, 
        error: enhancedError 
      });
      
      this.updateState('error', enhancedError);
      
      // Attempt recovery if appropriate
      const recoveryResult = await this.attemptErrorRecovery(enhancedError, () => 
        this.processInput(input, context)
      );
      
      if (recoveryResult.success) {
        this.updateState('ready');
        return recoveryResult.result;
      } else {
        throw new AgentError(
          this.config.id,
          'EXECUTION_ERROR',
          enhancedError.message,
          enhancedError.recoveryStrategy !== 'manual_intervention'
        );
      }
      
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

  /**
   * Setup monitoring and error handling
   */
  protected setupMonitoring(): void {
    // Setup performance monitoring alerts
    this.performanceMonitor.onAlert((metric) => {
      console.warn(`Performance alert for ${this.config.id}: ${metric.metricType} = ${metric.value}${metric.unit} (${metric.status})`);
      this.emit('performanceAlert', {
        agentId: this.config.id,
        metric,
        timestamp: new Date()
      });
    });

    // Setup error handling alerts
    this.errorHandler.onAlert((error) => {
      console.error(`Error alert for ${this.config.id}: ${error.message} (${error.severity})`);
      this.emit('errorAlert', {
        agentId: this.config.id,
        error,
        timestamp: new Date()
      });
    });

    // Start performance monitoring
    this.performanceMonitor.startMonitoring(30000); // Every 30 seconds
  }

  /**
   * Categorize error for enhanced handling
   */
  protected categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('request') || message.includes('timeout')) {
      return ErrorCategory.NETWORK;
    } else if (message.includes('validation') || message.includes('invalid')) {
      return ErrorCategory.VALIDATION;
    } else if (message.includes('memory') || message.includes('resource')) {
      return ErrorCategory.RESOURCE;
    } else if (message.includes('config') || message.includes('setting')) {
      return ErrorCategory.CONFIGURATION;
    } else if (message.includes('integration') || message.includes('api')) {
      return ErrorCategory.INTEGRATION;
    } else if (message.includes('input') || message.includes('parameter')) {
      return ErrorCategory.USER_INPUT;
    } else if (message.includes('process') || message.includes('execution')) {
      return ErrorCategory.PROCESSING;
    } else {
      return ErrorCategory.SYSTEM;
    }
  }

  /**
   * Assess error severity
   */
  protected assessErrorSeverity(error: Error): ErrorSeverity {
    const message = error.message.toLowerCase();
    
    if (message.includes('critical') || message.includes('fatal') || message.includes('crash')) {
      return ErrorSeverity.CRITICAL;
    } else if (message.includes('error') || message.includes('failed') || message.includes('exception')) {
      return ErrorSeverity.HIGH;
    } else if (message.includes('warn') || message.includes('deprecated')) {
      return ErrorSeverity.MEDIUM;
    } else {
      return ErrorSeverity.LOW;
    }
  }

  /**
   * Attempt error recovery with enhanced error handling
   */
  protected async attemptErrorRecovery(
    enhancedError: EnhancedError,
    retryFunction: () => Promise<any>
  ): Promise<{ success: boolean; result?: any; error?: Error }> {
    try {
      return await this.errorHandler.attemptRecovery(enhancedError, retryFunction);
    } catch (recoveryError) {
      console.error(`Recovery failed for agent ${this.config.id}:`, recoveryError.message);
      return { success: false, error: recoveryError as Error };
    }
  }

  /**
   * Enhanced performance tracking with metrics recording
   */
  protected trackPerformance<T>(
    operation: string,
    fn: () => Promise<T>,
    context: Record<string, any> = {}
  ): Promise<T> {
    const timer = this.performanceMonitor.startTiming(this.config.id, operation, context);
    
    return fn().finally(() => {
      timer.stop(undefined, [operation]);
    });
  }

  /**
   * Get agent performance summary
   */
  public getPerformanceSummary() {
    return this.performanceMonitor.getAgentSummary(this.config.id);
  }

  /**
   * Get agent error statistics
   */
  public getErrorStatistics() {
    return this.errorHandler.getErrorStatistics();
  }

  /**
   * Generate comprehensive agent health report
   */
  public generateHealthReport() {
    const performance = this.getPerformanceSummary();
    const errors = this.getErrorStatistics();
    
    return {
      agentId: this.config.id,
      timestamp: new Date(),
      status: this.state.status,
      performance,
      errors: {
        totalErrors: errors.totalErrors,
        criticalErrorsLast24h: errors.criticalErrorsLast24h,
        recoverySuccessRate: errors.recoverySuccessRate,
        averageResolutionTime: errors.averageResolutionTime
      },
      uptime: {
        totalExecutions: this.state.executionCount,
        lastActivity: this.state.lastExecution,
        sessionStart: new Date() // Would track actual session start
      },
      recommendations: this.generateHealthRecommendations(performance, errors)
    };
  }

  /**
   * Generate health recommendations based on performance and error data
   */
  protected generateHealthRecommendations(
    performance: any,
    errors: any
  ): string[] {
    const recommendations: string[] = [];

    if (performance && performance.healthScore < 70) {
      recommendations.push('Agent health score is below 70%. Review performance metrics and optimize.');
    }

    if (errors.criticalErrorsLast24h > 5) {
      recommendations.push('High number of critical errors detected. Investigate error patterns.');
    }

    if (performance && performance.trends.executionTime === 'degrading') {
      recommendations.push('Execution time is trending worse. Consider performance optimization.');
    }

    if (errors.recoverySuccessRate < 0.8) {
      recommendations.push('Error recovery success rate is low. Review error handling strategies.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Agent is operating within normal parameters.');
    }

    return recommendations;
  }
}