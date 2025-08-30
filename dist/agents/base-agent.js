"use strict";
/**
 * Base Agent Framework for FLCM
 * Provides the foundation for all FLCM agents
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
exports.BaseAgent = exports.AgentError = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const yaml = __importStar(require("js-yaml"));
const events_1 = require("events");
/**
 * Agent error class
 */
class AgentError extends Error {
    constructor(agentId, code, message, recoverable = true) {
        super(message);
        this.agentId = agentId;
        this.code = code;
        this.recoverable = recoverable;
        this.name = 'AgentError';
    }
}
exports.AgentError = AgentError;
/**
 * Base Agent Class
 * All FLCM agents extend this class
 */
class BaseAgent extends events_1.EventEmitter {
    constructor(configPath) {
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
    loadConfiguration(configPath) {
        try {
            const fullPath = path.isAbsolute(configPath)
                ? configPath
                : path.join(this.basePath, 'agents', configPath);
            const configContent = fs.readFileSync(fullPath, 'utf8');
            const parsedConfig = yaml.load(configContent);
            this.config = parsedConfig.agent;
            this.persona = parsedConfig.persona;
        }
        catch (error) {
            throw new AgentError(this.config?.id || 'unknown', 'CONFIG_LOAD_ERROR', `Failed to load configuration: ${error.message}`, false);
        }
    }
    /**
     * Initialize the agent
     */
    async init(config) {
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
        }
        catch (error) {
            this.updateState('error', error);
            throw new AgentError(this.config?.id || 'unknown', 'INIT_ERROR', `Initialization failed: ${error.message}`, true);
        }
    }
    /**
     * Execute agent's main processing logic
     */
    async execute(input) {
        const executionId = this.generateExecutionId();
        const startTime = Date.now();
        const startMemory = process.memoryUsage().heapUsed;
        try {
            this.updateState('processing', `Execution ${executionId}`);
            // Create execution record
            const record = {
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
        }
        catch (error) {
            // Handle execution error
            const agentError = error instanceof AgentError
                ? error
                : new AgentError(this.config.id, 'EXECUTION_ERROR', error.message, true);
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
        }
        finally {
            // Clear performance tracker for next execution
            this.performanceTracker.clear();
        }
    }
    /**
     * Cleanup agent resources
     */
    async cleanup() {
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
        }
        catch (error) {
            throw new AgentError(this.config.id, 'CLEANUP_ERROR', `Cleanup failed: ${error.message}`, true);
        }
    }
    /**
     * Send message to another agent
     */
    send(message) {
        const fullMessage = {
            ...message,
            from: this.config.id,
            timestamp: new Date()
        };
        this.emit('messageSent', fullMessage);
    }
    /**
     * Receive message from another agent
     */
    receive(message) {
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
    getState() {
        return { ...this.state };
    }
    /**
     * Execute a methodology
     */
    async executeMethodology(name, input) {
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
        }
        catch (error) {
            throw new AgentError(this.config.id, 'METHODOLOGY_ERROR', `Methodology '${name}' failed: ${error.message}`, true);
        }
    }
    // Hook methods (can be overridden)
    async beforeExecute(input) {
        return input;
    }
    async afterExecute(output) {
        return output;
    }
    // Protected helper methods
    updateState(status, currentTask) {
        this.state.status = status;
        if (typeof currentTask === 'string') {
            this.state.currentTask = currentTask;
        }
        else if (currentTask instanceof Error) {
            this.state.error = currentTask;
        }
        this.emit('stateChanged', { agentId: this.config.id, state: this.state });
    }
    validateConfig() {
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
    async loadMethodologies() {
        if (!this.config.methodologies)
            return;
        // Methodology loading will be implemented in Story 2.5
        // For now, just validate they exist
        for (const methodology of this.config.methodologies) {
            const methodPath = path.join(this.basePath, 'methodologies', this.config.id, `${methodology}.yaml`);
            if (!fs.existsSync(methodPath)) {
                console.warn(`Methodology not found: ${methodology}`);
            }
        }
    }
    async loadMethodology(name) {
        // Placeholder - will be implemented with methodology system
        return {
            execute: async (input) => input
        };
    }
    generateExecutionId() {
        return `${this.config.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    async saveState() {
        // State persistence will be implemented if needed
        const statePath = path.join(this.basePath, 'data', 'agent-states', `${this.config.id}.json`);
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
    handleRequest(message) {
        // Override in concrete agents
    }
    handleResponse(message) {
        // Override in concrete agents
    }
    handleEvent(message) {
        // Override in concrete agents
    }
    handleError(message) {
        // Override in concrete agents
    }
}
exports.BaseAgent = BaseAgent;
//# sourceMappingURL=base-agent.js.map