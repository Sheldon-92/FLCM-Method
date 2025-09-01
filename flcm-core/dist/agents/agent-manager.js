"use strict";
/**
 * Agent Manager for FLCM
 * Coordinates agent lifecycle and communication
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentManager = exports.AgentManager = void 0;
const events_1 = require("events");
const collector_agent_1 = require("./implementations/collector-agent");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
/**
 * Agent Manager Class
 * Manages all agents in the FLCM system
 */
class AgentManager extends events_1.EventEmitter {
    constructor(config) {
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
    async initialize() {
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
    async registerAgent(id, AgentClass, configPath) {
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
            const agent = new AgentClass(configPath);
            // Register agent
            const registration = {
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
        }
        catch (error) {
            console.error(`❌ Failed to register agent '${id}':`, error.message);
            throw error;
        }
    }
    /**
     * Unregister an agent
     */
    async unregisterAgent(id) {
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
        }
        catch (error) {
            console.error(`❌ Failed to unregister agent '${id}':`, error.message);
            throw error;
        }
    }
    /**
     * Get an agent instance
     */
    getAgent(id) {
        return this.agents.get(id)?.instance;
    }
    /**
     * Execute an agent
     */
    async executeAgent(id, input) {
        const agent = this.getAgent(id);
        if (!agent) {
            throw new Error(`Agent '${id}' not found`);
        }
        try {
            console.log(`🔄 Executing agent '${id}'`);
            const output = await agent.execute(input);
            console.log(`✅ Agent '${id}' execution complete`);
            return output;
        }
        catch (error) {
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
    sendMessage(message) {
        const fullMessage = {
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
        }
        else {
            // Send to specific agent
            const targetAgent = this.getAgent(message.to);
            if (targetAgent) {
                targetAgent.receive(fullMessage);
            }
            else {
                console.warn(`Target agent '${message.to}' not found for message`);
            }
        }
        this.emit('messageSent', fullMessage);
    }
    /**
     * Get agent states
     */
    getAgentStates() {
        const states = new Map();
        this.agents.forEach((registration, id) => {
            states.set(id, registration.instance.getState());
        });
        return states;
    }
    /**
     * Get system health
     */
    getSystemHealth() {
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
    async shutdown() {
        console.log('🛑 Shutting down Agent Manager');
        // Stop monitoring
        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
        }
        // Cleanup all agents
        const cleanupPromises = Array.from(this.agents.values()).map(registration => registration.instance.cleanup());
        await Promise.all(cleanupPromises);
        // Clear registrations
        this.agents.clear();
        this.messageQueue = [];
        console.log('✅ Agent Manager shutdown complete');
        this.emit('shutdown');
    }
    // Private methods
    async loadAgentConfigurations() {
        const agentsPath = path.join(process.cwd(), '.flcm-core', 'agents');
        // Define agent mappings
        const agentMappings = [
            { id: 'collector', class: collector_agent_1.CollectorAgent, config: 'collector.yaml' },
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
                    await this.registerAgent(mapping.id, mapping.class, mapping.config);
                }
                catch (error) {
                    console.warn(`Failed to load agent '${mapping.id}':`, error.message);
                }
            }
        }
    }
    setupAgentListeners(agent, id) {
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
    setupMessageRouting() {
        // Set up global message routing
        this.on('messageSent', (message) => {
            // Log messages if monitoring enabled
            if (this.config.enableMonitoring) {
                console.log(`📨 Message: ${message.from} → ${message.to} (${message.type})`);
            }
        });
    }
    startMonitoring() {
        this.monitoringTimer = setInterval(() => {
            const health = this.getSystemHealth();
            this.emit('healthCheck', health);
            // Log health if there are issues
            if (health.errorAgents > 0) {
                console.warn(`⚠️  ${health.errorAgents} agent(s) in error state`);
            }
        }, this.config.monitoringInterval);
    }
    async attemptRecovery(agentId, error) {
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
        }
        catch (recoveryError) {
            console.error(`❌ Recovery failed for agent '${agentId}':`, recoveryError.message);
            return false;
        }
    }
}
exports.AgentManager = AgentManager;
// Export singleton instance
exports.agentManager = new AgentManager();
//# sourceMappingURL=agent-manager.js.map