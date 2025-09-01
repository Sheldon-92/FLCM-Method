/**
 * Agent Manager for FLCM
 * Coordinates agent lifecycle and communication
 */

import { EventEmitter } from 'events';
import { BaseAgent, AgentMessage, AgentState, Document } from './base-agent';
import { CollectorAgent } from './implementations/collector-agent';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Agent registry entry
 */
interface AgentRegistration {
  id: string;
  instance: BaseAgent;
  configPath: string;
  status: AgentState['status'];
}

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
export class AgentManager extends EventEmitter {
  private agents: Map<string, AgentRegistration>;
  private messageQueue: AgentMessage[];
  private config: ManagerConfig;
  private monitoringTimer?: NodeJS.Timer;

  constructor(config?: Partial<ManagerConfig>) {
    super();
    
    this.agents = new Map();
    this.messageQueue = [];
    
    // Default configuration
    this.config = {
      maxConcurrentAgents: 4,
      messageQueueSize: 100,
      enableMonitoring: true,
      monitoringInterval: 5000,
      ...config
    };
  }

  /**
   * Initialize the agent manager
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing FLCM Agent Manager');
    
    // Load agent configurations
    await this.loadAgentConfigurations();
    
    // Start monitoring if enabled
    if (this.config.enableMonitoring) {
      this.startMonitoring();
    }
    
    // Set up message routing
    this.setupMessageRouting();
    
    console.log(`✅ Agent Manager initialized with ${this.agents.size} agents`);
  }

  /**
   * Register an agent
   */
  async registerAgent(id: string, AgentClass: typeof BaseAgent, configPath?: string): Promise<void> {
    if (this.agents.has(id)) {
      throw new Error(`Agent '${id}' is already registered`);
    }
    
    // Check concurrent agent limit
    const activeAgents = Array.from(this.agents.values())
      .filter(a => a.status !== 'terminated').length;
    
    if (activeAgents >= this.config.maxConcurrentAgents) {
      throw new Error(`Maximum concurrent agents (${this.config.maxConcurrentAgents}) reached`);
    }
    
    try {
      // Create agent instance
      const agent = new (AgentClass as any)(configPath);
      
      // Register agent
      const registration: AgentRegistration = {
        id,
        instance: agent,
        configPath: configPath || `${id}.yaml`,
        status: 'idle'
      };
      
      this.agents.set(id, registration);
      
      // Set up agent event listeners
      this.setupAgentListeners(agent, id);
      
      // Initialize agent
      await agent.init();
      
      console.log(`✅ Agent '${id}' registered successfully`);
      this.emit('agentRegistered', { agentId: id });
      
    } catch (error: any) {
      console.error(`❌ Failed to register agent '${id}':`, error.message);
      throw error;
    }
  }

  /**
   * Unregister an agent
   */
  async unregisterAgent(id: string): Promise<void> {
    const registration = this.agents.get(id);
    if (!registration) {
      throw new Error(`Agent '${id}' not found`);
    }
    
    try {
      // Cleanup agent
      await registration.instance.cleanup();
      
      // Remove from registry
      this.agents.delete(id);
      
      console.log(`✅ Agent '${id}' unregistered`);
      this.emit('agentUnregistered', { agentId: id });
      
    } catch (error: any) {
      console.error(`❌ Failed to unregister agent '${id}':`, error.message);
      throw error;
    }
  }

  /**
   * Get an agent instance
   */
  getAgent(id: string): BaseAgent | undefined {
    return this.agents.get(id)?.instance;
  }

  /**
   * Execute an agent
   */
  async executeAgent(id: string, input: Document): Promise<Document> {
    const agent = this.getAgent(id);
    if (!agent) {
      throw new Error(`Agent '${id}' not found`);
    }
    
    try {
      console.log(`🔄 Executing agent '${id}'`);
      const output = await agent.execute(input);
      console.log(`✅ Agent '${id}' execution complete`);
      return output;
      
    } catch (error: any) {
      console.error(`❌ Agent '${id}' execution failed:`, error.message);
      
      // Attempt recovery
      const recovered = await this.attemptRecovery(id, error);
      if (recovered) {
        // Retry execution
        return this.executeAgent(id, input);
      }
      
      throw error;
    }
  }

  /**
   * Send message between agents
   */
  sendMessage(message: Omit<AgentMessage, 'timestamp'>): void {
    const fullMessage: AgentMessage = {
      ...message,
      timestamp: new Date()
    };
    
    // Add to message queue
    this.messageQueue.push(fullMessage);
    if (this.messageQueue.length > this.config.messageQueueSize) {
      this.messageQueue.shift(); // Remove oldest message
    }
    
    // Route message
    if (message.to === 'broadcast') {
      // Broadcast to all agents
      this.agents.forEach(registration => {
        if (registration.id !== message.from) {
          registration.instance.receive(fullMessage);
        }
      });
    } else {
      // Send to specific agent
      const targetAgent = this.getAgent(message.to);
      if (targetAgent) {
        targetAgent.receive(fullMessage);
      } else {
        console.warn(`Target agent '${message.to}' not found for message`);
      }
    }
    
    this.emit('messageSent', fullMessage);
  }

