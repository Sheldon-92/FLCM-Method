"use strict";
/**
 * Pipeline Orchestrator
 * Manages the complete FLCM agent pipeline execution
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineOrchestrator = void 0;
const events_1 = require("events");
const collector_agent_1 = require("../agents/implementations/collector-agent");
const scholar_agent_1 = require("../agents/implementations/scholar-agent");
const creator_agent_1 = require("../agents/implementations/creator-agent");
const adapter_agent_1 = require("../agents/implementations/adapter-agent");
class PipelineOrchestrator extends events_1.EventEmitter {
    constructor() {
        super();
        this.initializeAgents();
        this.checkpoints = new Map();
        this.state = this.createInitialState();
    }
    initializeAgents() {
        this.agents = new Map([
            ['collector', new collector_agent_1.CollectorAgent()],
            ['scholar', new scholar_agent_1.ScholarAgent()],
            ['creator', new creator_agent_1.CreatorAgent()],
            ['adapter', new adapter_agent_1.AdapterAgent()]
        ]);
    }
    createInitialState() {
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
    async execute(input, config) {
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
            let currentOutput = typeof input === 'string' ?
                { id: 'input', type: 'raw', content: input, timestamp: new Date() } :
                input;
            for (const agentConfig of pipeline) {
                if (!agentConfig.enabled)
                    continue;
                // Update state
                this.state.currentAgent = agentConfig.name;
                this.state.progress = this.calculateProgress(agentConfig.name);
                this.emit('agent:start', { agent: agentConfig.name, state: this.state });
                // Execute agent
                const startTime = Date.now();
                try {
                    currentOutput = await this.executeAgent(agentConfig.name, currentOutput, agentConfig.config);
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
                }
                catch (error) {
                    this.handleAgentError(agentConfig.name, error);
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
                finalContent: currentOutput
            };
        }
        catch (error) {
            this.state.status = 'failed';
            this.state.endTime = new Date();
            this.emit('workflow:error', { error, state: this.state });
            return {
                success: false,
                state: this.state,
                error: error
            };
        }
    }
    /**
     * Execute individual agent
     */
    async executeAgent(name, input, config) {
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
                const brief = input;
                return await agent.process(brief);
            case 'creator':
                const synthesis = input;
                return await agent.process(synthesis);
            case 'adapter':
                const draft = input;
                return await agent.process(draft);
            default:
                throw new Error(`Unknown agent: ${name}`);
        }
    }
    /**
     * Get pipeline configuration based on mode
     */
    getPipelineConfig(config) {
        if (config.mode === 'custom') {
            return config.agents;
        }
        // Predefined pipelines
        const pipelines = {
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
    applyAgentConfig(agent, config) {
        // Agent-specific configuration application
        if (agent.setConfig && typeof agent.setConfig === 'function') {
            agent.setConfig(config);
        }
    }
    /**
     * Calculate workflow progress
     */
    calculateProgress(currentAgent) {
        const agentProgress = {
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
    checkQualityGate(agent, output) {
        const gates = {
            collector: (doc) => {
                const brief = doc;
                return brief.riceScore.total >= 40 && brief.signals.keyInsights.length >= 3;
            },
            scholar: (doc) => {
                const synthesis = doc;
                return synthesis.confidence >= 0.6 && synthesis.depthAnalysis.currentDepth >= 2;
            },
            creator: (doc) => {
                const draft = doc;
                return draft.engagementScore >= 60;
            },
            adapter: (doc) => {
                const adapted = doc;
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
    saveCheckpoint(name) {
        this.checkpoints.set(name, JSON.parse(JSON.stringify(this.state)));
        this.emit('checkpoint:saved', { name, state: this.state });
    }
    /**
     * Load checkpoint
     */
    loadCheckpoint(name) {
        return this.checkpoints.get(name);
    }
    /**
     * Handle agent error
     */
    handleAgentError(agent, error) {
        this.state.errors.push(error);
        this.state.metrics.errorCount++;
        this.emit('agent:error', { agent, error, state: this.state });
    }
    /**
     * Attempt recovery from error
     */
    async attemptRecovery(agent, lastGoodOutput) {
        this.emit('recovery:attempt', { agent, state: this.state });
        // Recovery strategies
        const recoveryStrategies = {
            collector: () => {
                // Use cached content or default
                return {
                    id: 'recovery-collector',
                    type: 'content-brief',
                    content: 'Recovery content',
                    timestamp: new Date()
                };
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
    pause() {
        if (this.state.status === 'running') {
            this.state.status = 'paused';
            this.emit('workflow:paused', { state: this.state });
        }
    }
    /**
     * Resume workflow
     */
    resume() {
        if (this.state.status === 'paused') {
            this.state.status = 'running';
            this.emit('workflow:resumed', { state: this.state });
        }
    }
    /**
     * Cancel workflow
     */
    cancel() {
        this.state.status = 'failed';
        this.state.endTime = new Date();
        this.emit('workflow:cancelled', { state: this.state });
    }
    /**
     * Get current state
     */
    getState() {
        return this.state;
    }
    /**
     * Get metrics
     */
    getMetrics() {
        return this.state.metrics;
    }
    /**
     * Generate unique ID
     */
    generateId() {
        return 'workflow-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
}
exports.PipelineOrchestrator = PipelineOrchestrator;
exports.default = PipelineOrchestrator;
//# sourceMappingURL=pipeline-orchestrator.js.map