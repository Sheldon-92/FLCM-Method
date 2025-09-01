"use strict";
/**
 * FLCM Main Agent
 * Orchestrates the 3-layer agent system (Scholar → Creator → Publisher)
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
exports.FLCMAgent = void 0;
const base_agent_1 = require("./base-agent");
const types_1 = require("./types");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const yaml = __importStar(require("js-yaml"));
const winston = __importStar(require("winston"));
class FLCMAgent extends base_agent_1.BaseAgent {
    constructor(configPath) {
        super(configPath);
        this.agents = new Map();
        this.circuitBreakers = new Map();
        this.initializeLogger();
        this.loadFLCMConfig();
        this.initializeRetryConfig();
        this.initializeCircuitBreakers();
    }
    /**
     * Initialize Winston logger
     */
    initializeLogger() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
                return `${timestamp} [FLCM-MAIN] ${level.toUpperCase()}: ${message} ${stack ? `\n${stack}` : ''} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
            })),
            transports: [
                new winston.transports.Console({
                    format: winston.format.colorize({ all: true })
                }),
                new winston.transports.File({
                    filename: path.join(this.basePath, 'logs', 'flcm-main.log'),
                    maxsize: 5242880,
                    maxFiles: 5
                })
            ],
        });
    }
    /**
     * Load FLCM configuration
     */
    loadFLCMConfig() {
        try {
            const configPath = path.join(this.basePath, 'core-config.yaml');
            if (!fs.existsSync(configPath)) {
                // Create default config if it doesn't exist
                this.createDefaultConfig(configPath);
            }
            const configContent = fs.readFileSync(configPath, 'utf8');
            const parsedConfig = yaml.load(configContent);
            this.flcmConfig = parsedConfig.flcm || this.getDefaultFLCMConfig();
            this.logger.setLevel(this.flcmConfig.logLevel);
            this.logger.info('FLCM configuration loaded', { config: this.flcmConfig });
        }
        catch (error) {
            this.logger.error('Failed to load FLCM configuration', { error: error.message });
            this.flcmConfig = this.getDefaultFLCMConfig();
        }
    }
    /**
     * Create default configuration file
     */
    createDefaultConfig(configPath) {
        const defaultConfig = {
            flcm: this.getDefaultFLCMConfig()
        };
        // Ensure directory exists
        const dir = path.dirname(configPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(configPath, yaml.dump(defaultConfig));
        this.logger.info('Created default FLCM configuration', { path: configPath });
    }
    /**
     * Get default FLCM configuration
     */
    getDefaultFLCMConfig() {
        return {
            version: "2.0",
            logLevel: "info",
            timeout: 30000,
            retryAttempts: 3,
            agents: {
                scholar: {
                    enabled: true,
                    priority: 1,
                    timeout: 5000,
                    retryAttempts: 3
                },
                creator: {
                    enabled: true,
                    priority: 2,
                    timeout: 10000,
                    retryAttempts: 3
                },
                publisher: {
                    enabled: true,
                    priority: 3,
                    timeout: 15000,
                    retryAttempts: 2
                }
            }
        };
    }
    /**
     * Initialize retry configuration
     */
    initializeRetryConfig() {
        this.retryConfig = {
            attempts: this.flcmConfig.retryAttempts,
            backoffMs: [1000, 2000, 4000],
            retryableErrors: [types_1.ErrorType.NETWORK_ERROR, types_1.ErrorType.TIMEOUT, types_1.ErrorType.RATE_LIMIT]
        };
    }
    /**
     * Initialize circuit breakers for all agents
     */
    initializeCircuitBreakers() {
        this.circuitBreakerConfig = {
            failureThreshold: 5,
            cooldownMs: 30000,
            testRequestTimeout: 5000
        };
        // Initialize circuit breakers for each agent
        ['scholar', 'creator', 'publisher'].forEach(agentId => {
            this.circuitBreakers.set(agentId, {
                state: types_1.CircuitState.CLOSED,
                failures: 0
            });
        });
    }
    /**
     * Register an agent
     */
    registerAgent(agent) {
        this.agents.set(agent.config.id, agent);
        this.logger.info('Agent registered', { agentId: agent.config.id });
    }
    /**
     * Route request to appropriate agent
     */
    async route(request) {
        const startTime = Date.now();
        const agentId = this.determineTargetAgent(request);
        this.logger.info('Routing request', {
            requestId: request.id,
            type: request.type,
            targetAgent: agentId
        });
        try {
            // Check circuit breaker
            if (this.isCircuitOpen(agentId)) {
                throw new Error(`Circuit breaker open for agent ${agentId}`);
            }
            // Get target agent
            const agent = this.agents.get(agentId);
            if (!agent) {
                throw new Error(`Agent not found: ${agentId}`);
            }
            // Process request with retry logic
            const response = await this.processWithRetry(agent, request);
            // Reset circuit breaker on success
            this.resetCircuitBreaker(agentId);
            this.logger.info('Request processed successfully', {
                requestId: request.id,
                agentId,
                processingTime: Date.now() - startTime
            });
            return response;
        }
        catch (error) {
            // Handle circuit breaker
            this.recordFailure(agentId);
            this.logger.error('Request processing failed', {
                requestId: request.id,
                agentId,
                error: error.message,
                processingTime: Date.now() - startTime
            });
            // Try fallback strategy
            const fallbackResponse = await this.handleFallback(request, agentId, error);
            if (fallbackResponse) {
                return fallbackResponse;
            }
            throw error;
        }
    }
    /**
     * Determine target agent based on request type
     */
    determineTargetAgent(request) {
        // Simple routing logic based on request type
        if (request.type.startsWith('analyze') || request.type.startsWith('scholar')) {
            return 'scholar';
        }
        else if (request.type.startsWith('create') || request.type.startsWith('generate')) {
            return 'creator';
        }
        else if (request.type.startsWith('publish') || request.type.startsWith('adapt')) {
            return 'publisher';
        }
        // Default to scholar for unknown types
        return 'scholar';
    }
    /**
     * Process request with retry logic
     */
    async processWithRetry(agent, request) {
        let lastError;
        for (let attempt = 1; attempt <= this.retryConfig.attempts; attempt++) {
            try {
                this.logger.debug('Processing attempt', {
                    requestId: request.id,
                    agentId: agent.config.id,
                    attempt
                });
                return await agent.process(request);
            }
            catch (error) {
                lastError = error;
                // Check if error is retryable
                const isRetryable = this.isRetryableError(error);
                if (!isRetryable || attempt === this.retryConfig.attempts) {
                    throw error;
                }
                // Wait before retry
                const delay = this.retryConfig.backoffMs[Math.min(attempt - 1, this.retryConfig.backoffMs.length - 1)];
                this.logger.warn('Retrying after delay', {
                    requestId: request.id,
                    agentId: agent.config.id,
                    attempt,
                    delay,
                    error: error.message
                });
                await this.sleep(delay);
            }
        }
        throw lastError;
    }
    /**
     * Check if error is retryable
     */
    isRetryableError(error) {
        // Simple error classification - could be enhanced
        const message = error.message.toLowerCase();
        return this.retryConfig.retryableErrors.some(errorType => message.includes(errorType.toLowerCase()));
    }
    /**
     * Handle fallback strategies
     */
    async handleFallback(request, failedAgentId, error) {
        this.logger.info('Attempting fallback strategy', {
            requestId: request.id,
            failedAgent: failedAgentId
        });
        try {
            switch (failedAgentId) {
                case 'scholar':
                    return await this.generateBasicInsights(request);
                case 'creator':
                    return await this.useContentTemplate(request);
                case 'publisher':
                    return await this.queueForRetry(request);
                default:
                    return null;
            }
        }
        catch (fallbackError) {
            this.logger.error('Fallback strategy failed', {
                requestId: request.id,
                failedAgent: failedAgentId,
                fallbackError: fallbackError.message
            });
            return null;
        }
    }
    /**
     * Generate basic insights as fallback
     */
    async generateBasicInsights(request) {
        this.logger.warn('Using fallback: basic insights generation', { requestId: request.id });
        return {
            id: request.id,
            success: true,
            data: {
                type: 'fallback_insights',
                content: 'Basic analysis generated due to Scholar agent failure',
                fallback: true
            },
            timestamp: new Date(),
            processingTime: 100
        };
    }
    /**
     * Use content template as fallback
     */
    async useContentTemplate(request) {
        this.logger.warn('Using fallback: content template', { requestId: request.id });
        return {
            id: request.id,
            success: true,
            data: {
                type: 'fallback_content',
                content: 'Template-based content generated due to Creator agent failure',
                fallback: true
            },
            timestamp: new Date(),
            processingTime: 50
        };
    }
    /**
     * Queue for retry as fallback
     */
    async queueForRetry(request) {
        this.logger.warn('Using fallback: queue for retry', { requestId: request.id });
        // In a real implementation, this would add to a retry queue
        return {
            id: request.id,
            success: false,
            error: new Error('Queued for retry - Publisher agent unavailable'),
            timestamp: new Date(),
            processingTime: 10
        };
    }
    /**
     * Circuit breaker methods
     */
    isCircuitOpen(agentId) {
        const breaker = this.circuitBreakers.get(agentId);
        if (!breaker)
            return false;
        if (breaker.state === types_1.CircuitState.OPEN) {
            // Check if cooldown period has passed
            if (breaker.lastFailure &&
                Date.now() - breaker.lastFailure.getTime() > this.circuitBreakerConfig.cooldownMs) {
                breaker.state = types_1.CircuitState.HALF_OPEN;
                this.logger.info('Circuit breaker half-open', { agentId });
                return false;
            }
            return true;
        }
        return false;
    }
    recordFailure(agentId) {
        const breaker = this.circuitBreakers.get(agentId);
        if (!breaker)
            return;
        breaker.failures++;
        breaker.lastFailure = new Date();
        if (breaker.failures >= this.circuitBreakerConfig.failureThreshold) {
            breaker.state = types_1.CircuitState.OPEN;
            this.logger.warn('Circuit breaker opened', { agentId, failures: breaker.failures });
        }
    }
    resetCircuitBreaker(agentId) {
        const breaker = this.circuitBreakers.get(agentId);
        if (!breaker)
            return;
        breaker.failures = 0;
        breaker.state = types_1.CircuitState.CLOSED;
        breaker.lastFailure = undefined;
    }
    /**
     * Health check for all agents
     */
    async healthCheck() {
        const health = {};
        for (const [agentId, agent] of this.agents) {
            try {
                health[agentId] = agent.isHealthy();
            }
            catch (error) {
                health[agentId] = false;
                this.logger.error('Health check failed', { agentId, error: error.message });
            }
        }
        return health;
    }
    /**
     * Get metrics for all agents
     */
    getMetrics() {
        const metrics = {
            main: {
                uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0,
                registeredAgents: this.agents.size,
                circuitBreakers: Object.fromEntries(Array.from(this.circuitBreakers.entries()).map(([id, breaker]) => [
                    id,
                    { state: breaker.state, failures: breaker.failures }
                ]))
            },
            agents: {}
        };
        for (const [agentId, agent] of this.agents) {
            metrics.agents[agentId] = agent.getMetrics();
        }
        return metrics;
    }
    // BaseAgent abstract method implementations
    async onInit() {
        this.logger.info('FLCM Main Agent initializing');
        // Create necessary directories
        const dirs = ['logs', 'data', 'data/agent-states'];
        dirs.forEach(dir => {
            const fullPath = path.join(this.basePath, dir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
            }
        });
        this.logger.info('FLCM Main Agent initialized successfully');
    }
    async onExecute(input) {
        // For the main agent, execution means orchestrating the full pipeline
        this.logger.info('Executing FLCM pipeline', { inputType: input.type });
        // This would implement the Scholar → Creator → Publisher flow
        // For now, return the input as a placeholder
        return {
            ...input,
            metadata: {
                ...input.metadata,
                processedBy: 'flcm-main',
                processedAt: new Date().toISOString()
            }
        };
    }
    async onCleanup() {
        this.logger.info('FLCM Main Agent cleaning up');
        // Shutdown all registered agents
        for (const [agentId, agent] of this.agents) {
            try {
                await agent.cleanup();
                this.logger.info('Agent cleaned up', { agentId });
            }
            catch (error) {
                this.logger.error('Agent cleanup failed', { agentId, error: error.message });
            }
        }
        // Close logger transports
        this.logger.end();
    }
    validateInput(input) {
        if (!input.id) {
            throw new Error('Document ID is required');
        }
        if (!input.type) {
            throw new Error('Document type is required');
        }
        if (!input.content) {
            throw new Error('Document content is required');
        }
    }
    // Utility methods
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.FLCMAgent = FLCMAgent;
//# sourceMappingURL=flcm-main.js.map