  /**
   * Get agent states
   */
  getAgentStates(): Map<string, AgentState> {
    const states = new Map<string, AgentState>();
    
    this.agents.forEach((registration, id) => {
      states.set(id, registration.instance.getState());
    });
    
    return states;
  }

  /**
   * Get system health
   */
  getSystemHealth(): any {
    const states = this.getAgentStates();
    const health = {
      totalAgents: this.agents.size,
      activeAgents: 0,
      idleAgents: 0,
      errorAgents: 0,
      messageQueueSize: this.messageQueue.length,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };
    
    states.forEach(state => {
      switch (state.status) {
        case 'processing':
          health.activeAgents++;
          break;
        case 'idle':
        case 'ready':
          health.idleAgents++;
          break;
        case 'error':
          health.errorAgents++;
          break;
      }
    });
    
    return health;
  }

  /**
   * Shutdown agent manager
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Agent Manager');
    
    // Stop monitoring
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer as NodeJS.Timeout);
    }
    
    // Cleanup all agents
    const cleanupPromises = Array.from(this.agents.values()).map(
      registration => registration.instance.cleanup()
    );
    
    await Promise.all(cleanupPromises);
    
    // Clear registrations
    this.agents.clear();
    this.messageQueue = [];
    
    console.log('✅ Agent Manager shutdown complete');
    this.emit('shutdown');
  }

  // Private methods

  private async loadAgentConfigurations(): Promise<void> {
    const agentsPath = path.join(process.cwd(), '.flcm-core', 'agents');
    
    // Define agent mappings
    const agentMappings = [
      { id: 'collector', class: CollectorAgent, config: 'collector.yaml' },
      // Add other agents as they are implemented
      // { id: 'scholar', class: ScholarAgent, config: 'scholar.yaml' },
      // { id: 'creator', class: CreatorAgent, config: 'creator.yaml' },
      // { id: 'adapter', class: AdapterAgent, config: 'adapter.yaml' },
    ];
    
    // Register available agents
    for (const mapping of agentMappings) {
      const configPath = path.join(agentsPath, mapping.config);
      if (fs.existsSync(configPath)) {
        try {
          await this.registerAgent(mapping.id, mapping.class as any, mapping.config);
        } catch (error: any) {
          console.warn(`Failed to load agent '${mapping.id}':`, error.message);
        }
      }
    }
  }

  private setupAgentListeners(agent: BaseAgent, id: string): void {
    // Forward agent events
    agent.on('stateChanged', (data) => {
      const registration = this.agents.get(id);
      if (registration) {
        registration.status = data.state.status;
      }
      this.emit('agentStateChanged', { agentId: id, ...data });
    });
    
    agent.on('messageSent', (message) => {
      this.sendMessage(message);
    });
    
    agent.on('executionStart', (data) => {
      this.emit('agentExecutionStart', { agentId: id, ...data });
    });
    
    agent.on('executionComplete', (data) => {
      this.emit('agentExecutionComplete', { agentId: id, ...data });
    });
    
    agent.on('executionError', (data) => {
      this.emit('agentExecutionError', { agentId: id, ...data });
    });
  }

  private setupMessageRouting(): void {
    // Set up global message routing
    this.on('messageSent', (message) => {
      // Log messages if monitoring enabled
      if (this.config.enableMonitoring) {
        console.log(`📨 Message: ${message.from} → ${message.to} (${message.type})`);
      }
    });
  }

  private startMonitoring(): void {
    this.monitoringTimer = setInterval(() => {
      const health = this.getSystemHealth();
      this.emit('healthCheck', health);
      
      // Log health if there are issues
      if (health.errorAgents > 0) {
        console.warn(`⚠️  ${health.errorAgents} agent(s) in error state`);
      }
      
    }, this.config.monitoringInterval);
  }

  private async attemptRecovery(agentId: string, error: Error): Promise<boolean> {
    console.log(`🔧 Attempting recovery for agent '${agentId}'`);
    
    const registration = this.agents.get(agentId);
    if (!registration) {
      return false;
    }
    
    try {
      // Try to reinitialize agent
      await registration.instance.cleanup();
      await registration.instance.init();
      
      console.log(`✅ Agent '${agentId}' recovered successfully`);
      return true;
      
    } catch (recoveryError: any) {
      console.error(`❌ Recovery failed for agent '${agentId}':`, recoveryError.message);
      return false;
    }
  }
}

// Export singleton instance
export const agentManager = new AgentManager();